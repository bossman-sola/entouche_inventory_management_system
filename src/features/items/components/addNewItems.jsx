import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Info, UploadCloud, ChevronDown, Save, Plus, CheckCircle2 } from 'lucide-react';
import Add from "../../../assets/icons/add.svg?react";
import Initial from "../../../assets/icons/initial.svg?react";
import Location from "../../../assets/icons/location.svg?react";
import Sku from "../../../assets/icons/sku.svg?react";
import Good from "../../../assets/icons/good.svg?react";
import { mapFormToApiPayload } from "../api/itemsMapper.js";

const emptyForm = {
  name: '',
  categoryId: '',
  itemType: '',
  unitId: '',
  supplierId: '',
  barcode: '',
  brand: '',
  model: '',
  manufacturer: '',
  description: '',
  unitCost: '',
  sellingPrice: '',
  reorderLevel: '',
};

const emptyCategoryForm = { name: '', description: '' };
const emptySupplierForm = { name: '', contactPerson: '', email: '', phone: '' };
const emptyUnitForm = { name: '', symbol: '', type: '' };

const unitTypeOptions = [
  { value: 'Count', label: 'Count' },
  { value: 'Weight', label: 'Weight' },
  { value: 'Volume', label: 'Volume' },
  { value: 'Length', label: 'Length' },
  { value: 'Area', label: 'Area' },
];

