import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import {
  X,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  FileSpreadsheet,
  Trash2,
  Info,
  Loader2,
} from "lucide-react";
import {
  useInventoryApi,
  DEFAULT_EMAIL,
  DEFAULT_PASSWORD,
} from "../../../lib/useInventoryApi";
import { useImportFlow } from "../../../lib/useImportFlow";


import {
  UNIT_TYPES,
  UNIT_REFERENCE_DATA,
  findUnitReference,
  getUnitType,
} from "../types/itemTypes";
import { NewImportPanel } from "../../data-import/components/NewImportPanel";

const ACCEPTED_EXTENSIONS = ["csv", "xlsx", "xls"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUIRED_FIELDS = ["name", "category", "unit", "unitType"];
const ITEM_STATUSES = ["Active", "Inactive"];

const FIELD_LABELS = {
  name: "Item Name",
  category: "Category",
  unit: "Unit",
  unitType: "Unit Type",
};

// Maps whatever the spreadsheet's header row says to the internal field keys.
// Add more aliases here if your template uses different column names.
const HEADER_ALIASES = {
  "item name": "name",
  name: "name",
  category: "category",
  "unit of measure": "unit",
  unit: "unit",
  uom: "unit",
  "unit type": "unitType",
  "item type": "unitType",
  type: "unitType",
  barcode: "barcode",
  sku: "sku",
  brand: "brand",
  "unit cost": "unitCost",
  "selling price": "sellingPrice",
  "reorder level": "reorderLevel",
  status: "itemStatus",
};

const STATUS_STYLES = {
  Valid: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Invalid: "bg-rose-50 text-rose-500 border-rose-100",
  Duplicate: "bg-amber-50 text-amber-600 border-amber-100",
  Empty: "bg-slate-100 text-slate-400 border-slate-200",
};

const normalizeHeader = (h) =>
  String(h || "")
    .trim()
    .toLowerCase();

const normalizeRow = (rawRow) => {
  const out = {};
  Object.entries(rawRow).forEach(([key, value]) => {
    const mapped = HEADER_ALIASES[normalizeHeader(key)];
    if (mapped)
      out[mapped] = typeof value === "string" ? value.trim() : (value ?? "");
  });
  return out;
};

const parseCsv = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });

const parseExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

const parseFile = (file) => {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "csv") return parseCsv(file);
  if (ext === "xlsx" || ext === "xls") return parseExcel(file);
  return Promise.reject(new Error("Unsupported file type."));
};

// // Validates every parsed row against required fields, known categories/units,
// // and duplicate barcodes/SKUs (both within the file and against what's
// // already in your inventory, if you pass existingBarcodes/existingSkus in).
// const validateRows = (
//   rawRows,
//   { categories, units, existingBarcodes, existingSkus },
// ) => {
//   const categoryNames = new Set(categories.map((c) => c.name.toLowerCase()));
//   const unitNames = new Set(units.map((u) => u.name.toLowerCase()));
//   const existingBarcodeSet = new Set(
//     existingBarcodes.map((b) => (b || "").toLowerCase()).filter(Boolean),
//   );
//   const existingSkuSet = new Set(
//     existingSkus.map((s) => (s || "").toLowerCase()).filter(Boolean),
//   );

//   const normalized = rawRows.map(normalizeRow);

//   const barcodeCounts = {};
//   const skuCounts = {};
//   normalized.forEach((r) => {
//     if (r.barcode)
//       barcodeCounts[r.barcode.toLowerCase()] =
//         (barcodeCounts[r.barcode.toLowerCase()] || 0) + 1;
//     if (r.sku)
//       skuCounts[r.sku.toLowerCase()] =
//         (skuCounts[r.sku.toLowerCase()] || 0) + 1;
//   });

//   const rows = normalized.map((r, idx) => {
//     const rowNum = idx + 2; // +2: 1-indexed, plus the header row
//     const isEmpty = Object.values(r).every((v) => !v);
//     if (isEmpty) {
//       return { id: rowNum, ...r, status: "Empty", errors: [] };
//     }

//     const hardErrors = [];
//     REQUIRED_FIELDS.forEach((field) => {
//       if (!r[field]) hardErrors.push(`${FIELD_LABELS[field]} is required.`);
//     });

