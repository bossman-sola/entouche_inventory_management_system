import { normalizeHeader, normalizeName } from "./parsers";
export const IMPORT_COLUMNS = {
  
  Items: {
    required: ["Item Name"],
    optional: [
      "Category", "Unit of Measure", "Item Type", "Barcode", "Reorder Level",
      "Unit Cost", "Description", "Brand", "Supplier",
    ],
  },
  
  Users: {
    required: ["Name", "Email", "Role"],
    optional: [],
  },
  
  Inventory: {
    required: ["Asset Tag No", "Asset Description"],
    optional: [
      "S/N", "Equipment Serial Number", "Cost", "Asset Life", "Date Acquired",
      "Manufacturer", "Model Number", "Api Number", "Field Location",
      "Vendor Name", "Delivery Date To Location/Yard", "Status",
      "Invoice Number From Vendor", "Po Number From Vendor",
      "Po Number Issued By Api", "Payment Date", "Notes",
    ],
  },
};


export const REQUIRED_COLUMNS = Object.fromEntries(
  Object.entries(IMPORT_COLUMNS).map(([k, v]) => [k, v.required])
);


export const ALL_COLUMNS = Object.fromEntries(
  Object.entries(IMPORT_COLUMNS).map(([k, v]) => [k, [...v.required, ...v.optional]])
);

export const IMPORT_TYPES = ["Items", "Users", "Inventory"];


export const CREATABLE_TYPES = ["Items", "Inventory", "Users"];

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
 
  ["Cost", "Unit Cost", "Reorder Level", "Email"].forEach(oc => {
    const idx = normalizedHeaders.indexOf(normalizeHeader(oc));
    if (idx !== -1 && !(oc in colIndex)) colIndex[oc] = idx;
  });

  const seenAssetTags = new Set();
  const seenEmails = new Set();
  rows.forEach((row, i) => {
    const rowNum = i + 2;
    Object.entries(colIndex).forEach(([col, idx]) => {
      const value = (row[idx] ?? "").toString().trim();
      const isRequired = required.includes(col);
      if (!value) {
        if (isRequired) {
          errs.push({ row: rowNum, column: col, error: `Missing ${col}`, errorColor: "text-orange-500", value: "(empty)" });
        }
        return;
      }
      if ((col === "Cost" || col === "Unit Cost") && isNaN(Number(value))) {
        errs.push({ row: rowNum, column: col, error: `${col} must be a number`, errorColor: "text-orange-500", value });
      }
      if (col === "Reorder Level" && isNaN(Number(value))) {
        errs.push({ row: rowNum, column: col, error: "Reorder Level must be a number", errorColor: "text-orange-500", value });
      }
      
      if (col === "Asset Tag No" && importType === "Inventory") {
        const key = normalizeName(value);
        if (seenAssetTags.has(key)) errs.push({ row: rowNum, column: col, error: "Duplicate Asset Tag No in file", errorColor: "text-orange-500", value });
        seenAssetTags.add(key);
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
      
    });
  });

  return errs;
}