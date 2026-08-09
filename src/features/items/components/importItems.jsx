import { useState, useRef } from "react";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { X, Download, AlertCircle, Info } from "lucide-react";
import { useInventoryApi } from "../../../lib/useInventoryApi";
import { useImportFlow } from "../../../lib/useImportFlow";

import { UNIT_TYPES, UNIT_REFERENCE_DATA } from "../types/itemTypes";
import { NewImportPanel } from "../../data-import/components/NewImportPanel";

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

const ImportItems = ({ isOpen, onClose, categories = [], units = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [templateError, setTemplateError] = useState(null);
  const fileInputRef = useRef(null);

  const [fileFormat, setFileFormat] = useState("CSV");
  const [encoding, setEncoding] = useState("UTF-8");

  const { currentUser, authStatus, refData, warehouses, loadReferenceData } =
    useInventoryApi();

  const importFile = useImportFlow({
    currentUser,
    refData,
    importType: "Items",
    loadReferenceData,
  });

  const isAuthed = authStatus === "ok" && !!currentUser;

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

  const resetState = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

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
                        importType={"Items"}
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

const NoteItem = ({ text }) => (
  <li className="flex items-start gap-2.5">
    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
    <p className="text-[11px] font-bold text-amber-900/70 leading-relaxed">
      {text}
    </p>
  </li>
);

export default ImportItems;
