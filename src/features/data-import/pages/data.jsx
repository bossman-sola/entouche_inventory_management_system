import { useState, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";

const BASE_URL = "https://entouche-staging-api-16910c236bc5.herokuapp.com";
const DEFAULT_EMAIL = "admin@inventory.local";
const DEFAULT_PASSWORD = "Admin@1234";

const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  upload: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  x: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  xSmall: "M6 18L18 6M6 6l12 12",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  file: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  fileGreen: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  cloudUp: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  chevronDown: "M19 9l-7 7-7-7",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  plus: "M12 4v16m8-8H4",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  lock: "M19 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15",
};

const TYPE_COLORS = {
  Items: "bg-green-100 text-green-700",
  Users: "bg-purple-100 text-purple-700",
  Inventory: "bg-blue-100 text-blue-700",
};

// Required columns per import type. Category / Unit of Measure / Role are
// resolved against real records fetched from the API, not hardcoded IDs.
const REQUIRED_COLUMNS = {
  Items: ["Item Name", "SKU", "Category", "Unit of Measure", "Reorder Level"],
  Users: ["Name", "Email", "Role"],
};

// Inventory has no create/import endpoint in the API, so it can't be wired
// to anything real — we say so instead of faking a working import for it.
const IMPORT_TYPES = ["Items", "Users", "Inventory"];

function normalizeHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/[\s_-]+/g, " ");
}
function normalizeName(s) {
  return String(s || "").trim().toLowerCase();
}

function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map(l => l.split(",").map(c => c.trim().replace(/"/g, "")));
  return { headers, rows };
}

function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
        const headers = (grid[0] || []).map(h => String(h));
        const rows = grid.slice(1).map(r => headers.map((_, i) => (r[i] === undefined ? "" : String(r[i]))));
        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Row-level validation against the columns required for the selected import
// type, cross-checked against real Categories / Units / Roles pulled from
// the API so a row referencing "Electronics" only passes if that category
// actually exists in the system.
function validateData(headers, rows, importType, refData) {
  const required = REQUIRED_COLUMNS[importType] || [];
  const normalizedHeaders = headers.map(normalizeHeader);
  const errs = [];

  const missingColumns = required.filter(rc => !normalizedHeaders.includes(normalizeHeader(rc)));
  if (missingColumns.length === required.length && required.length > 0) {
    errs.push({ row: "—", column: "(all columns)", error: "File does not match Import Type", errorColor: "text-red-600", value: headers.length ? headers.join(", ") : "(no headers found)" });
    return errs;
  }
  missingColumns.forEach(col => {
    errs.push({ row: "—", column: col, error: "Missing required column", errorColor: "text-red-500", value: "(column not found)" });
  });

  const colIndex = {};
  required.forEach(rc => {
    const idx = normalizedHeaders.indexOf(normalizeHeader(rc));
    if (idx !== -1) colIndex[rc] = idx;
  });

  const seenSKUs = new Set();
  const seenEmails = new Set();
  rows.forEach((row, i) => {
    const rowNum = i + 2;
    Object.entries(colIndex).forEach(([col, idx]) => {
      const value = (row[idx] ?? "").toString().trim();
      if (!value) {
        errs.push({ row: rowNum, column: col, error: `Missing ${col}`, errorColor: "text-orange-500", value: "(empty)" });
        return;
      }
      if (col === "SKU") {
        if (seenSKUs.has(value)) errs.push({ row: rowNum, column: col, error: "Duplicate SKU in file", errorColor: "text-orange-500", value });
        seenSKUs.add(value);
      }
      if (col === "Reorder Level" && isNaN(Number(value))) {
        errs.push({ row: rowNum, column: col, error: "Reorder Level must be a number", errorColor: "text-orange-500", value });
      }
      if (col === "Category" && refData.categories && !refData.categories.has(normalizeName(value))) {
        errs.push({ row: rowNum, column: col, error: "Category not found in system", errorColor: "text-red-500", value });
      }
      if (col === "Unit of Measure" && refData.units && !refData.units.has(normalizeName(value))) {
        errs.push({ row: rowNum, column: col, error: "Unit not found in system", errorColor: "text-red-500", value });
      }
      if (col === "Email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errs.push({ row: rowNum, column: col, error: "Invalid email format", errorColor: "text-orange-500", value });
        } else if (seenEmails.has(value)) {
          errs.push({ row: rowNum, column: col, error: "Duplicate email in file", errorColor: "text-orange-500", value });
        } else if (refData.userEmails && refData.userEmails.has(value.toLowerCase())) {
          errs.push({ row: rowNum, column: col, error: "User already exists", errorColor: "text-orange-500", value });
        }
        seenEmails.add(value);
      }
      if (col === "Role" && refData.roles && !refData.roles.has(normalizeName(value))) {
        errs.push({ row: rowNum, column: col, error: "Role not found in system", errorColor: "text-red-500", value });
      }
    });
  });

  return errs;
}

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function apiFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch { /* non-JSON response */ }
  if (!res.ok || json.success === false) {
    const msg = json?.errors ? Object.values(json.errors).flat().join(" ") : (json?.message || `Request failed (${res.status})`);
    throw new Error(msg);
  }
  return json;
}