//     if (
//       r.unitType &&
//       !UNIT_TYPES.some((t) => t.toLowerCase() === r.unitType.toLowerCase())
//     ) {
//       hardErrors.push(`Unit type must be one of: ${UNIT_TYPES.join(", ")}.`);
//     }
//     // Status is optional — blank means Active — but if something was
//     // entered, it must be one of the known values.
//     if (
//       r.itemStatus &&
//       !ITEM_STATUSES.some((s) => s.toLowerCase() === r.itemStatus.toLowerCase())
//     ) {
//       hardErrors.push(`Status must be one of: ${ITEM_STATUSES.join(", ")}.`);
//     }
//     if (
//       r.category &&
//       categories.length &&
//       !categoryNames.has(r.category.toLowerCase())
//     ) {
//       hardErrors.push(`Category "${r.category}" does not exist.`);
//     }
//     if (r.unit && units.length && !unitNames.has(r.unit.toLowerCase())) {
//       hardErrors.push(`Unit "${r.unit}" does not exist.`);
//     }
//     // Cross-check: does the given Unit actually belong to the given Unit
//     // Type per the reference table (e.g. "Piece" really is a Count unit)?
//     if (r.unit && r.unitType) {
//       // The Unit column may be "Piece (PCS)" or just "Piece" - try the
//       // name portion before any parenthesis first, then the raw value.
//       const unitNamePart = r.unit.replace(/\s*\(.*\)\s*$/, "").trim();
//       const resolvedType = getUnitType(unitNamePart) || getUnitType(r.unit);
//       if (
//         resolvedType &&
//         resolvedType.toLowerCase() !== r.unitType.toLowerCase()
//       ) {
//         hardErrors.push(
//           `Unit "${r.unit}" is a ${resolvedType} unit, not ${r.unitType}.`,
//         );
//       }
//     }

//     const duplicateErrors = [];
//     if (r.barcode) {
//       if (barcodeCounts[r.barcode.toLowerCase()] > 1)
//         duplicateErrors.push("Duplicate barcode in file.");
//       else if (existingBarcodeSet.has(r.barcode.toLowerCase()))
//         duplicateErrors.push("Barcode already exists in inventory.");
//     }
//     if (r.sku) {
//       if (skuCounts[r.sku.toLowerCase()] > 1)
//         duplicateErrors.push("Duplicate SKU in file.");
//       else if (existingSkuSet.has(r.sku.toLowerCase()))
//         duplicateErrors.push("SKU already exists in inventory.");
//     }

//     const errors = [...hardErrors, ...duplicateErrors];
//     const status = hardErrors.length
//       ? "Invalid"
//       : duplicateErrors.length
//         ? "Duplicate"
//         : "Valid";

//     // Normalize to canonical casing now that we know it's one of the
//     // allowed values (or blank, which defaults to Active).
//     const normalizedItemStatus = r.itemStatus
//       ? ITEM_STATUSES.find(
//           (s) => s.toLowerCase() === r.itemStatus.toLowerCase(),
//         ) || r.itemStatus
//       : "Active";

//     return {
//       id: rowNum,
//       ...r,
//       itemStatus: normalizedItemStatus,
//       status,
//       errors,
//     };
//   });

//   return {
//     rows,
//     total: rows.length,
//     valid: rows.filter((r) => r.status === "Valid").length,
//     invalid: rows.filter((r) => r.status === "Invalid").length,
//     duplicates: rows.filter((r) => r.status === "Duplicate").length,
//     empty: rows.filter((r) => r.status === "Empty").length,
//   };
// };

