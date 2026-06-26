import { useState } from 'react';

const CATEGORIES = ['Laptops', 'Printers', 'Accessories', 'Furniture', 'Monitors', 'Consumables'];
const UNITS = ['Piece (PCS)', 'Meter (M)', 'Kilogram (KG)', 'Litre (L)'];

const EMOJI_MAP = {
  Laptops: '💻', Printers: '🖨️', Accessories: '🔗',
  Furniture: '🪑', Monitors: '🖥️', Consumables: '📦',
};

export default function AddNewItem({ isOpen, onClose, onSave, existingSkus = [] }) {
  const [form, setForm] = useState({
    name: '', sku: '', barcode: '',
    category: '', unit: '', reorderLevel: '', description: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Item name is required';
    if (!form.sku.trim())      e.sku      = 'SKU is required';
    if (!form.category)        e.category = 'Category is required';
    if (!form.unit)            e.unit     = 'Unit of measure is required';
    if (existingSkus.includes(form.sku.trim())) e.sku = 'This SKU already exists';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    const newItem = {
      id: Date.now(),
      emoji: EMOJI_MAP[form.category] || '📦',
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      cat: form.category,
      unit: form.unit,
      reorderLevel: form.reorderLevel,
      description: form.description,
      stock: 0,
      low: false,
    };
    onSave(newItem);
    setForm({ name: '', sku: '', barcode: '', category: '', unit: '', reorderLevel: '', description: '' });
    setErrors({});
  };

  const handleClose = () => {
    setForm({ name: '', sku: '', barcode: '', category: '', unit: '', reorderLevel: '', description: '' });
    setErrors({});
    onClose();
  };

  return (
    <>
      <style>{`
        .ani-overlay {
          position: fixed; inset: 0; z-index: 10002;
          background: rgba(30,39,64,0.45);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 28px 16px; overflow-y: auto;
          font-family: Inter, system-ui, sans-serif;
        }
        .ani-dialog {
          background: #fff; border-radius: 16px; width: 100%; max-width: 780px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2); overflow: hidden;
        }
        .ani-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 24px 28px 18px;
        }
        .ani-title { font-size: 20px; font-weight: 700; color: #1e2740; }
        .ani-sub   { font-size: 13px; color: #6b7591; margin-top: 5px; }
        .ani-close-btn {
          width: 34px; height: 34px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; border-radius: 9px;
          border: 1.5px solid #e4e7ef; background: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .ani-close-btn:hover { background: #f4f6fb; }
        .ani-divider { border-top: 1px solid #e4e7ef; }
        .ani-body {
          padding: 24px 28px; display: flex; flex-direction: column; gap: 20px;
        }
        .ani-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .ani-field { display: flex; flex-direction: column; }
        .ani-label {
          font-size: 13px; font-weight: 600; color: #1e2740;
          display: block; margin-bottom: 8px;
        }
        .ani-req { color: #f25c54; margin-left: 2px; }
        .ani-opt { font-size: 13px; font-weight: 400; color: #6b7591; }
        .ani-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e4e7ef; border-radius: 9px;
          background: #fff; font-size: 13px; font-family: inherit;
          color: #1e2740; outline: none; transition: border 0.15s;
        }
        .ani-input:focus { border-color: #4f6ef7; }
        .ani-input::placeholder { color: #b0b8cc; }
        .ani-input.ani-error { border-color: #f25c54; }
        .ani-sel-wrap { position: relative; }
        .ani-select {
          width: 100%; padding: 11px 36px 11px 14px;
          border: 1.5px solid #e4e7ef; border-radius: 9px;
          background: #fff; appearance: none; -webkit-appearance: none;
          cursor: pointer; font-size: 13px; font-family: inherit;
          color: #b0b8cc; outline: none; transition: border 0.15s;
        }
        .ani-select:focus { border-color: #4f6ef7; }
        .ani-select.ani-error { border-color: #f25c54; }
        .ani-select.ani-has-value { color: #1e2740; }
        .ani-sel-arrow {
          position: absolute; right: 12px; top: 50%;
          transform: translateY(-50%); pointer-events: none;
        }
        .ani-error-msg { font-size: 11px; color: #f25c54; margin-top: 4px; }
        .ani-textarea-wrap { position: relative; }
        .ani-textarea {
          width: 100%; padding: 11px 14px 28px 14px;
          border: 1.5px solid #e4e7ef; border-radius: 9px;
          background: #fff; font-size: 13px; font-family: inherit;
          color: #1e2740; outline: none; transition: border 0.15s;
          height: 110px; resize: none; line-height: 1.6;
        }
        .ani-textarea:focus { border-color: #4f6ef7; }
        .ani-textarea::placeholder { color: #b0b8cc; }
        .ani-char-count {
          position: absolute; right: 14px; bottom: 10px;
          font-size: 11.5px; color: #b0b8cc;
        }
        .ani-info-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; background: #f0f4ff; border-radius: 9px;
        }
        .ani-info-text { font-size: 13px; color: #3d4a7a; font-weight: 500; }
        .ani-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 10px; padding: 16px 28px;
          border-top: 1px solid #e4e7ef; background: #fff;
        }
        .ani-btn-cancel {
          padding: 10px 28px; border: 1.5px solid #e4e7ef; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: #1e2740; cursor: pointer;
          background: #fff; font-family: inherit; transition: background 0.15s;
        }
        .ani-btn-cancel:hover { background: #f4f6fb; }
        .ani-btn-save {
          padding: 10px 28px; background: #4f6ef7; border-radius: 9px;
          font-size: 13.5px; font-weight: 600; color: #fff; cursor: pointer;
          border: none; font-family: inherit; transition: background 0.15s;
        }
        .ani-btn-save:hover { background: #3a5be0; }
      `}</style>

      <div className="ani-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="ani-dialog">

          {/* Header */}
          <div className="ani-header">
            <div>
              <div className="ani-title">Add New Item</div>
              <div className="ani-sub">Create a new item and add it to this receipt.</div>
            </div>
            <button className="ani-close-btn" onClick={handleClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="ani-divider" />

          {/* Form Body */}
          <div className="ani-body">

            {/* Row 1: Item Name | SKU | Barcode */}
            <div className="ani-row-3">
              <div className="ani-field">
                <label className="ani-label">Item Name<span className="ani-req">*</span></label>
                <input
                  className={`ani-input${errors.name ? ' ani-error' : ''}`}
                  type="text"
                  placeholder="Enter item name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {errors.name && <span className="ani-error-msg">{errors.name}</span>}
              </div>
              <div className="ani-field">
                <label className="ani-label">SKU<span className="ani-req">*</span></label>
                <input
                  className={`ani-input${errors.sku ? ' ani-error' : ''}`}
                  type="text"
                  placeholder="Enter SKU"
                  value={form.sku}
                  onChange={e => set('sku', e.target.value)}
                />
                {errors.sku && <span className="ani-error-msg">{errors.sku}</span>}
              </div>
              <div className="ani-field">
                <label className="ani-label">Barcode <span className="ani-opt">(optional)</span></label>
                <input
                  className="ani-input"
                  type="text"
                  placeholder="Enter barcode (optional)"
                  value={form.barcode}
                  onChange={e => set('barcode', e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Category | Unit of Measure | Reorder Level */}
            <div className="ani-row-3">
              <div className="ani-field">
                <label className="ani-label">Category<span className="ani-req">*</span></label>
                <div className="ani-sel-wrap">
                  <select
                    className={`ani-select${errors.category ? ' ani-error' : ''}${form.category ? ' ani-has-value' : ''}`}
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg className="ani-sel-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {errors.category && <span className="ani-error-msg">{errors.category}</span>}
              </div>
              <div className="ani-field">
                <label className="ani-label">Unit of Measure<span className="ani-req">*</span></label>
                <div className="ani-sel-wrap">
                  <select
                    className={`ani-select${errors.unit ? ' ani-error' : ''}${form.unit ? ' ani-has-value' : ''}`}
                    value={form.unit}
                    onChange={e => set('unit', e.target.value)}
                  >
                    <option value="">Select unit</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <svg className="ani-sel-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {errors.unit && <span className="ani-error-msg">{errors.unit}</span>}
              </div>
              <div className="ani-field">
                <label className="ani-label">Reorder Level</label>
                <input
                  className="ani-input"
                  type="number"
                  min="0"
                  placeholder="Enter reorder level"
                  value={form.reorderLevel}
                  onChange={e => set('reorderLevel', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="ani-field">
              <label className="ani-label">Description</label>
              <div className="ani-textarea-wrap">
                <textarea
                  className="ani-textarea"
                  placeholder="Enter item description (optional)"
                  maxLength={300}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
                <span className="ani-char-count">{form.description.length}/300</span>
              </div>
            </div>

            {/* Info Banner */}
            <div className="ani-info-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="ani-info-text">This item will be created and added to your receipt.</span>
            </div>

          </div>

          {/* Footer */}
          <div className="ani-footer">
            <button className="ani-btn-cancel" onClick={handleClose}>Cancel</button>
            <button className="ani-btn-save" onClick={handleSave}>Save Item</button>
          </div>

        </div>
      </div>
    </>
  );
}
