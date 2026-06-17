import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, FileText, Download, AlertCircle, 
  CheckCircle2, ChevronDown, ChevronLeft, FileSpreadsheet,
  Trash2, Info
} from 'lucide-react';

const ImportItems = ({ isOpen, onClose, onImportComplete }) => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  
  const [validationData] = useState({
    total: 125,
    valid: 112,
    invalid: 8,
    duplicates: 5,
    empty: 0,
    rows: [
      { id: 2, name: 'Dell Latitude 5440', cat: 'Laptops', uom: 'Piece (PCS)', type: 'Stock Item', barcode: '1234567890123', sku: 'LAP-000124', status: 'Valid' },
      { id: 3, name: 'HP LaserJet Pro M428', cat: 'Printers', uom: 'Piece (PCS)', type: 'Stock Item', barcode: '2345678901234', sku: 'PRN-000125', status: 'Valid' },
    ]
  });

  if (!isOpen) return null;

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleImport = () => {
    
    alert(`Successfully imported ${validationData.valid} items!`);
    onImportComplete && onImportComplete();
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
            <p className="text-[13px] text-slate-400 font-medium mt-0.5">Import items in bulk using a CSV or Excel file.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 border border-gray-100 transition-all">
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
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, .xlsx" />
                  <p className="text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest">Supports: .CSV, .XLSX (Max size: 10MB)</p>
                </div>

               
                {selectedFile && (
                  <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                  </div>
                )}
              </div>

              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#1E2740] uppercase tracking-wider opacity-80">Validation Summary</h3>
                <div className="grid grid-cols-5 gap-4">
                  <StatBox label="Total Rows" val={validationData.total} color="slate" />
                  <StatBox label="Valid Rows" val={validationData.valid} color="emerald" />
                  <StatBox label="Invalid Rows" val={validationData.invalid} color="rose" />
                  <StatBox label="Duplicates" val={validationData.duplicates} color="amber" />
                  <StatBox label="Empty Rows" val={validationData.empty} color="slate" />
                </div>
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1.5">
                   <AlertCircle size={14}/> Please review the errors below before importing.
                </p>
              </div>

              
              <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-[#1E2740] uppercase tracking-widest">Preview & Errors</h3>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Filter:</span>
                      <button className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600">
                        All Issues <ChevronDown size={14}/>
                      </button>
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
                        <th className="px-6 py-4">Type <span className="text-rose-400">*</span></th>
                        <th className="px-6 py-4">Barcode</th>
                        <th className="px-6 py-4">SKU (Auto)</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="text-[12px] font-bold text-slate-600 divide-y divide-slate-50">
                      {validationData.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 text-slate-400 font-bold">{row.id}</td>
                          <td className="px-6 py-5 text-[#1E2740]">{row.name}</td>
                          <td className="px-6 py-5 text-slate-400 font-medium">{row.cat}</td>
                          <td className="px-6 py-5 text-slate-400 font-medium">{row.uom}</td>
                          <td className="px-6 py-5 text-slate-400 font-medium">{row.type}</td>
                          <td className="px-6 py-5 text-slate-400 font-medium tracking-tighter">{row.barcode}</td>
                          <td className="px-6 py-5 text-slate-400 font-medium tracking-tighter">{row.sku}</td>
                          <td className="px-6 py-5">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 text-[10px]">Valid</span>
                          </td>
                          <td className="px-6 py-5 text-slate-300">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

           
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-[24px] p-7">
                <div className="flex items-center gap-2 mb-3">
                  <Download size={16} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Download Template</h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6">
                  Download the template file and follow the format to ensure a successful import.
                </p>
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-600 text-[11px] font-extrabold py-3 rounded-xl shadow-sm hover:bg-indigo-50 transition-all">
                   <Download size={14}/> Download Template
                </button>
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
                </ul>
              </div>

            </div>
          </div>
        </div>

       
        <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
          <button onClick={onClose} className="px-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
          <div className="flex gap-3">
            <button className="px-8 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
               Back
            </button>
            <button 
              onClick={handleImport}
              className="px-8 py-3 bg-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Import Valid Data ({validationData.valid})
            </button>
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