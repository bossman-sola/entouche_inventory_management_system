import { useState, useEffect } from 'react';
import { listCategories, listUnits, listSuppliers, createItem, mapApiItem } from '../../../lib/api.js';

export default function AddNewItem({ isOpen, onClose, onSave, existingSkus = [] }) {
  const [form, setForm] = useState({
    name: '', barcode: '', categoryId: '', unitId: '', supplierId: '',
    unitCost: '', sellingPrice: '', reorderLevel: '', description: '',
  });
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load categories / units / suppliers from the API whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingLookups(true);
    setLookupError('');
    Promise.all([listCategories(), listUnits(), listSuppliers()])
      .then(([cats, uns, sups]) => {
        if (cancelled) return;
        setCategories(cats || []);
        setUnits(uns || []);
        setSuppliers(sups || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setLookupError(err.message || 'Failed to load categories, units, and suppliers.');
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name = 'Item name is required';
    if (!form.categoryId)    e.categoryId = 'Category is required';
    if (!form.unitId)        e.unitId = 'Unit of measure is required';
    return e;
  };

  const resetForm = () => {
    setForm({ name: '', barcode: '', categoryId: '', unitId: '', supplierId: '', unitCost: '', sellingPrice: '', reorderLevel: '', description: '' });
    setErrors({});
    setSaveError('');
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: form.name.trim(),
        category_id: Number(form.categoryId),
        unit_of_measure_id: Number(form.unitId),
        supplier_id: form.supplierId ? Number(form.supplierId) : null,
        barcode: form.barcode.trim() || null,
        item_type: 'product',
        description: form.description || '',
        unit_cost: form.unitCost ? Number(form.unitCost) : 0,
        selling_price: form.sellingPrice ? Number(form.sellingPrice) : 0,
        reorder_level: form.reorderLevel ? Number(form.reorderLevel) : 0,
        status: 'active',
      };
      const created = await createItem(payload);
      onSave(mapApiItem(created));
      resetForm();
    } catch (err) {
      if (err.errors) {
        // map Laravel-style validation errors onto the form
        const fieldMap = { unit_of_measure_id: 'unitId', category_id: 'categoryId', supplier_id: 'supplierId', name: 'name', barcode: 'barcode' };
        const nextErrors = {};
        Object.entries(err.errors).forEach(([k, msgs]) => {
          nextErrors[fieldMap[k] || k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setErrors(nextErrors);
      }
      setSaveError(err.message || 'Failed to create item.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <style>{`
        .ani-overlay {
          position: absolute; inset: 0; z-index: 10002;
          
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
        .ani-select:disabled { cursor: not-allowed; background: #f8f9fb; }
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
        .ani-error-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; background: #fff1f0; border: 1px solid #ffd0ce; border-radius: 9px;
          font-size: 13px; color: #c0392b; font-weight: 500;
        }
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
        .ani-btn-save:disabled { background: #b7c3f9; cursor: not-allowed; }
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

            {lookupError && <div className="ani-error-banner">{lookupError}</div>}
            {saveError && <div className="ani-error-banner">{saveError}</div>}

            {/* Row 1: Item Name | Barcode | Supplier */}
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
                <label className="ani-label">Barcode <span className="ani-opt">(optional)</span></label>
                <input
                  className="ani-input"
                  type="text"
                  placeholder="Enter barcode (optional)"
                  value={form.barcode}
                  onChange={e => set('barcode', e.target.value)}
                />
              </div>
              <div className="ani-field">
                <label className="ani-label">Supplier <span className="ani-opt">(optional)</span></label>
                <div className="ani-sel-wrap">
                  <select
                    className={`ani-select${errors.supplierId ? ' ani-error' : ''}${form.supplierId ? ' ani-has-value' : ''}`}
                    value={form.supplierId}
                    onChange={e => set('supplierId', e.target.value)}
                    disabled={loadingLookups}
                  >
                    <option value="">{loadingLookups ? 'Loading suppliers…' : 'Select supplier'}</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <svg className="ani-sel-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {errors.supplierId && <span className="ani-error-msg">{errors.supplierId}</span>}
              </div>
            </div>

            {/* Row 2: Category | Unit of Measure | Reorder Level */}
            <div className="ani-row-3">
              <div className="ani-field">
                <label className="ani-label">Category<span className="ani-req">*</span></label>
                <div className="ani-sel-wrap">
                  <select
                    className={`ani-select${errors.categoryId ? ' ani-error' : ''}${form.categoryId ? ' ani-has-value' : ''}`}
                    value={form.categoryId}
                    onChange={e => set('categoryId', e.target.value)}
                    disabled={loadingLookups}
                  >
                    <option value="">{loadingLookups ? 'Loading categories…' : 'Select category'}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <svg className="ani-sel-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {errors.categoryId && <span className="ani-error-msg">{errors.categoryId}</span>}
              </div>
              <div className="ani-field">
                <label className="ani-label">Unit of Measure<span className="ani-req">*</span></label>
                <div className="ani-sel-wrap">
                  <select
                    className={`ani-select${errors.unitId ? ' ani-error' : ''}${form.unitId ? ' ani-has-value' : ''}`}
                    value={form.unitId}
                    onChange={e => set('unitId', e.target.value)}
                    disabled={loadingLookups}
                  >
                    <option value="">{loadingLookups ? 'Loading units…' : 'Select unit'}</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                  </select>
                  <svg className="ani-sel-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {errors.unitId && <span className="ani-error-msg">{errors.unitId}</span>}
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

            {/* Row 3: Unit Cost | Selling Price */}
            <div className="ani-row-3">
              <div className="ani-field">
                <label className="ani-label">Unit Cost (₦) <span className="ani-opt">(optional)</span></label>
                <input
                  className="ani-input"
                  type="number" min="0" step="0.01"
                  placeholder="0.00"
                  value={form.unitCost}
                  onChange={e => set('unitCost', e.target.value)}
                />
              </div>
              <div className="ani-field">
                <label className="ani-label">Selling Price (₦) <span className="ani-opt">(optional)</span></label>
                <input
                  className="ani-input"
                  type="number" min="0" step="0.01"
                  placeholder="0.00"
                  value={form.sellingPrice}
                  onChange={e => set('sellingPrice', e.target.value)}
                />
              </div>
              <div />
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
              <span className="ani-info-text">This item will be created in your inventory and added to this receipt. SKU is generated automatically.</span>
            </div>

          </div>

          {/* Footer */}
          <div className="ani-footer">
            <button className="ani-btn-cancel" onClick={handleClose}>Cancel</button>
            <button className="ani-btn-save" onClick={handleSave} disabled={saving || loadingLookups}>
              {saving ? 'Saving…' : 'Save Item'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}