import { useState, useRef, useEffect, useCallback } from "react";
import { createImport, requestRaw } from "./api";
import { parseCSV, parseXLSX, normalizeHeader, normalizeName } from "./parsers";
import { validateData, CREATABLE_TYPES, genPassword } from "./validation";

function mapApiImportToHistoryEntry(imp) {
  if (!imp) return null;
  const total = imp.total_rows ?? 0;
  const ok = imp.successful_rows ?? 0;
  const fail = imp.failed_rows ?? Math.max(0, total - ok);
  const createdAt = imp.created_at ? new Date(imp.created_at) : null;
  const type = imp.import_type
    ? imp.import_type.charAt(0).toUpperCase() + imp.import_type.slice(1)
    : "Import";
  return {
    id: `api-${imp.id}`,
    date: createdAt
      ? createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    time: createdAt
      ? createdAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    type,
    file: imp.file_name || imp.original_filename || "-",
    rec: total,
    ok,
    fail,
    status: ok > 0 ? "Completed" : "Failed",
    by: imp.creator?.name || imp.user?.name || "Unknown",
  };
}

export function useImportFlow({
  currentUser,
  refData,
  importType,
  loadReferenceData,
  selectedWarehouseId,
  selectedLocationId,
}) {
  const [file, setFile] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [importDone, setImportDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(8);
  const [historyFilter, setHistoryFilter] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef(null);

  const loadHistory = useCallback(
    async (page = historyPage, perPage = historyPerPage, filter = historyFilter) => {
      if (!currentUser) {
        setHistory([]);
        setHistoryMeta(null);
        setHistoryError("");
        return;
      }

      setHistoryLoading(true);
      setHistoryError("");
      try {
        const params = { page, per_page: perPage };
        const normalizedFilter = String(filter || "").trim().toLowerCase();
        if (normalizedFilter) params.import_type = normalizedFilter;

        const raw = await requestRaw("/imports", { params });
        const list = Array.isArray(raw?.data) ? raw.data : [];
        const apiEntries = list.map(mapApiImportToHistoryEntry).filter(Boolean);
        setHistory(apiEntries);
        setHistoryMeta(raw?.meta || null);
      } catch (err) {
        setHistory([]);
        setHistoryMeta(null);
        setHistoryError(err.message || "Unable to load import history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [currentUser, historyPage, historyPerPage, historyFilter],
  );

  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      setHistoryMeta(null);
      setHistoryError("");
      return;
    }

    loadHistory(historyPage, historyPerPage, historyFilter);
  }, [currentUser, historyPage, historyPerPage, historyFilter, loadHistory]);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setValidated(false);
    setImportDone(false);
    setErrors([]);
    setParsedData(null);
    setParseError("");

    const ext = f.name.split(".").pop().toLowerCase();
    try {
      if (ext === "csv") {
        const text = await f.text();
        const { headers, rows } = parseCSV(text);
        setParsedData({ headers, rows, total: rows.length });
      } else if (ext === "xlsx" || ext === "xls") {
        const { headers, rows } = await parseXLSX(f);
        setParsedData({ headers, rows, total: rows.length });
      } else {
        setParseError("Unsupported file type. Please upload a CSV or XLSX file.");
      }
    } catch {
      setParseError("Could not read this file. It may be corrupted or in an unsupported format.");
    }
  };

  const handleValidate = () => {
    if (!file || !parsedData) return;
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setValidated(true);
      const { headers, rows, total } = parsedData;
      const errs = validateData(headers, rows, importType, refData);
      setErrors(errs);
      setParsedData((p) => ({ ...p, valid: Math.max(0, total - errs.length), errors: errs.length }));
    }, 400);
  };

  const cleanRowIndexes = () => {
    const badRows = new Set(errors.filter((e) => typeof e.row === "number").map((e) => e.row));
    return parsedData.rows.map((_, i) => i).filter((i) => !badRows.has(i + 2));
  };

  const handleImport = async () => {
    if (!file || !validated || !CREATABLE_TYPES.includes(importType)) return;
    if (importType === "Inventory" && !selectedWarehouseId) {
      setErrors((prev) => [
        ...prev,
        {
          row: "-",
          column: "(setup)",
          error: "Select a warehouse before importing inventory",
          errorColor: "text-red-500",
          value: "-",
        },
      ]);
      return;
    }

    setImporting(true);
    setImportDone(false);
    const { headers, rows, total } = parsedData;
    const normalizedHeaders = headers.map(normalizeHeader);
    const colIdx = (name) => normalizedHeaders.indexOf(normalizeHeader(name));
    const okRows = cleanRowIndexes();
    let ok = 0;
    let importTotal = total;
    const apiErrors = [];

    try {
      setImportProgress({ current: 1, total: 1 });
      const result = await createImport({
        file,
        importType,
        warehouseId: selectedWarehouseId,
      });
      ok = result.successful_rows || 0;
      importTotal = result.total_rows ?? total;
      (result.errors || []).forEach((e) => {
        apiErrors.push({
          row: e.row_number ?? "-",
          column: e.field || "(server)",
          error: e.error_message || "Import failed",
          errorColor: "text-red-500",
          value: "-",
        });
      });
    } catch (err) {
      apiErrors.push({
        row: "-",
        column: "(server)",
        error: err.message || "Import failed",
        errorColor: "text-red-500",
        value: "-",
      });
    }

    const combinedErrors = [...errors, ...apiErrors];
    setErrors(combinedErrors);
    setImportProgress(null);
    setImporting(false);
    setImportDone(true);

    const fail = importTotal - ok;
    setFile(null);
    setParsedData(null);
    setValidated(false);
    setErrors([]);
    loadReferenceData();

    await loadHistory(1, historyPerPage, historyFilter);
    setHistoryPage(1);
  };

  const handleCancel = () => {
    setFile(null);
    setParsedData(null);
    setValidated(false);
    setErrors([]);
    setImportDone(false);
    setParseError("");
  };

  return {
    file,
    validated,
    validating,
    importing,
    importProgress,
    importDone,
    history,
    historyMeta,
    historyLoading,
    historyError,
    historyPage,
    setHistoryPage,
    historyPerPage,
    setHistoryPerPage,
    historyFilter,
    setHistoryFilter,
    parsedData,
    errors,
    parseError,
    fileRef,
    handleFile,
    handleValidate,
    handleImport,
    handleCancel,
  };
}