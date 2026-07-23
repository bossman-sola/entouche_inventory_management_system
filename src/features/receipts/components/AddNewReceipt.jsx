import { useState, useEffect, useRef } from 'react';
import AddNewItem from './AddNewItem';
import { listSuppliers, listUsers, listWarehouses, listWarehouseLocations, listItems, listUnits, mapApiItem } from '../../../lib/api.js';

function fmt(n) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const chevron = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const emptyForm = { supplier: '', receivedBy: '', warehouseId: '', locationId: '', date: '', poNumber: '', notes: '' };

export default function AddNewReceipt({ isOpen, onClose, onSave, editData = null, receiptNumber = '—' }) {
  const [receiptItems, setReceiptItems] = useState([]);
  const [showNewItem, setShowNewItem]   = useState(false);
  const [noteLen, setNoteLen]           = useState(0);
  const [errors, setErrors]             = useState({});
  const [isMaximized, setIsMaximized]   = useState(false);

  /* ── inline "Add Item" row (search item by name/SKU/barcode, then unit + qty + cost) ── */
  const [catalogItems, setCatalogItems]   = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError]   = useState('');
  const [unitOptions, setUnitOptions]     = useState([]);

  const [itemQuery, setItemQuery]         = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [rowUnit, setRowUnit]             = useState('');
  const [rowQty, setRowQty]               = useState('');
  const [rowCost, setRowCost]             = useState('');
  const [rowError, setRowError]           = useState('');
  const searchWrapRef = useRef(null);

  
  const [supplierId, setSupplierId] = useState('');
  const [receivedById, setReceivedById] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [date, setDate]           = useState(todayIso());
  const [poNumber, setPoNumber]   = useState('');
  const [notes, setNotes]         = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const isEditing = !!editData;

  
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingLookups(true);
    setLookupError('');
    Promise.all([listSuppliers(), listUsers(), listWarehouses()])
      .then(([sups, usrs, whs]) => {
        if (cancelled) return;
        setSuppliers(sups || []);
        setUsers(usrs || []);
        setWarehouses(whs || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setLookupError(err.message || 'Failed to load suppliers, users, and warehouses.');
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !warehouseId) { setLocations([]); return; }
    let cancelled = false;
    setLoadingLocations(true);
    listWarehouseLocations(warehouseId)
      .then((locs) => { if (!cancelled) setLocations(locs || []); })
      .catch(() => { if (!cancelled) setLocations([]); })
      .finally(() => { if (!cancelled) setLoadingLocations(false); });
    return () => { cancelled = true; };
  }, [isOpen, warehouseId]);

  // Load the item catalog (for search-by name/SKU/barcode) and units of measure
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingCatalog(true);
    setCatalogError('');
    Promise.all([listItems(), listUnits()])
      .then(([items, units]) => {
        if (cancelled) return;
        setCatalogItems((items || []).map(mapApiItem));
        setUnitOptions(units || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setCatalogError(err.message || 'Failed to load items.');
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  // Close the search suggestions dropdown when clicking elsewhere
  useEffect(() => {
    const close = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Seed (or reset) the form whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setSupplierId(editData.supplierId || '');
      setReceivedById(editData.receivedById || '');
      setWarehouseId(editData.warehouseId || '');
      setLocationId(editData.receivingLocationId || '');
      setDate(editData.date || todayIso());
      setPoNumber(editData.poNumber || (editData.ref !== '—' ? editData.ref : '') || '');
      setNotes(editData.notes || '');
      setNoteLen((editData.notes || '').length);
      setReceiptItems((editData.items || []).map(it => ({ ...it })));
    } else {
      setSupplierId(emptyForm.supplier);
      setReceivedById(emptyForm.receivedBy);
      setWarehouseId(emptyForm.warehouseId);
      setLocationId(emptyForm.locationId);
      setDate(todayIso());
      setPoNumber(emptyForm.poNumber);
      setNotes(emptyForm.notes);
      setNoteLen(0);
      setReceiptItems([]);
    }
    setErrors({});
    setItemQuery(''); setSelectedItem(null); setRowUnit(''); setRowQty(''); setRowCost(''); setRowError('');
    setShowSuggestions(false); setIsMaximized(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const totItems = receiptItems.length;
  const totQty   = receiptItems.reduce((a, r) => a + Number(r.qty || 0), 0);
  const totCost  = receiptItems.reduce((a, r) => a + (Number(r.qty || 0) * Number(r.cost || 0)), 0);

  /* ── search-as-you-type suggestions (name, SKU, or barcode) ── */
  const addedIds = receiptItems.map(r => r.id);
  const suggestions = itemQuery.trim()
    ? catalogItems.filter(it => {
        const q = itemQuery.trim().toLowerCase();
        return (
          it.name.toLowerCase().includes(q) ||
          (it.sku || '').toLowerCase().includes(q) ||
          (it.barcode || '').toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  const selectSuggestion = (item) => {
    setSelectedItem(item);
    setItemQuery(item.name);
    setRowUnit(item.unit || '');
    setRowCost(item.cost != null ? String(item.cost) : '');
    setRowQty(q => q || '1');
    setShowSuggestions(false);
    setRowError('');
  };

  /* ── new item handler ── */
  const handleSaveNewItem = (newItem) => {
    setCatalogItems(prev => [...prev, newItem]);
    selectSuggestion(newItem);
    setShowNewItem(false);
  };

  /* ── add the currently-selected item (with its unit/qty/cost) to the receipt ── */
  const handleAddItemRow = () => {
    if (!selectedItem) { setRowError('Search for and select an item first.'); return; }
    if (!rowUnit) { setRowError('Choose a unit of measure.'); return; }
    const qtyNum = Number(rowQty);
    if (!qtyNum || qtyNum <= 0) { setRowError('Enter a quantity greater than 0.'); return; }

    setReceiptItems(prev => {
      const existing = prev.find(r => r.id === selectedItem.id);
      if (existing) {
        return prev.map(r => r.id === selectedItem.id
          ? { ...r, qty: Number(r.qty || 0) + qtyNum, cost: Number(rowCost) || r.cost, unit: rowUnit }
          : r);
      }
      return [...prev, { ...selectedItem, unit: rowUnit, qty: qtyNum, cost: Number(rowCost) || 0 }];
    });

    setItemQuery(''); setSelectedItem(null); setRowUnit(''); setRowQty(''); setRowCost(''); setRowError('');
  };

  /* ── inline edits ── */
  const updateQty  = (id, val) => setReceiptItems(prev => prev.map(r => r.id === id ? { ...r, qty:  Math.max(1, Number(val) || 1)  } : r));
  const updateCost = (id, val) => setReceiptItems(prev => prev.map(r => r.id === id ? { ...r, cost: Math.max(0, Number(val) || 0)  } : r));
  const removeItem = (id)      => setReceiptItems(prev => prev.filter(r => r.id !== id));
  const clearAll   = ()        => setReceiptItems([]);

  /* ── save receipt ── */
  const handleSave = () => {
    const e = {};
    if (!supplierId)   e.supplier = true;
    if (!receivedById) e.receivedBy = true;
    if (!warehouseId)  e.warehouse = true;
    if (!locationId)   e.location = true;
    if (receiptItems.length === 0) e.items = true;
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const supplierObj = suppliers.find(s => String(s.id) === String(supplierId));
    const userObj = users.find(u => String(u.id) === String(receivedById));
    const warehouseObj = warehouses.find(w => String(w.id) === String(warehouseId));
    const locationObj = locations.find(l => String(l.id) === String(locationId));

    if (onSave) {
      onSave({
        id: editData ? editData.id : undefined,
        no: editData ? editData.no : receiptNumber,
        supplier: supplierObj?.name || '',
        supplierId,
        receivedBy: userObj?.name || '',
        receivedById,
        warehouse: warehouseObj?.name || '',
        warehouseId,
        receivingLocation: locationObj?.name || '',
        receivingLocationId: locationId,
        date, poNumber, notes,
        items: receiptItems,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setReceiptItems([]);
    setShowNewItem(false);
    setErrors({});
    setItemQuery(''); setSelectedItem(null); setRowUnit(''); setRowQty(''); setRowCost(''); setRowError('');
    setShowSuggestions(false); setIsMaximized(false);
    setSupplierId(''); setReceivedById(''); setWarehouseId(''); setLocationId('');
    setPoNumber(''); setNotes(''); setNoteLen(0);
    onClose();
  };

  return (
    <>
      <style>{`
        .anr-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15,20,40,0.5);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 20px 16px; overflow-y: auto;
          font-family: Inter, system-ui, sans-serif;
        }
        .anr-card {
          background: #fff; border-radius: 14px; width: 100%; max-width: 1020px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.13); border: 1px solid #e4e7ef; overflow: hidden;
        }
        .anr-card.anr-maximized { max-width: 1400px; }
        .anr-card.anr-maximized .anr-left { max-height: 82vh; }
        .anr-header-btns { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .anr-expand-btn {
          width: 32px; height: 32px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; border-radius: 8px;
          border: 1px solid #e4e7ef; background: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .anr-expand-btn:hover { background: #f4f6fb; }
        .anr-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 22px 24px 18px;
        }
        .anr-title { font-size: 19px; font-weight: 700; color: #1e2740; }
        .anr-sub   { font-size: 12.5px; color: #6b7591; margin-top: 4px; }
        .anr-close-btn {
          width: 32px; height: 32px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; border-radius: 8px;
          border: 1px solid #e4e7ef; background: #fff; flex-shrink: 0;
          transition: background 0.15s;
        }
        .anr-close-btn:hover { background: #f4f6fb; }
        .anr-divider { border-top: 1px solid #e4e7ef; }
        .anr-body { display: grid; grid-template-columns: 1fr 220px; border-top: 1px solid #e4e7ef; }
        .anr-left {
          padding: 20px 24px; border-right: 1px solid #e4e7ef;
          overflow-y: auto; max-height: 76vh;
        }
        .anr-section-title { font-size: 14px; font-weight: 700; color: #1e2740; margin-bottom: 16px; }
        .anr-row-3   { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 14px; margin-bottom: 14px; }
        .anr-row-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .anr-field   { display: flex; flex-direction: column; }
        .anr-label   { font-size: 11.5px; color: #6b7591; font-weight: 500; display: block; margin-bottom: 5px; }
        .anr-req     { color: #f25c54; }
        .anr-input {
          width: 100%; padding: 9px 11px; border: 1px solid #e4e7ef;
          border-radius: 8px; background: #fff; font-size: 12.5px;
          font-family: inherit; color: #1e2740; outline: none; transition: border 0.15s;
        }
        .anr-input:focus { border-color: #4f6ef7; }
        .anr-input::placeholder { color: #b0b8cc; }
        .anr-input.anr-err  { border-color: #f25c54; }
        .anr-input.anr-ro   { background: #f8f9fb; color: #3d4a63; cursor: not-allowed; }
        .anr-sel-wrap { position: relative; }
        .anr-select {
          width: 100%; padding: 9px 30px 9px 11px; border: 1px solid #e4e7ef;
          border-radius: 8px; background: #fff; appearance: none; -webkit-appearance: none;
          cursor: pointer; color: #b0b8cc; font-family: inherit; font-size: 12.5px; outline: none;
          transition: border 0.15s;
        }
        .anr-select:disabled { cursor: not-allowed; background: #f8f9fb; }
        .anr-select:focus { border-color: #4f6ef7; }
        .anr-select.anr-err      { border-color: #f25c54; }
        .anr-select.anr-has-val  { color: #1e2740; }
        .anr-sel-arrow { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .anr-date-wrap { position: relative; }
        .anr-date-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; }
        .anr-notes-wrap { margin-bottom: 22px; position: relative; }
        .anr-textarea {
          width: 100%; padding: 9px 11px 24px; border: 1px solid #e4e7ef;
          border-radius: 8px; background: #fff; font-size: 12.5px;
          font-family: inherit; color: #1e2740; outline: none; height: 88px;
          resize: none; line-height: 1.5; transition: border 0.15s;
        }
        .anr-textarea:focus { border-color: #4f6ef7; }
        .anr-textarea::placeholder { color: #b0b8cc; }
        .anr-char-count { position: absolute; right: 10px; bottom: 8px; font-size: 11px; color: #b0b8cc; }
        .anr-add-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .anr-quickadd-row {
          display: grid; grid-template-columns: 1.6fr 1fr 0.8fr 1fr auto;
          gap: 10px; align-items: end; margin-bottom: 8px;
        }
        .anr-quickadd-field { display: flex; flex-direction: column; min-width: 0; }
        .anr-search-wrap { position: relative; }
        .anr-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .anr-search-input { padding-left: 32px !important; }
        .anr-suggest-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 40;
          background: #fff; border: 1px solid #e4e7ef; border-radius: 9px;
          box-shadow: 0 10px 28px rgba(20,25,50,0.14); max-height: 240px; overflow-y: auto; padding: 4px;
        }
        .anr-suggest-item {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding: 8px 10px; border-radius: 6px; cursor: pointer;
        }
        .anr-suggest-item:hover { background: #f4f6fb; }
        .anr-suggest-name { font-size: 12.5px; font-weight: 600; color: #1e2740; }
        .anr-suggest-sku  { font-size: 11px; color: #9aa1b4; margin-top: 1px; }
        .anr-suggest-added { font-size: 11px; color: #22c27e; font-weight: 600; white-space: nowrap; }
        .anr-suggest-empty {
          padding: 14px 10px; text-align: center;
        }
        .anr-suggest-empty-text { font-size: 12px; color: #9aa1b4; margin-bottom: 8px; }
        .anr-suggest-create {
          font-size: 12.5px; color: #4f6ef7; font-weight: 600; cursor: pointer; display: inline-flex;
          align-items: center; gap: 5px;
        }
        .anr-quickadd-add-btn {
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
          padding: 9px 16px; background: #4f6ef7; border-radius: 8px;
          color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer;
          border: none; font-family: inherit; transition: background 0.15s;
        }
        .anr-quickadd-add-btn:hover { background: #3a5be0; }
        .anr-quickadd-add-btn:disabled { background: #c5cedf; cursor: not-allowed; }
        .anr-create-link-row { margin-bottom: 14px; }
        .anr-add-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; background: #4f6ef7; border-radius: 8px;
          color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer;
          white-space: nowrap; border: none; font-family: inherit; transition: background 0.15s;
        }
        .anr-add-btn:hover { background: #3a5be0; }
        .anr-add-btn-sec {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 14px; background: #fff; border: 1px solid #e4e7ef;
          border-radius: 8px; color: #1e2740; font-size: 12.5px; font-weight: 500;
          cursor: pointer; white-space: nowrap; font-family: inherit; transition: background 0.15s;
        }
        .anr-add-btn-sec:hover { background: #f4f6fb; }
        .anr-table-wrap { border: 1px solid #e4e7ef; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
        .anr-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .anr-thead tr { background: #f8f9fb; border-bottom: 1px solid #e4e7ef; }
        .anr-th { padding: 10px 8px; color: #6b7591; font-weight: 500; white-space: nowrap; }
        .anr-th:first-child { padding-left: 14px; width: 32px; text-align: left; }
        .anr-th:nth-child(2),.anr-th:nth-child(3),.anr-th:nth-child(4) { text-align: left; }
        .anr-th:nth-child(5) { text-align: center; }
        .anr-th:nth-child(6),.anr-th:nth-child(7) { text-align: right; }
        .anr-th:last-child { text-align: center; }
        .anr-td { padding: 10px 8px; }
        .anr-td:first-child { padding-left: 14px; color: #6b7591; }
        .anr-item-name { font-weight: 600; color: #1e2740; }
        .anr-item-cat  { font-size: 11px; color: #6b7591; margin-top: 1px; }
        .anr-inline-input {
          padding: 5px 7px; border: 1px solid #e4e7ef; border-radius: 6px;
          font-size: 12.5px; font-family: inherit; color: #1e2740; outline: none;
          transition: border 0.15s; text-align: center;
        }
        .anr-inline-input:focus { border-color: #4f6ef7; }
        .anr-inline-input-r { text-align: right; }
        .anr-del-btn {
          width: 28px; height: 28px; border: 1px solid #fdd; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; background: #fff; margin: 0 auto;
          transition: background 0.15s;
        }
        .anr-del-btn:hover { background: #fff0f0; }
        .anr-total-row { font-weight: 600; color: #1e2740; text-align: right; }
        .anr-empty-cell { padding: 44px 20px; text-align: center; }
        .anr-empty-icon {
          width: 56px; height: 56px; background: #f4f6fb; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .anr-empty-title { font-size: 13.5px; font-weight: 600; color: #3d4a63; margin-bottom: 6px; }
        .anr-empty-sub   { font-size: 12px; color: #9aa1b4; }
        .anr-table-footer { display: flex; align-items: center; justify-content: space-between; }
        .anr-clear-btn {
          padding: 7px 14px; border: 1.5px solid #f25c54; border-radius: 7px;
          font-size: 12px; color: #f25c54; font-weight: 500; cursor: pointer;
          background: #fff; font-family: inherit; transition: background 0.15s;
        }
        .anr-clear-btn:hover { background: #fff1f0; }
        .anr-totals { display: flex; align-items: center; gap: 20px; font-size: 12.5px; color: #6b7591; }
        .anr-totals strong { color: #1e2740; }
        .anr-err-msg { font-size: 11px; color: #f25c54; margin-top: 4px; }
        /* Right panel */
        .anr-right { padding: 20px 16px; background: #fafbfd; display: flex; flex-direction: column; gap: 14px; }
        .anr-summary-card { background: #fff; border: 1px solid #e4e7ef; border-radius: 10px; padding: 16px; }
        .anr-summary-title { font-size: 13.5px; font-weight: 700; color: #1e2740; margin-bottom: 14px; }
        .anr-summary-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 0; border-bottom: 1px solid #f0f2f7;
        }
        .anr-summary-label { font-size: 12.5px; color: #6b7591; }
        .anr-summary-val   { font-size: 13px; font-weight: 700; color: #1e2740; }
        .anr-cost-block    { padding: 10px 0; }
        .anr-cost-label    { font-size: 12.5px; color: #6b7591; margin-bottom: 4px; }
        .anr-cost-val      { font-size: 20px; font-weight: 700; color: #1e2740; }
        .anr-impact-box {
          background: #f0f4ff; border: 1px solid #c5d0ff; border-radius: 8px;
          padding: 11px 12px; margin-top: 10px; display: flex; align-items: flex-start; gap: 8px;
        }
        .anr-impact-title { font-size: 12px; font-weight: 600; color: #4f6ef7; margin-bottom: 3px; }
        .anr-impact-sub   { font-size: 11.5px; color: #3d4a7a; line-height: 1.5; }
        .anr-attach-box {
          border: 1.5px dashed #d7dbe8; border-radius: 10px; padding: 20px 12px;
          text-align: center; background: #fafbfd;
        }
        .anr-attach-text { font-size: 12px; color: #6b7591; margin: 8px 0 10px; }
        .anr-attach-btn {
          padding: 7px 16px; border: 1px solid #e4e7ef; border-radius: 7px;
          font-size: 12px; font-weight: 500; color: #b0b8cc; background: #f4f6fb;
          cursor: not-allowed; font-family: inherit;
        }
        .anr-attach-sub { font-size: 10.5px; color: #b0b8cc; margin-top: 10px; line-height: 1.4; }
        /* Footer */
        .anr-footer {
          display: flex; align-items: center; justify-content: flex-end;
          gap: 10px; padding: 14px 24px; border-top: 1px solid #e4e7ef; background: #fff;
        }
        .anr-btn-cancel {
          padding: 9px 24px; border: 1px solid #e4e7ef; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #1e2740; cursor: pointer;
          background: #fff; font-family: inherit; transition: background 0.15s;
        }
        .anr-btn-cancel:hover { background: #f4f6fb; }
        .anr-btn-save {
          padding: 9px 24px; background: #4f6ef7; border-radius: 8px;
          font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
          border: none; font-family: inherit; transition: background 0.15s;
        }
        .anr-btn-save:hover { background: #3a5be0; }
        .anr-banner-err {
          padding: 10px 14px; background: #fff1f0; border: 1px solid #ffd0ce;
          border-radius: 8px; font-size: 12px; color: #f25c54; font-weight: 500;
          margin-bottom: 14px;
        }
      `}</style>

      <div className="anr-overlay">
        <div className={`anr-card${isMaximized ? ' anr-maximized' : ''}`}>

          {/* Header */}
          <div className="anr-header">
            <div>
              <div className="anr-title">{isEditing ? 'Edit Receipt' : 'Add New Receipt'}</div>
              <div className="anr-sub">
                {isEditing
                  ? `Update the details for ${editData.no}.`
                  : 'Record a new inventory receipt for items received into your inventory.'}
              </div>
            </div>
            <div className="anr-header-btns">
              <button className="anr-expand-btn" onClick={() => setIsMaximized(m => !m)} title={isMaximized ? 'Restore' : 'Expand'}>
                {isMaximized ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/>
                  </svg>
                )}
              </button>
              <button className="anr-close-btn" onClick={handleClose}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="anr-body">

            {/* ── LEFT ── */}
            <div className="anr-left">

              {/* Receipt Information */}
              <div className="anr-section-title">Receipt Information</div>

              {lookupError && <div className="anr-banner-err">{lookupError}</div>}

              {/* Row 1 */}
              <div className="anr-row-3">
                <div className="anr-field">
                  <label className="anr-label">Receipt Number <span className="anr-req">*</span></label>
                  <input className="anr-input anr-ro" value={isEditing ? editData.no : receiptNumber} readOnly />
                </div>
                <div className="anr-field">
                  <label className="anr-label">Receipt Date <span className="anr-req">*</span></label>
                  <input
                    type="date"
                    className="anr-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="anr-field">
                  <label className="anr-label">Reference / PO Number</label>
                  <input
                    className="anr-input"
                    placeholder="Enter PO number (optional)"
                    value={poNumber}
                    onChange={e => setPoNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="anr-row-2">
                <div className="anr-field">
                  <label className="anr-label">Supplier <span className="anr-req">*</span></label>
                  <div className="anr-sel-wrap">
                    <select
                      className={`anr-select${errors.supplier ? ' anr-err' : ''}${supplierId ? ' anr-has-val' : ''}`}
                      value={supplierId}
                      onChange={e => { setSupplierId(e.target.value); setErrors(p => ({ ...p, supplier: false })); }}
                      disabled={loadingLookups}
                    >
                      <option value="">{loadingLookups ? 'Loading suppliers…' : 'Select supplier'}</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <span className="anr-sel-arrow">{chevron}</span>
                  </div>
                  {errors.supplier && <span className="anr-err-msg">Required</span>}
                  {!loadingLookups && suppliers.length === 0 && !errors.supplier && (
                    <span className="anr-err-msg" style={{ color: '#9aa1b4' }}>No suppliers found. Add one in Suppliers first.</span>
                  )}
                </div>
                <div className="anr-field">
                  <label className="anr-label">Received By <span className="anr-req">*</span></label>
                  <div className="anr-sel-wrap">
                    <select
                      className={`anr-select${errors.receivedBy ? ' anr-err' : ''}${receivedById ? ' anr-has-val' : ''}`}
                      value={receivedById}
                      onChange={e => { setReceivedById(e.target.value); setErrors(p => ({ ...p, receivedBy: false })); }}
                      disabled={loadingLookups}
                    >
                      <option value="">{loadingLookups ? 'Loading users…' : 'Select user'}</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <span className="anr-sel-arrow">{chevron}</span>
                  </div>
                  {errors.receivedBy && <span className="anr-err-msg">Required</span>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="anr-row-2">
                <div className="anr-field">
                  <label className="anr-label">Warehouse <span className="anr-req">*</span></label>
                  <div className="anr-sel-wrap">
                    <select
                      className={`anr-select${errors.warehouse ? ' anr-err' : ''}${warehouseId ? ' anr-has-val' : ''}`}
                      value={warehouseId}
                      onChange={e => {
                        setWarehouseId(e.target.value);
                        setLocationId('');
                        setErrors(p => ({ ...p, warehouse: false }));
                      }}
                      disabled={loadingLookups}
                    >
                      <option value="">{loadingLookups ? 'Loading warehouses…' : 'Select warehouse'}</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <span className="anr-sel-arrow">{chevron}</span>
                  </div>
                  {errors.warehouse && <span className="anr-err-msg">Required</span>}
                  {!loadingLookups && warehouses.length === 0 && !errors.warehouse && (
                    <span className="anr-err-msg" style={{ color: '#9aa1b4' }}>No warehouses found. Add one in Warehouses first.</span>
                  )}
                </div>
                <div className="anr-field">
                  <label className="anr-label">Receiving Location <span className="anr-req">*</span></label>
                  <div className="anr-sel-wrap">
                    <select
                      className={`anr-select${errors.location ? ' anr-err' : ''}${locationId ? ' anr-has-val' : ''}`}
                      value={locationId}
                      onChange={e => { setLocationId(e.target.value); setErrors(p => ({ ...p, location: false })); }}
                      disabled={!warehouseId || loadingLocations}
                    >
                      <option value="">
                        {!warehouseId ? 'Select a warehouse first' : loadingLocations ? 'Loading locations…' : 'Select location'}
                      </option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <span className="anr-sel-arrow">{chevron}</span>
                  </div>
                  {errors.location && <span className="anr-err-msg">Required</span>}
                  {warehouseId && !loadingLocations && locations.length === 0 && !errors.location && (
                    <span className="anr-err-msg" style={{ color: '#9aa1b4' }}>No locations found for this warehouse.</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="anr-notes-wrap">
                <label className="anr-label">Notes</label>
                <textarea
                  className="anr-textarea"
                  placeholder="Enter any notes (optional)"
                  maxLength={500}
                  value={notes}
                  onChange={e => { setNotes(e.target.value); setNoteLen(e.target.value.length); }}
                />
                <span className="anr-char-count">{noteLen}/500</span>
              </div>

              {/* Receipt Items heading */}
              <div className="anr-section-title">Receipt Items</div>

              {/* Add Item row */}
              <div className="anr-quickadd-row">
                <div className="anr-quickadd-field anr-search-wrap" ref={searchWrapRef}>
                  <label className="anr-label">Add Item</label>
                  <div style={{ position: 'relative' }}>
                    <svg className="anr-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      className="anr-input anr-search-input"
                      placeholder="Search item by name, SKU or barcode"
                      value={itemQuery}
                      onChange={e => { setItemQuery(e.target.value); setSelectedItem(null); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                  </div>
                  {showSuggestions && itemQuery.trim() && (
                    <div className="anr-suggest-dropdown">
                      {loadingCatalog ? (
                        <div className="anr-suggest-empty"><span className="anr-suggest-empty-text">Loading items…</span></div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map(it => {
                          const already = addedIds.includes(it.id);
                          return (
                            <div key={it.id} className="anr-suggest-item" onClick={() => selectSuggestion(it)}>
                              <div>
                                <div className="anr-suggest-name">{it.name}</div>
                                <div className="anr-suggest-sku">{it.sku}{it.cat ? ` · ${it.cat}` : ''}</div>
                              </div>
                              {already && <span className="anr-suggest-added">Already added</span>}
                            </div>
                          );
                        })
                      ) : (
                        <div className="anr-suggest-empty">
                          <div className="anr-suggest-empty-text">No items match "{itemQuery}".</div>
                          <span className="anr-suggest-create" onClick={() => { setShowSuggestions(false); setShowNewItem(true); }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Create New Item
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="anr-quickadd-field">
                  <label className="anr-label">Unit of Measure</label>
                  <div className="anr-sel-wrap">
                    <select
                      className={`anr-select ${rowUnit ? 'anr-has-val' : ''}`}
                      value={rowUnit}
                      onChange={e => setRowUnit(e.target.value)}
                    >
                      <option value="">Select unit</option>
                      {unitOptions.map(u => <option key={u.id ?? u.name} value={u.name}>{u.name}</option>)}
                      {rowUnit && !unitOptions.some(u => u.name === rowUnit) && <option value={rowUnit}>{rowUnit}</option>}
                    </select>
                    <span className="anr-sel-arrow">{chevron}</span>
                  </div>
                </div>

                <div className="anr-quickadd-field">
                  <label className="anr-label">Quantity <span className="anr-req">*</span></label>
                  <input
                    type="number" min="1"
                    className="anr-input"
                    placeholder="Enter quantity"
                    value={rowQty}
                    onChange={e => setRowQty(e.target.value)}
                  />
                </div>

                <div className="anr-quickadd-field">
                  <label className="anr-label">Unit Cost (₦) <span className="anr-req">*</span></label>
                  <input
                    type="number" min="0"
                    className="anr-input"
                    placeholder="Enter unit cost"
                    value={rowCost}
                    onChange={e => setRowCost(e.target.value)}
                  />
                </div>

                <button className="anr-quickadd-add-btn" onClick={handleAddItemRow}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="anr-create-link-row">
                <span className="anr-suggest-create" onClick={() => setShowNewItem(true)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Item not in your catalog? Create New Item
                </span>
              </div>

              {catalogError && <div className="anr-banner-err">{catalogError}</div>}
              {rowError && <div className="anr-err-msg" style={{ marginBottom: 10 }}>{rowError}</div>}

              {/* Error: no items */}
              {errors.items && (
                <div className="anr-banner-err">Please add at least one item to the receipt.</div>
              )}

              {/* Items table */}
              <div className="anr-table-wrap">
                <table className="anr-table">
                  <thead className="anr-thead">
                    <tr>
                      <th className="anr-th">#</th>
                      <th className="anr-th">Item</th>
                      <th className="anr-th">SKU</th>
                      <th className="anr-th">Unit</th>
                      <th className="anr-th" style={{ textAlign: 'center' }}>Quantity</th>
                      <th className="anr-th" style={{ textAlign: 'right' }}>Unit Cost (₦)</th>
                      <th className="anr-th" style={{ textAlign: 'right' }}>Total Cost (₦)</th>
                      <th className="anr-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="anr-empty-cell">
                          <div className="anr-empty-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5cde8" strokeWidth="1.5">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                              <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                          </div>
                          <div className="anr-empty-title">No items added yet</div>
                          <div className="anr-empty-sub">Search and add items to this receipt using the form above.</div>
                        </td>
                      </tr>
                    ) : receiptItems.map((r, i) => {
                      const lineTotal = Number(r.qty || 0) * Number(r.cost || 0);
                      return (
                        <tr key={r.id} style={{ borderBottom: i < receiptItems.length - 1 ? '1px solid #f4f6fb' : 'none' }}>
                          <td className="anr-td">{i + 1}</td>
                          <td className="anr-td">
                            <div className="anr-item-name">{r.name}</div>
                            <div className="anr-item-cat">{r.cat}</div>
                          </td>
                          <td className="anr-td" style={{ color: '#6b7591' }}>{r.sku}</td>
                          <td className="anr-td" style={{ color: '#6b7591' }}>{r.unit}</td>
                          <td className="anr-td" style={{ textAlign: 'center' }}>
                            <input
                              type="number" min="1"
                              className="anr-inline-input"
                              style={{ width: 60 }}
                              value={r.qty}
                              onChange={e => updateQty(r.id, e.target.value)}
                            />
                          </td>
                          <td className="anr-td" style={{ textAlign: 'right' }}>
                            <input
                              type="number" min="0"
                              className="anr-inline-input anr-inline-input-r"
                              style={{ width: 80 }}
                              value={r.cost}
                              onChange={e => updateCost(r.id, e.target.value)}
                            />
                          </td>
                          <td className="anr-td anr-total-row">{fmt(lineTotal)}</td>
                          <td className="anr-td" style={{ textAlign: 'center' }}>
                            <button className="anr-del-btn" onClick={() => removeItem(r.id)}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f25c54" strokeWidth="2.5">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              <div className="anr-table-footer">
                <button className="anr-clear-btn" onClick={clearAll}>Clear All Items</button>
                <div className="anr-totals">
                  <span>Total Items: <strong>{totItems}</strong></span>
                  <span>Total Quantity: <strong>{totQty}</strong></span>
                  <span>Total Cost: <strong>{fmt(totCost)}</strong></span>
                </div>
              </div>

            </div>

            {/* ── RIGHT ── */}
            <div className="anr-right">
              <div className="anr-summary-card">
                <div className="anr-summary-title">Receipt Summary</div>
                <div className="anr-summary-row">
                  <span className="anr-summary-label">Total Items</span>
                  <span className="anr-summary-val">{totItems}</span>
                </div>
                <div className="anr-summary-row">
                  <span className="anr-summary-label">Total Quantity</span>
                  <span className="anr-summary-val">{totQty}</span>
                </div>
                <div className="anr-cost-block">
                  <div className="anr-cost-label">Total Cost</div>
                  <div className="anr-cost-val">{fmt(totCost)}</div>
                </div>
                <div className="anr-impact-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <div className="anr-impact-title">Inventory Impact</div>
                    <div className="anr-impact-sub">Stock will be increased for the selected items in the chosen warehouse.</div>
                  </div>
                </div>
              </div>

              <div className="anr-summary-card">
                <div className="anr-summary-title">Attachments (optional)</div>
                <div className="anr-attach-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="1.8">
                    <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L9.64 17.62a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  <div className="anr-attach-text">Drag and drop files here, or</div>
                  <button type="button" className="anr-attach-btn" disabled title="Receipt attachments aren't wired up yet">Choose Files</button>
                  <div className="anr-attach-sub">Not available yet — no backend endpoint for receipt attachments.</div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="anr-footer">
            <button className="anr-btn-cancel" onClick={handleClose}>Cancel</button>
            <button className="anr-btn-save" onClick={handleSave}>{isEditing ? 'Update Receipt' : 'Save Receipt'}</button>
          </div>

        </div>
      </div>

      {/* Sub-modal: create a brand-new item, then drop it straight into this receipt */}
      <AddNewItem
        isOpen={showNewItem}
        onClose={() => setShowNewItem(false)}
        onSave={handleSaveNewItem}
        existingSkus={catalogItems.map(it => it.sku).filter(Boolean)}
      />
    </>
  );
}