import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {
  X, UploadCloud, Download, AlertCircle,
  CheckCircle2, ChevronDown, ChevronLeft, FileSpreadsheet,
  Trash2, Info, Loader2
} from 'lucide-react';
import { UNIT_TYPES, UNIT_REFERENCE_DATA, findUnitReference, getUnitType } from '../types/itemTypes';



const ACCEPTED_EXTENSIONS = ['csv', 'xlsx', 'xls'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUIRED_FIELDS = ['name', 'category', 'unit', 'unitType'];

const FIELD_LABELS = {
  name: 'Item Name',
  category: 'Category',
  unit: 'Unit',
  unitType: 'Unit Type',
};

// Maps whatever the spreadsheet's header row says to the internal field keys.
// Add more aliases here if your template uses different column names.
const HEADER_ALIASES = {
  'item name': 'name',
  'name': 'name',
  'category': 'category',
  'unit of measure': 'unit',
  'unit': 'unit',
  'uom': 'unit',
  'unit type': 'unitType',
  'item type': 'unitType',
  'type': 'unitType',
  'barcode': 'barcode',
  'sku': 'sku',
  'brand': 'brand',
  'unit cost': 'unitCost',
  'selling price': 'sellingPrice',
  'reorder level': 'reorderLevel',
};

const STATUS_STYLES = {
  Valid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Invalid: 'bg-rose-50 text-rose-500 border-rose-100',
  Duplicate: 'bg-amber-50 text-amber-600 border-amber-100',
  Empty: 'bg-slate-100 text-slate-400 border-slate-200',
};

const normalizeHeader = (h) => String(h || '').trim().toLowerCase();

const normalizeRow = (rawRow) => {
  const out = {};
  Object.entries(rawRow).forEach(([key, value]) => {
    const mapped = HEADER_ALIASES[normalizeHeader(key)];
    if (mapped) out[mapped] = typeof value === 'string' ? value.trim() : (value ?? '');
  });
  return out;
};

const parseCsv = (file) => new Promise((resolve, reject) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: 'greedy',
    complete: (results) => resolve(results.data),
    error: (err) => reject(err),
  });
});

const parseExcel = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(e.target.result, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false }));
    } catch (err) {
      reject(err);
    }
  };
  reader.onerror = reject;
  reader.readAsArrayBuffer(file);
});

const parseFile = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') return parseCsv(file);
  if (ext === 'xlsx' || ext === 'xls') return parseExcel(file);
  return Promise.reject(new Error('Unsupported file type.'));
};

// Validates every parsed row against required fields, known categories/units,
// and duplicate barcodes/SKUs (both within the file and against what's
// already in your inventory, if you pass existingBarcodes/existingSkus in).
const validateRows = (rawRows, { categories, units, existingBarcodes, existingSkus }) => {
  const categoryNames = new Set(categories.map(c => c.name.toLowerCase()));
  const unitNames = new Set(units.map(u => u.name.toLowerCase()));
  const existingBarcodeSet = new Set(existingBarcodes.map(b => (b || '').toLowerCase()).filter(Boolean));
  const existingSkuSet = new Set(existingSkus.map(s => (s || '').toLowerCase()).filter(Boolean));

  const normalized = rawRows.map(normalizeRow);

  const barcodeCounts = {};
  const skuCounts = {};
  normalized.forEach((r) => {
    if (r.barcode) barcodeCounts[r.barcode.toLowerCase()] = (barcodeCounts[r.barcode.toLowerCase()] || 0) + 1;
    if (r.sku) skuCounts[r.sku.toLowerCase()] = (skuCounts[r.sku.toLowerCase()] || 0) + 1;
  });

  const rows = normalized.map((r, idx) => {
    const rowNum = idx + 2; // +2: 1-indexed, plus the header row
    const isEmpty = Object.values(r).every(v => !v);
    if (isEmpty) {
      return { id: rowNum, ...r, status: 'Empty', errors: [] };
    }

    const hardErrors = [];
    REQUIRED_FIELDS.forEach((field) => {
      if (!r[field]) hardErrors.push(`${FIELD_LABELS[field]} is required.`);
    });

    if (r.unitType && !UNIT_TYPES.some(t => t.toLowerCase() === r.unitType.toLowerCase())) {
      hardErrors.push(`Unit type must be one of: ${UNIT_TYPES.join(', ')}.`);
    }
    if (r.category && categories.length && !categoryNames.has(r.category.toLowerCase())) {
      hardErrors.push(`Category "${r.category}" does not exist.`);
    }
    if (r.unit && units.length && !unitNames.has(r.unit.toLowerCase())) {
      hardErrors.push(`Unit "${r.unit}" does not exist.`);
    }
    // Cross-check: does the given Unit actually belong to the given Unit
    // Type per the reference table (e.g. "Piece" really is a Count unit)?
    if (r.unit && r.unitType) {
      // The Unit column may be "Piece (PCS)" or just "Piece" - try the
      // name portion before any parenthesis first, then the raw value.
      const unitNamePart = r.unit.replace(/\s*\(.*\)\s*$/, '').trim();
      const resolvedType = getUnitType(unitNamePart) || getUnitType(r.unit);
      if (resolvedType && resolvedType.toLowerCase() !== r.unitType.toLowerCase()) {
        hardErrors.push(`Unit "${r.unit}" is a ${resolvedType} unit, not ${r.unitType}.`);
      }
    }

    const duplicateErrors = [];
    if (r.barcode) {
      if (barcodeCounts[r.barcode.toLowerCase()] > 1) duplicateErrors.push('Duplicate barcode in file.');
      else if (existingBarcodeSet.has(r.barcode.toLowerCase())) duplicateErrors.push('Barcode already exists in inventory.');
    }
    if (r.sku) {
      if (skuCounts[r.sku.toLowerCase()] > 1) duplicateErrors.push('Duplicate SKU in file.');
      else if (existingSkuSet.has(r.sku.toLowerCase())) duplicateErrors.push('SKU already exists in inventory.');
    }

    const errors = [...hardErrors, ...duplicateErrors];
    const status = hardErrors.length ? 'Invalid' : duplicateErrors.length ? 'Duplicate' : 'Valid';

    return { id: rowNum, ...r, status, errors };
  });

  return {
    rows,
    total: rows.length,
    valid: rows.filter(r => r.status === 'Valid').length,
    invalid: rows.filter(r => r.status === 'Invalid').length,
    duplicates: rows.filter(r => r.status === 'Duplicate').length,
    empty: rows.filter(r => r.status === 'Empty').length,
  };
};

