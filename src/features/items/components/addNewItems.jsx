import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Info, UploadCloud, ChevronDown, Save, Package } from 'lucide-react';
import Add from "../../../assets/icons/add.svg?react";
import Initial from "../../../assets/icons/initial.svg?react";
import Location from "../../../assets/icons/location.svg?react";
import Sku from "../../../assets/icons/sku.svg?react";
import Good from "../../../assets/icons/good.svg?react";

const AddItemModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    itemType: '',
    uom: '',
    barcode: '',
    sku: 'AUTO GENERATED',
    brand: '',
    model: '',
    manufacturer: '',
    description: '',
    image: null,
    imagePreview: null
  });


  useEffect(() => {
    if (formData.name && formData.category) {
      const catPrefix = formData.category.substring(0, 3).toUpperCase();
      const namePart = formData.name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const random = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({ ...prev, sku: `${catPrefix}-${namePart}-${random}` }));
    } else {
      setFormData(prev => ({ ...prev, sku: 'AUTO GENERATED' }));
    }
  }, [formData.name, formData.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return alert("Please fill required fields");

    const newItem = {
      id: Date.now(),
      ...formData,
      stock: 0, 
      status: 'Active',
      img: formData.imagePreview || '📦'
    };

    onSave(newItem);
    onClose();
   
    setFormData({ name: '', category: '', itemType: '', uom: '', barcode: '', sku: 'AUTO GENERATED', brand: '', model: '', manufacturer: '', description: '', image: null, imagePreview: null });
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
            <button onClick={onClose} className="p-2 border border-slate-100 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
              <X size={20} />
            </button>
          </div>

          
          <div className="overflow-y-auto p-8 scrollbar-hide bg-white">
            <div className="grid grid-cols-12 gap-10">
              
             
              <div className="col-span-8 space-y-8">
                
               
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Item Name" name="name" required placeholder="Enter item name" value={formData.name} onChange={handleInputChange} />
                    <SelectField label="Category" name="category" required value={formData.category} onChange={handleInputChange} options={['Laptops', 'Printers', 'Furniture', 'Accessories']} />
                    <SelectField label="Item Type" name="itemType" required value={formData.itemType} onChange={handleInputChange} options={['Stock Item', 'Consumable']} />
                    <SelectField label="Unit of Measure" name="uom" required value={formData.uom} onChange={handleInputChange} options={['Piece (PCS)', 'Meter (M)', 'Box']} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <InputField label="Barcode (optional)" name="barcode" placeholder="Enter barcode" value={formData.barcode} onChange={handleInputChange} />
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">SKU</label>
                      <div className="relative">
                        <input readOnly value={formData.sku} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-bold text-slate-400 outline-none" />
                        <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium italic">SKU will be automatically generated after saving the item.</p>
                    </div>
                  </div>
                </div>

              
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest opacity-80">Additional Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField label="Brand (optional)" name="brand" placeholder="Enter brand" value={formData.brand} onChange={handleInputChange} />
                    <InputField label="Model (optional)" name="model" placeholder="Enter model" value={formData.model} onChange={handleInputChange} />
                    <InputField label="Manufacturer" name="manufacturer" placeholder="Enter manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
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
                      className="w-full h-32 bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                      placeholder="Enter item description..."
                    />
                  </div>
                </div>

                
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex gap-4">
                  <Info size={20} className="text-indigo-600 flex-shrink-0" />
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                    <span className="font-bold block mb-0.5">Important Note</span>
                    Initial stock, pricing, and location are managed through Receipts and other inventory transactions.
                  </p>
                </div>
              </div>

              
              <div className="col-span-4 space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Image (optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-8 flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-slate-50 transition-all group relative overflow-hidden">
                    {formData.imagePreview ? (
                      <img src={formData.imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud size={32} className="text-indigo-400 mb-3" />
                        <p className="text-[11px] font-bold text-slate-700 mb-1">Drag and drop an image here</p>
                        <p className="text-[10px] text-slate-400 font-bold mb-4">or</p>
                      </>
                    )}
                    <label className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[11px] font-bold text-indigo-600 shadow-sm cursor-pointer hover:bg-indigo-50 relative z-10 transition-all">
                      {formData.imagePreview ? 'Change Image' : 'Choose Image'}
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
        <p className="text-[11px] text-slate-400 font-medium">
          {formData.sku === 'AUTO GENERATED' ? 'Auto generated' : formData.sku}
        </p>
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
            <button onClick={onClose} className="px-10 py-3 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
            <button 
              onClick={handleSubmit}
              className="px-10 py-3 bg-[#4F46E5] text-white rounded-2xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Save size={16} /> Save Item
            </button>
          </div>
        </motion.div>
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
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const SummaryRow = ({ label, val }) => (
  <div className="px-5 py-4 flex items-center justify-between">
    <span className="text-[11px] font-bold text-slate-500">{label}</span>
    <span className="text-[11px] font-bold text-slate-400 tracking-tight italic">{val}</span>
  </div>
);

export default AddItemModal;