// Builds the downloadable import template as a real .xlsx workbook (not
// CSV) so we can have bold header text and actual dropdown menus on the
// Category, Unit, and Unit Type columns - neither is possible in plain
// CSV. Category/Unit dropdown options come from whatever the account
// already has; Unit Type always comes from the fixed reference table.
const downloadTemplate = async (categories = [], units = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Items");
  // Hidden sheet holding the dropdown source lists - data validation
  // "list" formulae need cell ranges, not just inline literals, once the
  // options get long (30 units across 5 types).
  const listSheet = workbook.addWorksheet("Lists");
  listSheet.state = "veryHidden";

  const headers = [
    "Item Name",
    "Category",
    "Unit",
    "Unit Type",
    "Barcode",
    "SKU",
    "Brand",
    "Unit Cost",
    "Selling Price",
    "Reorder Level",
    "Status",
  ];
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [
    { width: 22 },
    { width: 22 },
    { width: 20 },
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 12 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
  ];

  // // One example row per Unit Type, matching the reference table.
  // const sampleRows = [
  //   [
  //     "Wireless Mouse",
  //     "Computer Accessories",
  //     "Piece (PCS)",
  //     "Count",
  //     "8901234567890",
  //     "",
  //     "Logitech",
  //     10.0,
  //     15.0,
  //     10,
  //     "Active",
  //   ],
  //   [
  //     "Printer Paper",
  //     "Office Supplies",
  //     "Ream (RM)",
  //     "Count",
  //     "",
  //     "",
  //     "Double A",
  //     3.5,
  //     5.0,
  //     20,
  //     "Active",
  //   ],
  //   [
  //     "Diesel",
  //     "Fuel",
  //     "Liter (L)",
  //     "Volume",
  //     "",
  //     "",
  //     "",
  //     0.9,
  //     1.2,
  //     100,
  //     "Active",
  //   ],
  //   [
  //     "Electrical Cable",
  //     "Electrical Supplies",
  //     "Meter (m)",
  //     "Length",
  //     "",
  //     "",
  //     "",
  //     1.2,
  //     1.8,
  //     50,
  //     "Active",
  //   ],
  //   [
  //     "Steel Rod",
  //     "Construction Materials",
  //     "Kilogram (kg)",
  //     "Weight",
  //     "",
  //     "",
  //     "",
  //     2.0,
  //     3.0,
  //     200,
  //     "Active",
  //   ],
  // ];
  // sampleRows.forEach((row) => sheet.addRow(row));

  const categoryNames = categories.map((c) => c.name).filter(Boolean);
  // If the account has no units yet, fall back to the full reference
  // table so the dropdown isn't empty on a brand-new install.
  const unitLabels = units.length
    ? units.map((u) => `${u.name} (${(u.abbreviation || "").toUpperCase()})`)
    : UNIT_REFERENCE_DATA.map((u) => `${u.name} (${u.symbol})`);

  const writeListColumn = (colIndex, values) => {
    values.forEach((value, i) => {
      listSheet.getCell(i + 1, colIndex).value = value;
    });
  };
  writeListColumn(1, categoryNames);
  writeListColumn(2, unitLabels);
  writeListColumn(3, UNIT_TYPES);

  const LAST_ROW = 500; // enough rows for a large bulk import
  const applyListValidation = (columnLetter, listColumnLetter, count) => {
    if (!count) return;
    for (let row = 2; row <= LAST_ROW; row++) {
      sheet.getCell(`${columnLetter}${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [
          `Lists!$${listColumnLetter}$1:$${listColumnLetter}$${count}`,
        ],
      };
    }
  };
  applyListValidation("B", "A", categoryNames.length); // Category
  applyListValidation("C", "B", unitLabels.length); // Unit
  applyListValidation("D", "C", UNIT_TYPES.length); // Unit Type

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "item-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ImportItems = ({
  isOpen,
  onClose,
  onImportComplete, // async (validRows) => void - do the actual bulk-create API call here
  categories = [],
  units = [],
  existingBarcodes = [],
  existingSkus = [],
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importedCount, setImportedCount] = useState(0);
  const [templateError, setTemplateError] = useState(null);
  const fileInputRef = useRef(null);

  const [fileFormat, setFileFormat] = useState("CSV");
  const [encoding, setEncoding] = useState("UTF-8");

  const {
    currentUser,
    authStatus,
    authError,
    login,
    refData,
    warehouses,
    itemsTotal,
    usersTotal,
    refLoading,
    loadReferenceData,
  } = useInventoryApi();

  const importFile = useImportFlow({
    currentUser,
    refData,
    importType: "Items",
    loadReferenceData,
  });
  const { history, fileRef } = importFile;

  const isAuthed = authStatus === "ok" && !!currentUser;
  const successCount = history.filter((h) => h.status === "Completed").length;
  const failedCount = history.filter((h) => h.status === "Failed").length;

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setTemplateError(null);
    try {
      await downloadTemplate(categories, units);
    } catch {
      setTemplateError(
        "Couldn't generate the template file. Please try again.",
      );
    }
  };

  const validateAndSetFile = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError(
        "Unsupported file type. Please upload a .csv or .xlsx file.",
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File is too large. Max size is 10MB.");
      return;
    }
    setFileError(null);
    setValidation(null);
    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (currentStep !== 1) return;
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidation(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetState = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setValidation(null);
    setFileError(null);
    setStatusFilter("all");
    setImportError(null);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const runValidation = async () => {
    console.log("Validating");
    if (!selectedFile) return;
    setIsValidating(true);
    setCurrentStep(2);

    try {
      const rawRows = await parseFile(selectedFile);
      if (!rawRows.length) {
        setFileError("This file has no data rows.");
        setCurrentStep(1);
        return;
      }

      console.log("Raw Rows", rawRows);
      // const importResponse = useImportFlow({
      //   currentUser,
      //   refData,
      //   importType: 'items',
      //   loadReferenceData,
      // });

      console.log("importResponse Response", importResponse);
      setCurrentStep(3);
    } catch (e) {
      console.error(e);
      setFileError(
        "Couldn't read this file. Please check the format and try again.",
      );
      setCurrentStep(1);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!validation || validation.valid === 0) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const validRows = validation.rows
        .filter((r) => r.status === "Valid")
        .map((r) => ({
          name: r.name,
          category: r.category,
          unit: r.unit,
          unitType: r.unitType,
          barcode: r.barcode || null,
          sku: r.sku || null,
          brand: r.brand || null,
          unitCost: r.unitCost || null,
          sellingPrice: r.sellingPrice || null,
          reorderLevel: r.reorderLevel || null,
          // 'Active' or 'Inactive', already validated/normalized above.
          // Every item is created Active by the API regardless of this
          // value — whatever implements onImportComplete is responsible
          // for calling itemsApi.toggleItemStatus(id) right after
          // creation for any row where itemStatus === 'Inactive'.
          itemStatus: r.itemStatus,
        }));

      if (onImportComplete) await onImportComplete(validRows);

      setImportedCount(validRows.length);
      setCurrentStep(4);
    } catch (err) {
      setImportError(
        err?.response?.data?.message || "Import failed. Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const filteredRows = validation
    ? validation.rows.filter(
        (r) =>
          statusFilter === "all" || r.status.toLowerCase() === statusFilter,
      )
    : [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-['Inter']">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-left"
      >
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-[#1E2740]">Import Items</h2>
            <p className="text-[13px] text-slate-400 font-medium mt-0.5">
              Import items in bulk using a CSV or Excel file.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 border border-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F9FAFB] scrollbar-hide">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {currentStep === 1 && (
                <div className="space-y-4">
                  {!selectedFile && (
                    <div className="">
                      <NewImportPanel
                        isAuthed={isAuthed}
                        showConfig={false}
                        importType={'Items'}
                        setImportType={null}
                        warehouses={warehouses}
                        selectedWarehouseId={1}
                        setSelectedWarehouseId={null}
                        fileFormat={fileFormat}
                        setFileFormat={setFileFormat}
                        encoding={encoding}
                        setEncoding={setEncoding}
                        flow={importFile}
                      />

                      {fileError && (
                        <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
                          <AlertCircle size={14} /> {fileError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

             
            </div>

            {currentStep < 4 && (
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-[24px] p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                      Download Template
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">
                    Download the template file and follow the format to ensure a
                    successful import.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-600 text-[11px] font-extrabold py-3 rounded-xl shadow-sm hover:bg-indigo-50 transition-all"
                  >
                    <Download size={14} /> Download Template
                  </button>
                  {templateError && (
                    <p className="mt-3 text-[11px] text-rose-500 font-bold flex items-center gap-1.5">
                      <AlertCircle size={12} /> {templateError}
                    </p>
                  )}
                </div>

                <div className="bg-amber-50/40 border border-amber-100 rounded-[24px] p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-amber-500" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                      Import Notes
                    </h4>
                  </div>
                  <ul className="space-y-3.5">
                    <NoteItem text="First row must contain column headers." />
                    <NoteItem text="SKU will be auto-generated if left blank." />
                    <NoteItem text="Required fields must not be empty." />
                    <NoteItem text="Duplicate SKUs or barcodes will be skipped." />
                    <NoteItem text="Category and Unit must match existing values exactly." />
                    <NoteItem text="Unit Type must match the unit chosen (e.g. Piece is Count)." />
                    <NoteItem text="Status is optional (defaults to Active). Items marked Inactive are still created, then set to active right after." />
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const StatBox = ({ label, val, color }) => {
  const themes = {
    slate: "bg-slate-50 border-slate-100 text-slate-800",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
    rose: "bg-rose-50/50 border-rose-100 text-rose-500",
    amber: "bg-amber-50/50 border-amber-100 text-amber-600",
  };
  return (
    <div
      className={`p-5 rounded-2xl border ${themes[color]} text-center shadow-sm transition-transform hover:scale-[1.02]`}
    >
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-extrabold leading-none">{val}</p>
    </div>
  );
};

const NoteItem = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
    <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">
      {text}
    </p>
  </li>
);

export default ImportItems;
