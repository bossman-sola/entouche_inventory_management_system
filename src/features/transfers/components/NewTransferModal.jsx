import { useState, useEffect } from "react";
import { apiRequest, fetchAllPages } from "../api/Client.js";
import { Icon, icons } from "./icons.jsx";
import { Select, DateTimePicker, Modal, Spinner } from "./ui.jsx";

const UNITS = ["pcs", "kg", "box", "carton", "set"];

export default function NewTransferModal({ open, onClose, onSave, token, locations, locationsLoading, locationsError }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [refNum, setRefNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [searchItem, setSearchItem] = useState("");
  const [searchQty, setSearchQty] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (!open || !token) return;

    setCatalogLoading(true);
    setCatalogError("");
    fetchAllPages("/items", token)
      .then(setCatalog)
      .catch(err => setCatalogError(err.message || "Couldn't load items"))
      .finally(() => setCatalogLoading(false));

    setUsersLoading(true);
    setUsersError("");
    fetchAllPages("/users", token)
      .then(setUsers)
      .catch(err => setUsersError(err.message || "Couldn't load users"))
      .finally(() => setUsersLoading(false));
  }, [open, token]);

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().slice(0, 10));
      setFromLocationId(""); setToLocationId(""); setRequestedBy(""); setRefNum(""); setNotes("");
      setItems([]); setSearchItem(""); setSearchQty(""); setSearchUnit(""); setSelectedItem(null);
      setFormError("");
    }
  }, [open]);

  const locationKey = (l) => `${l.warehouseId}:${l.id}`;

  const suggestions = searchItem.trim().length === 0
    ? []
    : catalog.filter(i => {
        const q = searchItem.toLowerCase();
        return i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q) || i.barcode?.toLowerCase().includes(q);
      }).slice(0, 8);

  const pickSuggestion = (item) => {
    setSelectedItem(item);
    setSearchItem(item.name);
    setSearchUnit(item.unit?.abbreviation || "");
    setShowSuggestions(false);
  };

  const addItem = async () => {
    if (!selectedItem) return;
    const rowId = Date.now() + Math.random();
    setItems(p => [...p, {
      id: rowId,
      itemId: selectedItem.id,
      item: selectedItem.name,
      sku: selectedItem.sku || "-",
      unit: searchUnit || selectedItem.unit?.abbreviation || "",
      qty: searchQty || 0,
      availableStock: null,
      stockError: false,
    }]);
    setSearchItem(""); setSearchQty(""); setSearchUnit(""); setSelectedItem(null);

    try {
      const json = await apiRequest(`/items/${selectedItem.id}/stock-balance`, token);
      const available = json?.data?.total_available ?? 0;
      setItems(p => p.map(r => r.id === rowId ? { ...r, availableStock: available } : r));
    } catch {
      setItems(p => p.map(r => r.id === rowId ? { ...r, availableStock: 0, stockError: true } : r));
    }
  };

  const removeItem = id => setItems(p => p.filter(r => r.id !== id));

  const totalQty = items.reduce((s, r) => s + +r.qty, 0);

  const buildPayload = () => {
    const from = locations.find(l => locationKey(l) === fromLocationId);
    const to = locations.find(l => locationKey(l) === toLocationId);
    const requestedUser = users.find(u => String(u.id) === requestedBy);

    const noteParts = [];
    if (requestedUser) noteParts.push(`Requested by: ${requestedUser.name}`);
    if (refNum) noteParts.push(`Ref: ${refNum}`);
    if (notes) noteParts.push(notes);

    return {
      from_warehouse_id: from?.warehouseId,
      from_location_id: from?.id,
      to_warehouse_id: to?.warehouseId,
      to_location_id: to?.id,
      transfer_date: date,
      notes: noteParts.join(" | ") || undefined,
      items: items.map(r => ({ item_id: r.itemId, quantity: Number(r.qty) || 0 })),
    };
  };

  const validate = () => {
    if (!fromLocationId || !toLocationId) return "Choose both a source and destination location.";
    if (fromLocationId === toLocationId) return "Source and destination locations must be different.";
    if (items.length === 0) return "Add at least one item to transfer.";
    if (items.some(r => !Number(r.qty) || Number(r.qty) <= 0)) return "Every item needs a quantity greater than 0.";
    return "";
  };

  const handleSave = async (thenSubmit) => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError("");
    setSaving(true);
    try {
      await onSave(buildPayload(), { submit: thenSubmit });
      onClose();
    } catch (err) {
      setFormError(err.message || "Couldn't save transfer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">New Inventory Transfer</h2>
            <p className="text-sm text-gray-500 mt-0.5">Move inventory items from one location to another.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        {!token && (
          <div className="mb-5 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5">
            <Icon d={icons.alert} size={15} className="text-orange-500 shrink-0" />
            <p className="text-xs text-orange-700">Not connected to the API yet - item search and the user list won't load until sign-in succeeds.</p>
          </div>
        )}

        {/* Step 1: Details */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="font-semibold text-gray-800">Transfer Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateTimePicker label="Transfer Date" required value={date} onChange={setDate} className="col-span-1" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (optional)</label>
              <input value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="Enter reference number (e.g. PO, Ticket #)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested By
                {usersLoading && <Spinner size={11} className="inline ml-1.5 text-gray-400 align-middle" />}
              </label>
              <Select
                value={requestedBy}
                onChange={setRequestedBy}
                options={users.map(u => ({ value: String(u.id), label: u.name }))}
                placeholder={usersError ? "Couldn't load users" : "Select user"}
                disabled={usersLoading || !!usersError}
              />
              {usersError && <p className="text-xs text-red-500 mt-1">{usersError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Location<span className="text-red-500">*</span>
                {locationsLoading && <Spinner size={11} className="inline ml-1.5 text-gray-400 align-middle" />}
              </label>
              <Select
                value={fromLocationId}
                onChange={setFromLocationId}
                options={locations.map(l => ({ value: locationKey(l), label: `${l.warehouseName} — ${l.name}` }))}
                placeholder={locationsError ? "Couldn't load locations" : "Select source location"}
                disabled={locationsLoading || !!locationsError}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location<span className="text-red-500">*</span></label>
              <Select
                value={toLocationId}
                onChange={setToLocationId}
                options={locations.map(l => ({ value: locationKey(l), label: `${l.warehouseName} — ${l.name}` }))}
                placeholder={locationsError ? "Couldn't load locations" : "Select destination location"}
                disabled={locationsLoading || !!locationsError}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Enter any notes for this transfer" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          {locationsError && <p className="text-xs text-red-500 mt-2">{locationsError}</p>}
        </div>

        {/* Step 2: Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="font-semibold text-gray-800">Items</span>
            {catalogLoading && <span className="flex items-center gap-1 text-xs text-gray-400"><Spinner size={11} /> Loading items…</span>}
          </div>

          {catalogError && (
            <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              <Icon d={icons.alert} size={14} className="shrink-0" /> {catalogError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1 min-w-0">
              <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchItem}
                onChange={e => { setSearchItem(e.target.value); setSelectedItem(null); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search item by name, SKU or barcode"
                disabled={catalogLoading || !!catalogError}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {suggestions.map(i => (
                    <button
                      key={i.id}
                      type="button"
                      onMouseDown={() => pickSuggestion(i)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between gap-2"
                    >
                      <span className="text-gray-800 font-medium truncate">{i.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{i.sku}</span>
                    </button>
                  ))}
                </div>
              )}
              {showSuggestions && searchItem.trim() && suggestions.length === 0 && !catalogLoading && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400">
                  No matching items
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input value={searchQty} onChange={e => setSearchQty(e.target.value)} placeholder="Enter quantity" className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Select value={searchUnit} onChange={setSearchUnit} options={UNITS} placeholder="Select unit" className="w-full sm:w-36" />
              <button onClick={addItem} disabled={!selectedItem} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0">
                <Icon d={icons.plus} size={14} /> Add Item
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Item", "SKU", "Unit", "Available Stock", "Quantity *", "Actions"].map(h => (
                      <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Icon d={icons.box} size={36} strokeWidth={1} />
                          <p className="text-sm font-medium text-gray-500">No items added yet</p>
                          <p className="text-xs">Search and add items to include in this transfer.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {items.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 px-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 font-medium whitespace-nowrap">{row.item}</td>
                      <td className="py-2 px-3 text-sm text-gray-400">{row.sku}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{row.unit || "-"}</td>
                      <td className="py-2 px-3 text-sm text-gray-700">
                        {row.availableStock === null ? <Spinner size={12} className="text-gray-400" /> : row.stockError ? <span className="text-red-500">-</span> : row.availableStock}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={e => setItems(p => p.map(r => r.id === row.id ? { ...r, qty: e.target.value } : r))}
                          className="w-20 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <button onClick={() => removeItem(row.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500">
                          <Icon d={icons.trash} size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <button onClick={() => setItems([])} className="flex items-center gap-1 text-sm text-red-500 font-medium border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50">
                Clear All Items
              </button>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span>Total Items: <strong className="text-gray-700">{items.length}</strong></span>
                <span>Total Quantity: <strong className="text-gray-700">{totalQty}</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start sm:items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Icon d={icons.info} size={15} className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs text-blue-700">Transfers are created as a draft first. Submit for approval when you're ready - stock only moves once the transfer is approved and completed.</p>
          </div>
        </div>

        {formError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
            <Icon d={icons.alert} size={14} className="shrink-0" /> {formError}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Spinner size={13} />} Save as Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              {saving && <Spinner size={13} />} Save &amp; Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}