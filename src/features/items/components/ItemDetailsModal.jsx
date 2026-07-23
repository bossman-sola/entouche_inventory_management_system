import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, Edit3, Copy, Package,
  ChevronDown, Save,
  ArrowUpRight, Settings, Receipt, FileText
} from "lucide-react";
import * as itemsApi from "../api/itemsApi.js";

const ItemDetailsModal = ({ isOpen, onClose, item, onUpdate, onDuplicate, categories = [], suppliers = [], units = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [stockBalance, setStockBalance] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    if (item) {
      setEditedData({
        name: item.name,
        categoryId: item.categoryId || "",
        unitId: item.unitId || "",
        supplierId: item.supplierId || "",
        brand: item.brand || "",
        description: item.description || "",
        unitCost: item.unitCost ?? "",
        sellingPrice: item.sellingPrice ?? "",
        reorderLevel: item.reorderLevel ?? "",
      });
    }
    setIsEditing(false);
    setSaveError(null);
  }, [item]);

  // Pull real stock balance + transaction history whenever the modal opens for an item
  useEffect(() => {
    if (!isOpen || !item) return;

    setIsLoadingStock(true);
    itemsApi
      .getItemStockBalance(item.id)
      .then(setStockBalance)
      .catch(() => setStockBalance(null))
      .finally(() => setIsLoadingStock(false));

    setIsLoadingTransactions(true);
    itemsApi
      .getItemTransactions(item.id)
      .then((res) => setTransactions(res?.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setIsLoadingTransactions(false));
  }, [isOpen, item]);

  if (!isOpen || !item || !editedData) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: editedData.name,
        category_id: editedData.categoryId ? Number(editedData.categoryId) : undefined,
        unit_of_measure_id: editedData.unitId ? Number(editedData.unitId) : undefined,
        supplier_id: editedData.supplierId ? Number(editedData.supplierId) : undefined,
        brand: editedData.brand || undefined,
        description: editedData.description || undefined,
        unit_cost: editedData.unitCost !== "" ? Number(editedData.unitCost) : undefined,
        selling_price: editedData.sellingPrice !== "" ? Number(editedData.sellingPrice) : undefined,
        reorder_level: editedData.reorderLevel !== "" ? Number(editedData.reorderLevel) : undefined,
      };
      await onUpdate(item.id, payload);
      setIsEditing(false);
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      setSaveError(firstError || err.response?.data?.message || "Couldn't save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateClick = () => {
    onDuplicate(item);
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

          {saveError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
              {saveError}
            </div>
          )}

          {/* 🔷 SUMMARY BAR CARD */}
          <div className="bg-white p-7 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-4xl border border-gray-100 overflow-hidden">
                {typeof item.img === 'string' && item.img.startsWith('http') ? (
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  item.img || '📦'
                )}
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
                  <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-tight">{item.type}</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-tight">{item.category}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-12 text-right pr-6">
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">Current Stock</p>
                <div className="text-[32px] font-extrabold text-[#10B981] leading-none">
                  {isLoadingStock ? "…" : stockBalance?.total_on_hand ?? item.stock}
                </div>
                <p className="text-[11px] font-bold text-[#10B981] mt-1.5 uppercase tracking-tight">In Stock</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">SKU</p>
                <div className="text-[16px] font-bold text-[#1E2740] mt-1">{item.sku}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1 tracking-widest">Barcode</p>
                <div className="text-[16px] font-bold text-[#1E2740] mt-1 tracking-tighter">{item.barcode || "-"}</div>
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
                  {isEditing ? (
                    <>
                      <SelectField label="Category" name="categoryId" value={editedData.categoryId} onChange={handleInputChange} options={categories.map(c => ({ value: c.id, label: c.name }))} />
                      <SelectField label="Unit of Measure" name="unitId" value={editedData.unitId} onChange={handleInputChange} options={units.map(u => ({ value: u.id, label: `${u.name} (${(u.abbreviation || '').toUpperCase()})` }))} />
                      <SelectField label="Supplier" name="supplierId" value={editedData.supplierId} onChange={handleInputChange} options={suppliers.map(s => ({ value: s.id, label: s.name }))} />
                      <TextField label="Reorder Level" name="reorderLevel" type="number" value={editedData.reorderLevel} onChange={handleInputChange} />
                      <TextField label="Unit Cost" name="unitCost" type="number" step="0.01" value={editedData.unitCost} onChange={handleInputChange} />
                      <TextField label="Selling Price" name="sellingPrice" type="number" step="0.01" value={editedData.sellingPrice} onChange={handleInputChange} />
                      <TextField label="Brand" name="brand" value={editedData.brand} onChange={handleInputChange} />
                    </>
                  ) : (
                    <>
                      <DataField label="Category" value={item.category} />
                      <DataField label="Reorder Level" value={item.reorderLevel} />
                      <DataField label="Unit of Measure" value={item.uom} />
                      <DataField label="Unit Cost" value={item.unitCost != null ? `₦${item.unitCost}` : "-"} />
                      <DataField label="Selling Price" value={item.sellingPrice != null ? `₦${item.sellingPrice}` : "-"} />
                      <DataField label="Brand" value={item.brand} />
                    </>
                  )}
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
                    value={editedData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-indigo-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 min-h-[80px]"
                  />
                ) : (
                  <p className="text-[14px] text-[#6B7591] leading-relaxed font-medium">
                    {item.description || "No description added yet."}
                  </p>
                )}
              </SectionCard>

              {/* Stock Information Card */}
              <SectionCard title="Stock Information">
                {isLoadingStock ? (
                  <p className="text-sm text-slate-400 font-medium">Loading stock balance...</p>
                ) : stockBalance && stockBalance.by_location?.length > 0 ? (
                  <div className="space-y-4">
                    {stockBalance.by_location.map((loc, idx) => (
                      <div key={idx} className="flex justify-between text-[13px] font-bold text-[#1E2740]">
                        <span>{loc.warehouse_name || loc.location || `Location ${idx + 1}`}</span>
                        <span>{loc.quantity ?? loc.on_hand ?? 0} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-y-8">
                    <div>
                      <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Available Stock</p>
                      <div className="text-[14px] font-bold text-emerald-500 tracking-tight">{stockBalance?.total_available ?? item.stock} units</div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">Reserved Stock</p>
                      <div className="text-[14px] font-bold text-amber-500 tracking-tight">{stockBalance?.total_reserved ?? 0} units</div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* 🔷 RIGHT COLUMN (Additional Data) */}
            <div className="col-span-4 space-y-6">

              <SectionCard title="Additional Information">
                <div className="grid grid-cols-2 gap-y-6">
                  <DataField label="Brand" value={item.brand} />
                  <DataField label="Added On" value={item.addedOn} />
                </div>
              </SectionCard>

              <SectionCard title="Recent Transactions">
                {isLoadingTransactions ? (
                  <p className="text-sm text-slate-400 font-medium">Loading...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-slate-400 font-medium">No transactions yet.</p>
                ) : (
                  <div className="space-y-5 pt-2">
                    {transactions.slice(0, 5).map((txn, idx) => (
                      <TransactionRow
                        key={txn.id || idx}
                        type={txn.type || txn.transaction_type || "Transaction"}
                        qty={txn.quantity ? `${txn.quantity > 0 ? "+" : ""}${txn.quantity}` : "-"}
                        date={txn.created_at ? new Date(txn.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        refId={txn.reference || txn.reference_number || ""}
                        isNegative={txn.quantity < 0}
                      />
                    ))}
                  </div>
                )}
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
                disabled={isSaving}
                className="flex items-center gap-2 px-10 py-2.5 text-[13px] font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16}/> {isSaving ? "Saving..." : "Save Changes"}
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

const DataField = ({ label, value }) => (
  <div className="text-left">
    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">{label}</p>
    <div className="text-[13px] font-bold text-[#1E2740] tracking-tight">{value || "-"}</div>
  </div>
);

const TextField = ({ label, name, value, onChange, type = "text", step }) => (
  <div className="text-left">
    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">{label}</p>
    <input
      name={name}
      type={type}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full text-[13px] font-bold text-indigo-600 bg-indigo-50/30 border border-indigo-100 rounded-md px-2 py-1 outline-none"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="text-left">
    <p className="text-[10px] font-bold text-[#6B7591] uppercase mb-1.5 tracking-widest">{label}</p>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full text-[13px] font-bold text-indigo-600 bg-indigo-50/30 border border-indigo-100 rounded-md px-2 py-1.5 outline-none"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
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
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{refId} {refId && date ? "•" : ""} {date}</p>
          </div>
       </div>
       <span className={`text-[12px] font-bold ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>{qty}</span>
    </div>
  );
};

export default ItemDetailsModal;
