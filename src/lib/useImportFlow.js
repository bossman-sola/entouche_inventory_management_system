import { useState, useRef } from "react";
import { createItem } from "./api";
import { parseCSV, parseXLSX, normalizeHeader, normalizeName } from "./parsers";
import { validateData, CREATABLE_TYPES } from "./validation";

export function useImportFlow({ currentUser, refData, importType, loadReferenceData }) {
  const [file, setFile] = useState(null);
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [importDone, setImportDone] = useState(false);
  const [history, setHistory] = useState([]); 
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef(null);

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
      setParsedData(p => ({ ...p, valid: Math.max(0, total - errs.length), errors: errs.length }));
    }, 400);
  };

  const cleanRowIndexes = () => {
    const badRows = new Set(errors.filter(e => typeof e.row === "number").map(e => e.row));
    return parsedData.rows.map((_, i) => i).filter(i => !badRows.has(i + 2));
  };

  const handleImport = async () => {
    if (!file || !validated || !CREATABLE_TYPES.includes(importType)) return;
    setImporting(true);
    setImportDone(false);
    const { headers, rows, total } = parsedData;
    const normalizedHeaders = headers.map(normalizeHeader);
    const colIdx = (name) => normalizedHeaders.indexOf(normalizeHeader(name));
    const okRows = cleanRowIndexes();
    let ok = 0;
    const apiErrors = [];

    for (let n = 0; n < okRows.length; n++) {
      const rowI = okRows[n];
      const row = rows[rowI];
      setImportProgress({ current: n + 1, total: okRows.length });
      try {
        if (importType === "Items") {
          const catName = row[colIdx("Category")];
          const unitName = row[colIdx("Unit of Measure")];
          const cat = refData.categories.get(normalizeName(catName));
          const unit = refData.units.get(normalizeName(unitName));
          await createItem({
            name: row[colIdx("Item Name")],
            category_id: cat?.id,
            unit_of_measure_id: unit?.id,
            reorder_level: Number(row[colIdx("Reorder Level")]) || 0,
            item_type: "product",
            status: "active",
          });
        }
        ok++;
      } catch (err) {
        apiErrors.push({ row: rowI + 2, column: "(server)", error: err.message || "Import failed", errorColor: "text-red-500", value: "-" });
      }
    }

    const combinedErrors = [...errors, ...apiErrors];
    setErrors(combinedErrors);
    setImportProgress(null);
    setImporting(false);
    setImportDone(true);

    const fail = total - ok;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: importType,
      file: file.name,
      rec: total,
      ok,
      fail,
      status: ok > 0 ? "Completed" : "Failed",
      by: currentUser?.name || "Unknown",
    };
    setHistory(p => [newEntry, ...p]);
    setFile(null);
    setParsedData(null);
    setValidated(false);
    setErrors([]);
    loadReferenceData(); // refresh live counts (items/users totals) after real writes
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
    file, validated, validating, importing, importProgress, importDone,
    history, parsedData, errors, parseError, fileRef,
    handleFile, handleValidate, handleImport, handleCancel,
  };
}