// Fetches every page of a paginated list endpoint.
async function fetchAllPages(path, token) {
  let page = 1, lastPage = 1;
  const all = [];
  do {
    const json = await apiFetch(`${path}${path.includes("?") ? "&" : "?"}page=${page}`, { token });
    all.push(...(json.data || []));
    lastPage = json.meta?.last_page || 1;
    page++;
  } while (page <= lastPage);
  return all;
}

export default function DataImportPage() {
  // --- Auth ---
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting"); // connecting | ok | error
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState(DEFAULT_EMAIL);
  const [loginPassword, setLoginPassword] = useState(DEFAULT_PASSWORD);

  // --- Reference data pulled live from the API ---
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [roles, setRoles] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(null);
  const [usersTotal, setUsersTotal] = useState(null);
  const [refLoading, setRefLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setAuthStatus("connecting");
    setAuthError("");
    try {
      const json = await apiFetch("/api/v1/auth/login", { method: "POST", body: { email, password } });
      setToken(json.data.access_token);
      setCurrentUser(json.data.user);
      setAuthStatus("ok");
    } catch (err) {
      setAuthStatus("error");
      setAuthError(err.message || "Could not reach the API");
    }
  }, []);

  useEffect(() => { login(DEFAULT_EMAIL, DEFAULT_PASSWORD); }, [login]);

  const loadReferenceData = useCallback(async () => {
    if (!token) return;
    setRefLoading(true);
    try {
      const [cats, uns, rolesJson, usersList, itemsJson, usersJson] = await Promise.all([
        fetchAllPages("/api/v1/categories", token),
        fetchAllPages("/api/v1/units", token),
        apiFetch("/api/v1/roles", { token }),
        fetchAllPages("/api/v1/users", token),
        apiFetch("/api/v1/items?per_page=1", { token }),
        apiFetch("/api/v1/users?per_page=1", { token }),
      ]);
      setCategories(cats);
      setUnits(uns);
      setRoles(rolesJson.data || []);
      setExistingUsers(usersList);
      setItemsTotal(itemsJson.meta?.total ?? null);
      setUsersTotal(usersJson.meta?.total ?? null);
    } catch (err) {
      setAuthError(err.message || "Failed to load reference data");
    } finally {
      setRefLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) loadReferenceData(); }, [token, loadReferenceData]);

  const refData = {
    categories: new Map(categories.map(c => [normalizeName(c.name), c])),
    units: new Map(units.map(u => [normalizeName(u.name), u])),
    roles: new Map(roles.map(r => [normalizeName(r.name.replace(/_/g, " ")), r])),
    userEmails: new Set(existingUsers.map(u => u.email.toLowerCase())),
  };

  // --- Import flow state ---
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importType, setImportType] = useState("Items");
  const [location, setLocation] = useState("Storage Area");
  const [fileFormat, setFileFormat] = useState("CSV");
  const [encoding, setEncoding] = useState("UTF-8");
  const [validated, setValidated] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);
  const [importDone, setImportDone] = useState(false);
  const [history, setHistory] = useState([]); // session-only: real results from real API calls
  const [historyFilter, setHistoryFilter] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [parsedData, setParsedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [parseError, setParseError] = useState("");
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const fileRef = useRef(null);
  const PER_PAGE = 8;

  const successCount = history.filter(h => h.status === "Completed").length;
  const failedCount = history.filter(h => h.status === "Failed").length;

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
    } catch (err) {
      setParseError("Could not read this file. It may be corrupted or in an unsupported format.");
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) handleFile(f);
  }, []);

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

  // Rows that have no validation error against them, keyed by row number (i+2).
  const cleanRowIndexes = () => {
    const badRows = new Set(errors.filter(e => typeof e.row === "number").map(e => e.row));
    return parsedData.rows.map((_, i) => i).filter(i => !badRows.has(i + 2));
  };

  const handleImport = async () => {
    if (!file || !validated || !token || importType === "Inventory") return;
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
          await apiFetch("/api/v1/items", {
            token, method: "POST",
            body: {
              name: row[colIdx("Item Name")],
              category_id: cat?.id,
              unit_of_measure_id: unit?.id,
              reorder_level: Number(row[colIdx("Reorder Level")]) || 0,
              item_type: "product",
              status: "active",
            },
          });
        } else if (importType === "Users") {
          const roleName = row[colIdx("Role")];
          const role = refData.roles.get(normalizeName(roleName));
          await apiFetch("/api/v1/users", {
            token, method: "POST",
            body: {
              name: row[colIdx("Name")],
              email: row[colIdx("Email")],
              password: genPassword(),
              status: "active",
              roles: role ? [role.name] : [],
            },
          });
        }
        ok++;
      } catch (err) {
        apiErrors.push({ row: rowI + 2, column: "(server)", error: err.message || "Import failed", errorColor: "text-red-500", value: "—" });
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

  const downloadTemplate = (name) => {
    const csvContent = name === "Items Template"
      ? "Item Name,SKU,Category,Unit of Measure,Reorder Level\nSample Item,ITM-001,Electronics,pcs,10"
      : name === "Users Template"
        ? "Name,Email,Role\nJohn Doe,john@example.com,Inventory Officer"
        : "Item,Quantity,Location,Cost\nSample Item,100,Storage Area,5000";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(" ", "_") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = historyFilter ? history.filter(h => h.type === historyFilter) : history;
  const historyPages = Math.max(1, Math.ceil(filteredHistory.length / PER_PAGE));
  const visibleHistory = filteredHistory.slice((historyPage - 1) * PER_PAGE, historyPage * PER_PAGE);

  const successRate = history.length > 0 ? ((successCount / history.length) * 100).toFixed(1) : "0.0";
  const failRate = history.length > 0 ? ((failedCount / history.length) * 100).toFixed(1) : "0.0";

  const lastImportOf = (type) => {
    const last = history.find(h => h.type === type && h.status === "Completed");
    return last ? `Last: ${last.date}` : "No imports yet";
  };

  const IMPORT_CATEGORIES = [
    { title: "Items Import", icon: icons.fileGreen, iconColor: "text-green-500", iconBg: "bg-green-50", fields: REQUIRED_COLUMNS.Items, ready: true, count: itemsTotal, countLabel: "items in system" },
    { title: "Users Import", icon: icons.file, iconColor: "text-purple-500", iconBg: "bg-purple-50", fields: REQUIRED_COLUMNS.Users, ready: true, count: usersTotal, countLabel: "users in system" },
    { title: "Inventory Import", icon: icons.file, iconColor: "text-blue-500", iconBg: "bg-blue-50", fields: ["Item", "Quantity", "Location", "Cost"], ready: false, count: null, countLabel: "" },
  ];

  const isAuthed = authStatus === "ok" && token;

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-2 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Data Import</h1>
          <p className="text-sm text-gray-500 mt-0.5">Import initial data into the system. Download templates, upload your files and validate before importing.</p>
        </div>
        <button onClick={() => setGuidelinesOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
          <Icon d={icons.book} size={14} /> Import Guidelines
        </button>
      </div>

      {/* Connection status */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        {authStatus === "connecting" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" /></svg>
            Connecting to API…
          </span>
        )}
        {isAuthed && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected as {currentUser?.name}
            {refLoading && <span className="text-green-500">· syncing…</span>}
          </span>
        )}
        {authStatus === "error" && (
          <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-wrap">
            <Icon d={icons.alert} size={13} /> {authError || "Could not connect to the API."}
            <button onClick={() => login(loginEmail, loginPassword)} className="ml-1 underline">Retry</button>
          </div>
        )}
      </div>

      {!isAuthed && authStatus === "error" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><Icon d={icons.lock} size={15} /> Sign in to the API</p>
          <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" className="w-full mb-2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="Password" className="w-full mb-3 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => login(loginEmail, loginPassword)} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Connect</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Imports", value: history.length, sub: "This session", subColor: "text-gray-500", icon: icons.upload, bg: "bg-blue-50", color: "text-blue-500" },
          { label: "Successful Imports", value: successCount, sub: `${successRate}% success rate`, subColor: "text-green-600", icon: icons.check, bg: "bg-green-50", color: "text-green-500" },
          { label: "Failed Imports", value: failedCount, sub: `${failRate}% failure rate`, subColor: "text-red-500", icon: icons.x, bg: "bg-red-50", color: "text-red-500" },
          { label: "Items in System", value: itemsTotal ?? "—", sub: usersTotal != null ? `${usersTotal} users total` : "Live from API", subColor: "text-orange-500", icon: icons.clock, bg: "bg-orange-50", color: "text-orange-500" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon d={s.icon} size={18} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className={`text-xs font-medium mt-0.5 truncate ${s.subColor}`}>{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left column */}
        <div className="w-full lg:w-[560px] shrink-0 space-y-4">
          {/* Import Templates */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Import Templates</h2>
            <p className="text-xs text-gray-500 mb-4">Download templates to ensure your data is formatted correctly.</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { name: "Items Template", sub: "XLSX, CSV", icon: icons.fileGreen, bg: "bg-green-50", color: "text-green-500" },
                { name: "Users Template", sub: "XLSX, CSV", icon: icons.file, bg: "bg-purple-50", color: "text-purple-500" },
                { name: "Inventory Template", sub: "XLSX, CSV", icon: icons.file, bg: "bg-blue-50", color: "text-blue-500" },
              ].map(t => (
                <button key={t.name} onClick={() => downloadTemplate(t.name)}
                  className="flex flex-col items-center gap-2 p-2.5 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${t.bg} flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon d={t.icon} size={20} className={t.color} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 text-center">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* New Import */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h2 className="font-semibold text-gray-800 mb-1">New Import</h2>
            <p className="text-xs text-gray-500 mb-4">Upload your file and configure import settings.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Drop zone */}
              <div className="flex-1 min-w-0">
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => !file && fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 px-4 transition-all cursor-pointer ${isDragging ? "border-blue-400 bg-blue-50" : file ? "border-gray-200 bg-gray-50 cursor-default" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"}`}
                >
                  {!file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <Icon d={icons.cloudUp} size={22} className="text-blue-500" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 text-center">Drag & drop your file here</p>
                      <p className="text-xs text-gray-400 mt-1">CSV or XLSX files supported</p>
                      <button
                        onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Browse Files
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
                        <Icon d={icons.fileGreen} size={20} className="text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleCancel(); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                          <Icon d={icons.xSmall} size={14} />
                        </button>
                      </div>
                      {!validated && (
                        <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }} className="mt-2 text-xs text-blue-600 hover:underline w-full text-center">
                          Change file
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />

                {importType === "Inventory" && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                    <Icon d={icons.info} size={16} className="text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700">Inventory import isn't wired up yet — the API doesn't expose an endpoint for it.</p>
                  </div>
                )}

                {parseError && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    <Icon d={icons.alert} size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{parseError}</p>
                  </div>
                )}

                {/* Validation Summary */}
                {validated && parsedData && (
                  <div className="mt-3 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                      <p className="text-sm font-semibold text-gray-800">Validation Summary</p>
                      <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${errors.length ? "text-orange-600" : "text-green-600"}`}>
                        <Icon d="M5 13l4 4L19 7" size={13} strokeWidth={2.5} /> Validation completed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      {[
                        { label: "Total Rows", value: parsedData.total, color: "text-gray-800" },
                        { label: "Valid Rows", value: parsedData.valid, color: "text-green-600" },
                        { label: "Errors", value: parsedData.errors, color: "text-red-500" },
                        { label: "Warnings", value: 0, color: "text-gray-800" },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-lg py-2 px-1">
                          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {parsedData.errors > 0 && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <Icon d={icons.alert} size={12} /> Please review the errors below before importing.
                      </p>
                    )}
                  </div>
                )}

                {/* Import Errors */}
                {validated && errors.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <p className="text-sm font-semibold text-gray-800">Import Errors ({errors.length})</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Rows marked "(server)" failed the real API call during import.</p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full min-w-[420px]">
                          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                            <tr>
                              {["Row", "Column", "Error", "Value Found"].map(h => (
                                <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {errors.map((e, i) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors">
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <Icon d={icons.x} size={14} className="text-red-500" />
                                    <span className="text-sm font-medium text-gray-800">{e.row}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-sm text-gray-700 whitespace-nowrap">{e.column}</td>
                                <td className={`py-2 px-3 text-sm font-medium whitespace-nowrap ${e.errorColor}`}>{e.error}</td>
                                <td className="py-2 px-3 text-sm text-gray-500 whitespace-nowrap max-w-[180px] truncate" title={e.value}>{e.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parsed preview */}
                {validated && parsedData?.headers?.length > 0 && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-32 overflow-auto">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Data Preview (first 3 rows)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs min-w-[320px]">
                        <thead>
                          <tr>{parsedData.headers.map((h, i) => <th key={i} className="text-left py-1 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {parsedData.rows.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-t border-gray-200">
                              {row.map((cell, j) => <td key={j} className="py-1 px-2 text-gray-700 whitespace-nowrap">{cell || "—"}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {file && parsedData && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">Cancel</button>
                    {!validated ? (
                      <button onClick={handleValidate} disabled={validating || !isAuthed} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors">
                        {validating ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" /></svg> Validating...</>
                        ) : "Validate File"}
                      </button>
                    ) : (
                      <button onClick={handleImport} disabled={importing || importType === "Inventory" || errors.length >= (parsedData?.total || 0)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
                        {importing ? (
                          <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40 20" /></svg> Importing {importProgress ? `${importProgress.current}/${importProgress.total}` : "..."}</>
                        ) : "Import Valid Data"}
                      </button>
                    )}
                  </div>
                )}

                {importDone && (
                  <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} className="text-green-600 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Import finished — records were written to the live API.</p>
                  </div>
                )}
              </div>

              {/* Import Configuration */}
              <div className="w-full sm:w-56 shrink-0">
                <p className="text-sm font-semibold text-gray-800 mb-3">Import Configuration</p>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                  {[
                    { label: "Import Type", value: importType, setter: setImportType, options: IMPORT_TYPES },
                    { label: "Default Location", value: location, setter: setLocation, options: ["Storage Area", "Receiving Area", "Dispatch Area", "Damaged Goods Area"] },
                    { label: "File Format", value: fileFormat, setter: setFileFormat, options: ["CSV", "XLSX"] },
                    { label: "Character Encoding", value: encoding, setter: setEncoding, options: ["UTF-8", "UTF-16", "ASCII", "ISO-8859-1"] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <div className="relative">
                        <select value={f.value} onChange={e => { f.setter(e.target.value); handleCancel(); }} className="appearance-none w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-7">
                          {f.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                        <Icon d={icons.chevronDown} size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Import Categories */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-4 gap-3">
              <div>
                <h2 className="font-semibold text-gray-800">Import Categories</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose the type of data you want to import.</p>
              </div>
              <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                <Icon d={icons.plus} size={13} /> New Import
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {IMPORT_CATEGORIES.map(c => (
                <div key={c.title} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
                    <Icon d={c.icon} size={20} className={c.iconColor} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">{c.title}</p>
                  <ul className="space-y-0.5 mb-3">
                    {c.fields.map(f => (
                      <li key={f} className="text-xs text-gray-500 flex items-center gap-1">
                        <Icon d="M5 13l4 4L19 7" size={11} strokeWidth={2.5} className="text-green-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  {c.ready && c.count != null && (
                    <p className="text-xs text-gray-400 mb-2">{c.count} {c.countLabel}</p>
                  )}
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    {c.ready ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />No API endpoint
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{c.ready ? lastImportOf(c.title.split(" ")[0]) : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import History */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-3">
              <div>
                <h2 className="font-semibold text-gray-800">Import History</h2>
                <p className="text-xs text-gray-500 mt-0.5">Real imports performed this session, written to the live API.</p>
              </div>
              <div className="relative">
                <select value={historyFilter} onChange={e => { setHistoryFilter(e.target.value); setHistoryPage(1); }} className="appearance-none w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">All Types</option>
                  <option>Items</option>
                  <option>Users</option>
                </select>
                <Icon d={icons.chevronDown} size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date & Time", "Type", "File Name", "Rec.", "OK", "Fail", "Status", "Imported By"].map(h => (
                      <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 px-3 text-center text-sm text-gray-400">No imports yet this session — run one above to see it here.</td></tr>
                  ) : visibleHistory.map(h => (
                    <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-800">{h.date}</p>
                        <p className="text-xs text-gray-400">{h.time}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${TYPE_COLORS[h.type] || "bg-gray-100 text-gray-600"}`}>{h.type}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600 max-w-[120px]">
                        <span className="truncate block" title={h.file}>{h.file}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700 font-medium">{h.rec}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-green-600">{h.ok}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-red-500">{h.fail || 0}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${h.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{h.status}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{h.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500 text-center sm:text-left">Showing {filteredHistory.length === 0 ? 0 : (historyPage - 1) * PER_PAGE + 1} to {Math.min(historyPage * PER_PAGE, filteredHistory.length)} of {filteredHistory.length} imports</p>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                  <Icon d={icons.chevronLeft} size={13} />
                </button>
                {Array.from({ length: historyPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setHistoryPage(n)} className={`w-7 h-7 text-sm rounded ${historyPage === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
                ))}
                <button onClick={() => setHistoryPage(p => Math.min(historyPages, p + 1))} disabled={historyPage === historyPages} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                  <Icon d={icons.chevronRight} size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Modal */}
      {guidelinesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setGuidelinesOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Import Guidelines</h2>
              <button onClick={() => setGuidelinesOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
                <Icon d={icons.xSmall} size={16} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {[
                { title: "1. Download Template", desc: "Always start by downloading the appropriate template for your data type (Items or Users). This ensures your data is in the correct format." },
                { title: "2. Prepare Your Data", desc: "Fill in the template with your data. Category, Unit of Measure and Role values must match records that already exist in the system — they're checked against the live API during validation." },
                { title: "3. Upload Your File", desc: "Drag and drop your file into the upload area, or click 'Browse Files'. Only CSV and XLSX files are supported." },
                { title: "4. Validate Before Importing", desc: "Click 'Validate File' to check for errors. Review any validation errors and fix them in your file before proceeding." },
                { title: "5. Import Valid Data", desc: "Once validation is complete, click 'Import Valid Data'. Each valid row is sent to the live API individually; rows with errors are skipped." },
                { title: "Notes", desc: "• Inventory import has no backing API endpoint yet, so it's disabled\n• New users get a randomly generated temporary password\n• Item SKUs are assigned automatically by the system" },
              ].map(g => (
                <div key={g.title}>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{g.title}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}