const AddItemModal = ({
  isOpen,
  onClose,
  onSave,
  categories = [],
  suppliers = [],
  units = [],
  // Optional async handlers: (formValues) => Promise<{ id, name, ... }>
  // If not supplied, a local placeholder entry is created instead so the
  // dropdown still updates and can be wired up to a real API later.
  onCreateCategory,
  onCreateSupplier,
  onCreateUnit,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Entries created on the fly through the "+" quick-add modals, merged
  // with whatever was passed in via props so they show up immediately.
  const [localCategories, setLocalCategories] = useState([]);
  const [localSuppliers, setLocalSuppliers] = useState([]);
  const [localUnits, setLocalUnits] = useState([]);

  // Which quick-add modal is currently open: null | 'category' | 'supplier' | 'unit'
  const [quickAdd, setQuickAdd] = useState(null);
  const [toast, setToast] = useState(null);

  const allCategories = [...categories, ...localCategories];
  const allSuppliers = [...suppliers, ...localSuppliers];
  const allUnits = [...units, ...localUnits];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.unitId || !formData.itemType) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = mapFormToApiPayload(formData);
      await onSave(payload, imageFile);
      resetForm();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      setError(firstError || err.response?.data?.message || "Couldn't create this item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const showToast = (title, message) => {
    setToast({ title, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  const handleCreateCategory = async (data) => {
    const created = onCreateCategory
      ? await onCreateCategory(data)
      : { id: `temp-cat-${Date.now()}`, name: data.name };
    setLocalCategories(prev => [...prev, created]);
    setFormData(prev => ({ ...prev, categoryId: created.id }));
    setQuickAdd(null);
    showToast("Category created successfully!", `${created.name} has been added.`);
  };

  const handleCreateSupplier = async (data) => {
    const created = onCreateSupplier
      ? await onCreateSupplier(data)
      : { id: `temp-sup-${Date.now()}`, name: data.name };
    setLocalSuppliers(prev => [...prev, created]);
    setFormData(prev => ({ ...prev, supplierId: created.id }));
    setQuickAdd(null);
    showToast("Supplier created successfully!", `${created.name} has been added.`);
  };

  const handleCreateUnit = async (data) => {
    const created = onCreateUnit
      ? await onCreateUnit(data)
      : { id: `temp-unit-${Date.now()}`, name: data.name, abbreviation: data.symbol };
    setLocalUnits(prev => [...prev, created]);
    setFormData(prev => ({ ...prev, unitId: created.id }));
    setQuickAdd(null);
    const symbol = created.abbreviation || data.symbol;
    showToast("Unit of measure created successfully!", `${created.name} (${(symbol || '').toUpperCase()}) has been added.`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-['Inter']">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white w-full max-w-5xl rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >

          <div className="px-8 py-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Add size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Add New Item</h2>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight">Create a new item to add to your inventory.</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-8 scrollbar-hide bg-white">

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-12 gap-10">

              <div className="col-span-8 space-y-8">

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80">Basic Information</h3>

                  <div className="grid grid-cols-3 gap-5">
                    <InputField label="Item Name" name="name" required placeholder="Enter item name" value={formData.name} onChange={handleInputChange} />
                    <SelectWithAdd
                      label="Category"
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      options={allCategories.map(c => ({ value: c.id, label: c.name }))}
                      onAddNew={() => setQuickAdd('category')}
                    />
                    <SelectField
                      label="Item Type"
                      name="itemType"
                      required
                      value={formData.itemType}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Stock Item', label: 'Stock Item' },
                        { value: 'Consumable', label: 'Consumable' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-5">
                    <SelectWithAdd
                      label="Unit of Measure"
                      name="unitId"
                      required
                      value={formData.unitId}
                      onChange={handleInputChange}
                      options={allUnits.map(u => ({ value: u.id, label: `${u.name} (${(u.abbreviation || '').toUpperCase()})` }))}
                      onAddNew={() => setQuickAdd('unit')}
                      hint="Click + to add a new unit of measure"
                    />
                    <SelectWithAdd
                      label="Supplier (optional)"
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      options={allSuppliers.map(s => ({ value: s.id, label: s.name }))}
                      onAddNew={() => setQuickAdd('supplier')}
                    />
                    <InputField label="Barcode (optional)" name="barcode" placeholder="Enter barcode" value={formData.barcode} onChange={handleInputChange} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">SKU</label>
                    <div className="relative">
                      <input readOnly value="Will be generated on save" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-400 outline-none" />
                      <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-2">SKU will be automatically generated after saving the item.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80">Pricing &amp; Stock</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <InputField label="Unit Cost" name="unitCost" type="number" step="0.01" placeholder="0.00" value={formData.unitCost} onChange={handleInputChange} />
                    <InputField label="Selling Price" name="sellingPrice" type="number" step="0.01" placeholder="0.00" value={formData.sellingPrice} onChange={handleInputChange} />
                    <div className="flex flex-col">
                      <InputField label="Reorder Level" name="reorderLevel" type="number" placeholder="0" value={formData.reorderLevel} onChange={handleInputChange} />
                      <p className="text-[11px] text-slate-400 font-medium mt-2">When stock reaches this level, item will appear in Low Stock.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80">Additional Information</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <InputField label="Brand (optional)" name="brand" placeholder="Enter brand" value={formData.brand} onChange={handleInputChange} />
                    <InputField label="Model (optional)" name="model" placeholder="Enter model" value={formData.model} onChange={handleInputChange} />
                    <InputField label="Manufacturer (optional)" name="manufacturer" placeholder="Enter manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description (optional)</label>
                      <span className="text-[10px] text-slate-400 font-bold">{formData.description.length}/500</span>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      maxLength={500}
                      className="w-full h-32 bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                      placeholder="Enter item description..."
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex gap-4">
                  <Info size={20} className="text-indigo-600 flex-shrink-0" />
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                    <span className="font-bold block mb-0.5">Important Note</span>
                    Initial stock and warehouse location are managed through Receipts and other inventory transactions.
                  </p>
                </div>
              </div>

              <div className="col-span-4 space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Image (optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-slate-50 transition-all group relative overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud size={32} className="text-indigo-400 mb-3" />
                        <p className="text-[11px] font-bold text-slate-700 mb-1">Drag and drop an image here</p>
                        <p className="text-[10px] text-slate-400 font-bold mb-4">or</p>
                      </>
                    )}
                    <label className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-bold text-indigo-600 shadow-sm cursor-pointer hover:bg-indigo-50 relative z-10 transition-all">
                      {imagePreview ? 'Change Image' : 'Choose Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <p className="text-[9px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">JPG, PNG or WEBP. Max size 2MB.</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-50">
                    <h4 className="text-base font-bold text-slate-800">Item Summary</h4>
                  </div>
                  <div className="p-3 space-y-1">

                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <Sku size={16} className="text-violet-500" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">SKU</p>
                        <p className="text-[11px] text-slate-400 font-medium">Auto generated</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Initial size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">Initial Stock</p>
                        <p className="text-[11px] text-slate-400 font-medium">Set through Receipts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Location size={16} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">Location</p>
                        <p className="text-[11px] text-slate-400 font-medium">Set through Receipts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 px-2 py-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Good size={16} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-700 flex items-center gap-2">
                          Status
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100">
                            Active
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">Item will be active once created</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
            <button onClick={handleClose} className="px-10 py-3 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-10 py-3 bg-[#4F46E5] text-white rounded-2xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </motion.div>

        <NewCategoryModal
          isOpen={quickAdd === 'category'}
          onClose={() => setQuickAdd(null)}
          onCreate={handleCreateCategory}
        />
        <NewSupplierModal
          isOpen={quickAdd === 'supplier'}
          onClose={() => setQuickAdd(null)}
          onCreate={handleCreateSupplier}
        />
        <NewUnitModal
          isOpen={quickAdd === 'unit'}
          onClose={() => setQuickAdd(null)}
          onCreate={handleCreateUnit}
        />

        <SuccessToast toast={toast} />
      </div>
    </AnimatePresence>
  );
};

const InputField = ({ label, required, ...props }) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-200"
    />
  </div>
);

const SelectField = ({ label, required, options, ...props }) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <select
        {...props}
        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-600 outline-none appearance-none focus:ring-2 focus:ring-indigo-100 transition-all"
      >
        <option value="">Select option</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// Same as SelectField, plus a small square "+" button that opens a
// quick-create modal for the given field (Category / Supplier / Unit).
const SelectWithAdd = ({ label, required, options, onAddNew, hint, ...props }) => (
  <div className="flex flex-col">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <select
          {...props}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-600 outline-none appearance-none focus:ring-2 focus:ring-indigo-100 transition-all"
        >
          <option value="">Select option</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      <button
        type="button"
        onClick={onAddNew}
        aria-label={`Add new ${label}`}
        className="w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all"
      >
        <Plus size={18} />
      </button>
    </div>
    {hint && (
      <p className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-2">
        <Info size={12} className="text-slate-300" /> {hint}
      </p>
    )}
  </div>
);

// Shared shell for the small "quick add" dialogs (Category / Supplier / Unit).
const QuickAddShell = ({ title, isOpen, onClose, error, saving, saveLabel, onSave, children }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-sm rounded-[28px] shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-all">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">{children}</div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NewCategoryModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState(emptyCategoryForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm(emptyCategoryForm);
    setErr(null);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErr("Category name is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onCreate(form);
      setForm(emptyCategoryForm);
    } catch {
      setErr("Couldn't create category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <QuickAddShell
        title="New Category"
        isOpen={isOpen}
        onClose={handleClose}
        error={err}
        saving={saving}
        saveLabel="Save Category"
        onSave={handleSave}
      >
        <InputField label="Category Name" name="name" required placeholder="e.g. Computer Peripherals" value={form.name} onChange={handleChange} />
        <div className="flex flex-col">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description (optional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
            placeholder="Devices and accessories used with computers"
          />
        </div>
      </QuickAddShell>
    </AnimatePresence>
  );
};

const NewSupplierModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState(emptySupplierForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm(emptySupplierForm);
    setErr(null);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErr("Supplier name is required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onCreate(form);
      setForm(emptySupplierForm);
    } catch {
      setErr("Couldn't create supplier. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <QuickAddShell
        title="New Supplier"
        isOpen={isOpen}
        onClose={handleClose}
        error={err}
        saving={saving}
        saveLabel="Save Supplier"
        onSave={handleSave}
      >
        <InputField label="Supplier Name" name="name" required placeholder="e.g. ABC Supplies Co." value={form.name} onChange={handleChange} />
        <InputField label="Contact Person (optional)" name="contactPerson" placeholder="e.g. John Doe" value={form.contactPerson} onChange={handleChange} />
        <InputField label="Email (optional)" name="email" type="email" placeholder="e.g. john@abcsupplies.com" value={form.email} onChange={handleChange} />
        <InputField label="Phone (optional)" name="phone" placeholder="e.g. +234 801 234 5678" value={form.phone} onChange={handleChange} />
      </QuickAddShell>
    </AnimatePresence>
  );
};

const NewUnitModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState(emptyUnitForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm(emptyUnitForm);
    setErr(null);
    onClose();
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.symbol.trim() || !form.type) {
      setErr("Unit name, symbol and type are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onCreate(form);
      setForm(emptyUnitForm);
    } catch {
      setErr("Couldn't create unit of measure. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <QuickAddShell
        title="New Unit of Measure"
        isOpen={isOpen}
        onClose={handleClose}
        error={err}
        saving={saving}
        saveLabel="Save Unit"
        onSave={handleSave}
      >
        <InputField label="Unit Name" name="name" required placeholder="e.g. Box" value={form.name} onChange={handleChange} />
        <InputField label="Unit Symbol" name="symbol" required placeholder="e.g. BOX" value={form.symbol} onChange={handleChange} />
        <SelectField
          label="Unit Type"
          name="type"
          required
          value={form.type}
          onChange={handleChange}
          options={unitTypeOptions}
        />
      </QuickAddShell>
    </AnimatePresence>
  );
};

const SuccessToast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.95 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[1200] bg-white border border-emerald-100 rounded-2xl shadow-xl px-5 py-4 flex items-start gap-3 max-w-sm"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-800">{toast.title}</p>
          <p className="text-[12px] text-slate-500 font-medium">{toast.message}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AddItemModal;