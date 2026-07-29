import { normalizeHeader, normalizeName } from "./parsers";


export const REQUIRED_COLUMNS = {
  Items: ["Item Name", "SKU", "Category", "Unit of Measure", "Reorder Level"],
  Users: ["Name", "Email", "Role"],
};

export const IMPORT_TYPES = ["Items", "Users", "Inventory"];


export const CREATABLE_TYPES = ["Items"];

export function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function validateData(headers, rows, importType, refData) {
  const required = REQUIRED_COLUMNS[importType] || [];
  const normalizedHeaders = headers.map(normalizeHeader);
  const errs = [];

  const missingColumns = required.filter(rc => !normalizedHeaders.includes(normalizeHeader(rc)));
  if (missingColumns.length === required.length && required.length > 0) {
    errs.push({ row: "-", column: "(all columns)", error: "File does not match Import Type", errorColor: "text-red-600", value: headers.length ? headers.join(", ") : "(no headers found)" });
    return errs;
  }
  missingColumns.forEach(col => {
    errs.push({ row: "-", column: col, error: "Missing required column", errorColor: "text-red-500", value: "(column not found)" });
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
      // Role is intentionally not cross-checked here - see REQUIRED_COLUMNS
      // comment above.
    });
  });

  return errs;
}