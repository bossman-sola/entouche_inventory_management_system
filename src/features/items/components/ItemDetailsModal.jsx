import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Edit3, History, Copy, Package, 
  CheckCircle2, Clock, ChevronRight, Save, 
  ArrowUpRight, Settings, Receipt, FileText
} from "lucide-react";

const ItemDetailsModal = ({ isOpen, onClose, item, onUpdate, onDuplicate }) => {
  // --- 1. STATE MANAGEMENT ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  // Initialize edited data when modal opens or item changes
  useEffect(() => {
    if (item) setEditedData({ ...item });
  }, [item]);

  if (!isOpen || !item || !editedData) return null;

  // --- 2. HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
    alert("Changes saved successfully!");
  };

  const handleDuplicateClick = () => {
    const copy = {
      ...item,
      id: Date.now(), // Generate a new ID
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
    };
    onDuplicate(copy);
    alert("Item duplicated successfully!");
  };

  // --- 3. UI HELPERS ---
  const transactionIcons = {
    "Transfer In": { color: "bg-emerald-50 text-emerald-600", icon: ArrowUpRight },
    "Adjustment": { color: "bg-amber-50 text-amber-600", icon: Settings },
    "Receipt": { color: "bg-indigo-50 text-indigo-600", icon: Receipt },
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[1020px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-left"
      >
        {/* HEADER BAR */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-[18px] font-bold text-[#1E2740]">Item Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 border border-gray-100 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="overflow-y-auto bg-[#F8FAFC] p-8 space-y-6 scrollbar-hide">
          
          {/* 🔷 SUMMARY BAR CARD */}
          <div className="bg-white p-7 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-4xl border border-gray-100">
                {item.img || '📦'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isEditing ? (
                    <input 
                      name="name" 
                      value={editedData.name} 
                      onChange={handleInputChange} 
                      className="text-2xl font-extrabold text-[#1E2740] border-b border-indigo-200 outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <h1 className="text-[26px] font-extrabold text-[#1E2740] tracking-tight">{item.name}</h1>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EBFBF5] text-[#10B981] text-[10px] font-bold border border-emerald-100">
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-tight">Stock Item</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-tight">{item.category}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-12 text-right pr-6">
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">Current Stock</p>
                <div className="text-[32px] font-extrabold text-[#10B981] leading-none">{item.stock}</div>
                <p className="text-[11px] font-bold text-[#10B981] mt-1.5 uppercase tracking-tight">In Stock</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">SKU</p>
                <div className="text-[16px] font-bold text-[#1E2740] mt-1">{item.sku}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">Barcode</p>
                <div className="text-[16px] font-bold text-[#1E2740] mt-1 tracking-tighter">{item.barcode}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* 🔷 LEFT COLUMN (Main Info) */}
            <div className="col-span-8 space-y-6">
              
              {/* Item Information Card */}
              <SectionCard 
                title="Item Information" 
                action={
                  !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[#4F46E5] text-[11px] font-bold border border-indigo-100 px-3 py-1.5 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-all">
                      <Edit3 size={14}/> Edit Item
                    </button>
                  )
                }
              >
                <div className="grid grid-cols-2 gap-y-8">
                  <DataField label="Category" value={item.category} isEdit={isEditing} name="category" val={editedData.category} onChange={handleInputChange} />
                  <DataField label="Reorder Level" value={item.reorderLevel || 10} isEdit={isEditing} name="reorderLevel" val={editedData.reorderLevel} onChange={handleInputChange} />
                  <DataField label="Unit of Measure" value={item.uom} isEdit={isEditing} name="uom" val={editedData.uom} onChange={handleInputChange} />
                  <DataField label="Default Supplier" value={item.brand || "Dell Technologies"} isEdit={isEditing} name="brand" val={editedData.brand} onChange={handleInputChange} />
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Item Type</p>
                    <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Stock Item</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Created By</p>
                    <div className="text-[13px] font-bold text-[#1E2740]">
                      Ayomide Ajayi
                      <p className="text-[10px] text-slate-400 font-medium">May 20, 2025 10:30 AM</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Description Card */}
              <SectionCard 
                title="Description" 
                action={!isEditing && <button onClick={() => setIsEditing(true)} className="text-indigo-600 text-[11px] font-bold hover:underline">Edit</button>}
              >
                {isEditing ? (
                  <textarea 
                    name="description" 
                    value={editedData.description || "14-inch business laptop with Intel Core i5 processor..."} 
                    onChange={handleInputChange}
                    className="w-full p-3 border border-indigo-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 min-h-[80px]"
                  />
                ) : (
                  <p className="text-[14px] text-[#6B7591] leading-relaxed font-medium">
                    {item.description || "14-inch business laptop with Intel Core i5 processor, 16GB RAM, and 512GB SSD."}
                  </p>
                )}
              </SectionCard>

              {/* Stock Information Card */}
              <SectionCard 
                title="Stock Information" 
                action={
                  <button className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                    <Clock size={14}/> View Stock History
                  </button>
                }
              >
                <div className="grid grid-cols-2 gap-y-8">
                   <DataField label="Warehouse" value="Main Warehouse" />
                   <div>
                      <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Available Stock</p>
                      <div className="text-[14px] font-bold text-emerald-500 tracking-tight">{item.stock} PCS</div>
                   </div>
                   <DataField label="Bin Location" value="A1-02-03" />
                   <div>
                      <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Allocated Stock</p>
                      <div className="text-[14px] font-bold text-amber-500 tracking-tight">5 PCS</div>
                   </div>
                </div>
              </SectionCard>
            </div>

            {/* 🔷 RIGHT COLUMN (Additional Data) */}
            <div className="col-span-4 space-y-6">
              
              <SectionCard title="Additional Information">
                <div className="grid grid-cols-2 gap-y-6">
                  <DataField label="Brand" value={item.brand} />
                  <DataField label="Model" value={item.model} />
                  <DataField label="Warranty" value="3 Years" />
                  <DataField label="Weight" value={item.weight} />
                  <DataField label="Dimensions" value="32.1 × 21.2 × 1.9 cm" />
                  <DataField label="Added On" value="May 20, 2025" />
                </div>
              </SectionCard>

              <SectionCard title="Recent Transactions" action={<button className="text-indigo-600 text-[10px] font-bold hover:underline">View All</button>}>
                <div className="space-y-5 pt-2">
                   <TransactionRow type="Transfer In" qty="+20" date="May 27" refId="TRF-000312" />
                   <TransactionRow type="Transfer In" qty="+15" date="May 20" refId="TRF-000298" />
                   <TransactionRow type="Adjustment" qty="-2" date="May 15" refId="ADJ-000104" isNegative />
                   <TransactionRow type="Receipt" qty="+25" date="May 15" refId="REC-2025" />
                </div>
              </SectionCard>

            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="px-8 py-6 border-t bg-white flex justify-between items-center sticky bottom-0 z-10">
          <button 
            onClick={handleDuplicateClick}
            className="flex items-center gap-2 text-[#1E2740] font-bold text-[13px] border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95"
          >
            <Copy size={16} className="text-slate-400"/> Duplicate Item
          </button>
          
          <div className="flex gap-4">
            <button onClick={onClose} className="px-10 py-2.5 text-[13px] font-bold border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
              Close
            </button>
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-10 py-2.5 text-[13px] font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Save size={16}/> Save Changes
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-10 py-2.5 text-[13px] font-bold text-white bg-[#4F46E5] rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Edit Item
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- INTERNAL ATOMIC COMPONENTS ---

const SectionCard = ({ title, action, children }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]">
    <div className="flex justify-between items-center mb-7">
      <h3 className="text-[14px] font-bold text-[#1E2740] tracking-tight uppercase tracking-wider opacity-90">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const DataField = ({ label, value, isEdit, name, val, onChange }) => (
  <div className="text-left">
    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">{label}</p>
    {isEdit ? (
      <input 
        name={name} 
        value={val} 
        onChange={onChange}
        className="w-full text-[13px] font-bold text-indigo-600 bg-indigo-50/30 border border-indigo-100 rounded-md px-2 py-1 outline-none"
      />
    ) : (
      <div className="text-[13px] font-bold text-[#1E2740] tracking-tight">{value || "—"}</div>
    )}
  </div>
);

const TransactionRow = ({ type, qty, date, refId, isNegative }) => {
  const meta = {
    "Transfer In": { color: "bg-emerald-50 text-emerald-500", icon: ArrowUpRight },
    "Adjustment": { color: "bg-amber-50 text-amber-500", icon: Settings },
    "Receipt": { color: "bg-indigo-50 text-indigo-500", icon: FileText },
  }[type] || { color: "bg-slate-50 text-slate-500", icon: Package };

  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-4 text-left">
          <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
             <meta.icon size={18} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#1E2740]">{type}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{refId} • {date}, 2025</p>
          </div>
       </div>
       <span className={`text-[12px] font-bold ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>{qty} PCS</span>
    </div>
  );
};

export default ItemDetailsModal;