// Builds the downloadable import template as a real .xlsx workbook (not
// CSV) so we can have bold header text and actual dropdown menus on the
// Category, Unit, and Unit Type columns - neither is possible in plain
// CSV. Category/Unit dropdown options come from whatever the account
// already has; Unit Type always comes from the fixed reference table.
const downloadTemplate = async (categories = [], units = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Items');
  // Hidden sheet holding the dropdown source lists - data validation
  // "list" formulae need cell ranges, not just inline literals, once the
  // options get long (30 units across 5 types).
  const listSheet = workbook.addWorksheet('Lists');
  listSheet.state = 'veryHidden';

  const headers = ['Item Name', 'Category', 'Unit', 'Unit Type', 'Barcode', 'SKU', 'Brand', 'Unit Cost', 'Selling Price', 'Reorder Level'];
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [
    { width: 22 }, { width: 22 }, { width: 20 }, { width: 14 },
    { width: 18 }, { width: 14 }, { width: 16 }, { width: 12 }, { width: 14 }, { width: 14 },
  ];

  // One example row per Unit Type, matching the reference table.
  const sampleRows = [
    ['Wireless Mouse', 'Computer Accessories', 'Piece (PCS)', 'Count', '8901234567890', '', 'Logitech', 10.00, 15.00, 10],
    ['Printer Paper', 'Office Supplies', 'Ream (RM)', 'Count', '', '', 'Double A', 3.50, 5.00, 20],
    ['Diesel', 'Fuel', 'Liter (L)', 'Volume', '', '', '', 0.90, 1.20, 100],
    ['Electrical Cable', 'Electrical Supplies', 'Meter (m)', 'Length', '', '', '', 1.20, 1.80, 50],
    ['Steel Rod', 'Construction Materials', 'Kilogram (kg)', 'Weight', '', '', '', 2.00, 3.00, 200],
  ];
  sampleRows.forEach((row) => sheet.addRow(row));

  const categoryNames = categories.map((c) => c.name).filter(Boolean);
  // If the account has no units yet, fall back to the full reference
  // table so the dropdown isn't empty on a brand-new install.
  const unitLabels = units.length
    ? units.map((u) => `${u.name} (${(u.abbreviation || '').toUpperCase()})`)
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
        type: 'list',
        allowBlank: true,
        formulae: [`Lists!$${listColumnLetter}$1:$${listColumnLetter}$${count}`],
      };
    }
  };
  applyListValidation('B', 'A', categoryNames.length); // Category
  applyListValidation('C', 'B', unitLabels.length);     // Unit
  applyListValidation('D', 'C', UNIT_TYPES.length);      // Unit Type

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'item-import-template.xlsx';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importedCount, setImportedCount] = useState(0);
  const [templateError, setTemplateError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setTemplateError(null);
    try {
      await downloadTemplate(categories, units);
    } catch {
      setTemplateError("Couldn't generate the template file. Please try again.");
    }
  };

  const validateAndSetFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError('Unsupported file type. Please upload a .csv or .xlsx file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File is too large. Max size is 10MB.');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetState = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setValidation(null);
    setFileError(null);
    setStatusFilter('all');
    setImportError(null);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const runValidation = async () => {
    if (!selectedFile) return;
    setIsValidating(true);
    setCurrentStep(2);
    try {
      const rawRows = await parseFile(selectedFile);
      if (!rawRows.length) {
        setFileError('This file has no data rows.');
        setCurrentStep(1);
        return;
      }
      setValidation(validateRows(rawRows, { categories, units, existingBarcodes, existingSkus }));
      setCurrentStep(3);
    } catch {
      setFileError("Couldn't read this file. Please check the format and try again.");
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
        .filter(r => r.status === 'Valid')
        .map(r => ({
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
        }));

      if (onImportComplete) await onImportComplete(validRows);

      setImportedCount(validRows.length);
      setCurrentStep(4);
    } catch (err) {
      setImportError(err?.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredRows = validation
    ? validation.rows.filter(r => statusFilter === 'all' || r.status.toLowerCase() === statusFilter)
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
            <p className="text-[13px] text-slate-400 font-medium mt-0.5">Import items in bulk using a CSV or Excel file.</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 border border-gray-100 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="px-10 py-8 bg-white border-b border-slate-50">
          <div className="flex items-center justify-center max-w-4xl mx-auto relative">
            <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-100 -z-0" />
            <Step num={1} label="Upload File" sub="Choose and upload your file" active={currentStep >= 1} />
            <Step num={2} label="Validate Data" sub="We'll check for errors" active={currentStep >= 2} />
            <Step num={3} label="Review & Confirm" sub="Review the results" active={currentStep >= 3} />
            <Step num={4} label="Import" sub="Import items to your inventory" active={currentStep >= 4} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F9FAFB] scrollbar-hide">
          <div className="grid grid-cols-12 gap-8">

            <div className="col-span-12 lg:col-span-8 space-y-8">

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#1E2740] uppercase tracking-wider opacity-80">Upload File</h3>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center transition-all ${
                      isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-100 bg-[#F8FAFC]/50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 mb-4 border border-indigo-50">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">Drag and drop your file here</p>
                    <p className="text-xs text-slate-400 font-bold mb-6">or</p>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-8 py-3 bg-white border border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-all"
                    >
                      Choose File
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                    <p className="text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest">Supports: .CSV, .XLSX (Max size: 10MB)</p>
                  </div>

                  {fileError && (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
                      <AlertCircle size={14} /> {fileError}
                    </p>
                  )}

                  {selectedFile && !fileError && <SelectedFileCard file={selectedFile} onRemove={handleRemoveFile} />}
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white border border-slate-100 rounded-[24px] p-12 flex flex-col items-center justify-center text-center shadow-sm">
                  <Loader2 size={32} className="text-indigo-500 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-700">Validating {selectedFile?.name}…</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Checking required fields, categories, units, and duplicates.</p>
                </div>
              )}

              {currentStep === 3 && validation && (
                <>
                  <SelectedFileCard file={selectedFile} onRemove={null} />

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#1E2740] uppercase tracking-wider opacity-80">Validation Summary</h3>
                    <div className="grid grid-cols-5 gap-4">
                      <StatBox label="Total Rows" val={validation.total} color="slate" />
                      <StatBox label="Valid Rows" val={validation.valid} color="emerald" />
                      <StatBox label="Invalid Rows" val={validation.invalid} color="rose" />
                      <StatBox label="Duplicates" val={validation.duplicates} color="amber" />
                      <StatBox label="Empty Rows" val={validation.empty} color="slate" />
                    </div>
                    {(validation.invalid > 0 || validation.duplicates > 0) && (
                      <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} /> Please review the errors below before importing.
                      </p>
                    )}
                  </div>

                  <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-[#1E2740] uppercase tracking-widest">Preview &amp; Errors</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Filter:</span>
                        <div className="relative">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 pl-3 pr-8 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
                          >
                            <option value="all">All Issues</option>
                            <option value="valid">Valid</option>
                            <option value="invalid">Invalid</option>
                            <option value="duplicate">Duplicates</option>
                            <option value="empty">Empty</option>
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                          <tr>
                            <th className="px-6 py-4">Row</th>
                            <th className="px-6 py-4">Item Name <span className="text-rose-400">*</span></th>
                            <th className="px-6 py-4">Category <span className="text-rose-400">*</span></th>
                            <th className="px-6 py-4">Unit <span className="text-rose-400">*</span></th>
                            <th className="px-6 py-4">Unit Type <span className="text-rose-400">*</span></th>
                            <th className="px-6 py-4">Barcode</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Errors</th>
                          </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold text-slate-600 divide-y divide-slate-50">
                          {filteredRows.length === 0 && (
                            <tr>
                              <td colSpan={9} className="px-6 py-8 text-center text-slate-400 font-medium">
                                No rows match this filter.
                              </td>
                            </tr>
                          )}
                          {filteredRows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-5 text-slate-400 font-bold">{row.id}</td>
                              <td className="px-6 py-5 text-[#1E2740]">{row.name || '-'}</td>
                              <td className="px-6 py-5 text-slate-400 font-medium">{row.category || '-'}</td>
                              <td className="px-6 py-5 text-slate-400 font-medium">{row.unit || '-'}</td>
                              <td className="px-6 py-5 text-slate-400 font-medium">{row.unitType || '-'}</td>
                              <td className="px-6 py-5 text-slate-400 font-medium tracking-tighter">{row.barcode || '-'}</td>
                              <td className="px-6 py-5 text-slate-400 font-medium tracking-tighter">{row.sku || 'Auto-generated'}</td>
                              <td className="px-6 py-5">
                                <span className={`px-2 py-0.5 rounded-md border text-[10px] ${STATUS_STYLES[row.status]}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-slate-400 font-medium max-w-[220px]">
                                {row.errors.length ? row.errors.join(' ') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <div className="bg-white border border-slate-100 rounded-[24px] p-14 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-5">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Import complete</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-sm">
                    {importedCount} item{importedCount === 1 ? '' : 's'} imported successfully into your inventory.
                  </p>
                  {importError && (
                    <p className="mt-4 text-xs text-rose-500 font-bold flex items-center gap-1.5">
                      <AlertCircle size={14} /> {importError}
                    </p>
                  )}
                </div>
              )}

            </div>

            {currentStep < 4 && (
              <div className="col-span-12 lg:col-span-4 space-y-6">

                <div className="bg-indigo-50/30 border border-indigo-100 rounded-[24px] p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Download Template</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">
                    Download the template file and follow the format to ensure a successful import.
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
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Import Notes</h4>
                  </div>
                  <ul className="space-y-3.5">
                    <NoteItem text="First row must contain column headers." />
                    <NoteItem text="SKU will be auto-generated if left blank." />
                    <NoteItem text="Required fields must not be empty." />
                    <NoteItem text="Duplicate SKUs or barcodes will be skipped." />
                    <NoteItem text="Category and Unit must match existing values exactly." />
                    <NoteItem text="Unit Type must match the unit chosen (e.g. Piece is Count)." />
                  </ul>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
          <button onClick={handleClose} className="px-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
            {currentStep === 4 ? 'Close' : 'Cancel'}
          </button>

          <div className="flex gap-3">
            {currentStep === 3 && (
              <button onClick={resetState} className="px-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all">
                <ChevronLeft size={14} /> Back
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={runValidation}
                disabled={!selectedFile || !!fileError}
                className="px-8 py-3 bg-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Validate File
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleImport}
                disabled={validation.valid === 0 || isImporting}
                className="px-8 py-3 bg-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importing...' : `Import Valid Data (${validation.valid})`}
              </button>
            )}

            {currentStep === 4 && (
              <button onClick={resetState} className="px-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all">
                Import Another File
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Step = ({ num, label, sub, active }) => (
  <div className="flex flex-col items-center gap-2 relative z-10 w-1/4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
      active ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-300 border-slate-100'
    }`}>
      {num}
    </div>
    <div className="text-center">
      <p className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-300'}`}>{label}</p>
      <p className="text-[9px] text-slate-400 font-medium hidden md:block">{sub}</p>
    </div>
  </div>
);

const SelectedFileCard = ({ file, onRemove }) => {
  if (!file) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{file.name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>
      {onRemove ? (
        <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-all">
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
          <CheckCircle2 size={14} />
        </div>
      )}
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
    <div className={`p-5 rounded-2xl border ${themes[color]} text-center shadow-sm transition-transform hover:scale-[1.02]`}>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-extrabold leading-none">{val}</p>
    </div>
  );
};

const NoteItem = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
    <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">{text}</p>
  </li>
);

export default ImportItems;