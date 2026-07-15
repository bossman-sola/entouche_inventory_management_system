import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../../shared/api/entoucheApi.js";
import { Icon } from "../components/icon.jsx";
import { icons } from "../components/icon.js";

const Select = ({ value, onChange, options, placeholder, className = "", disabled = false }) => (
  <div className={`relative ${className}`}>
    <select disabled={disabled} value={value} onChange={e => onChange(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:bg-gray-50 disabled:text-gray-400">
      <option value="">{placeholder}</option>
      {options.map(o => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
    <Icon d={icons.chevronDown} size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

const DatePicker = ({ label, required, value, onChange, className = "" }) => {
  const inputRef = useRef(null);
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => inputRef.current?.showPicker?.()} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
          <Icon d={icons.calendar} size={15} />
        </button>
      </div>
    </div>
  );
};

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const AdjTypeButton = ({ id, icon, color, bg, label, sub, selected, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 min-w-[140px] flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selected ? `border-current ${bg}` : "border-gray-200 hover:border-gray-300"}`}
    style={selected ? { borderColor: color, backgroundColor: `${color}15` } : {}}
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20`, color }}>
      <Icon d={icon} size={16} strokeWidth={2} />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  </button>
);

// Item typeahead, backed by the real items list (GET /api/v1/items).
const ItemPicker = ({ row, allItems, itemsLoading, itemsError, onPick }) => {
  const [query, setQuery] = useState(row.item);
  const [open, setOpen] = useState(false);

  useEffect(() => setQuery(row.item), [row.item]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? allItems.filter((it) => {
        const name = (it.name || "").toLowerCase();
        const sku = (it.sku || "").toLowerCase();
        return name.includes(q) || sku.includes(q);
      }).slice(0, 8)
    : allItems.slice(0, 8);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={itemsLoading ? "Loading items..." : "Search item..."}
        disabled={itemsLoading}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      />
      {open && !itemsLoading && (
        <div className="absolute z-10 mt-1 w-64 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {itemsError && <p className="px-3 py-2 text-xs text-red-500">Couldn't load items: {itemsError}</p>}
          {!itemsError && allItems.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No items exist yet — create one on the Items page first.</p>}
          {!itemsError && allItems.length > 0 && matches.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No items match "{query}"</p>}
          {matches.map(it => (
            <button
              key={it.id}
              type="button"
              onMouseDown={() => { onPick(it); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2"
            >
              <span className="truncate">{it.name || `Item #${it.id}`}</span>
              <span className="text-xs text-gray-400 shrink-0">{it.sku}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const emptyItem = () => ({ id: Date.now() + Math.random(), itemId: null, item: "", sku: "", unit: "", currentStock: 0, adjQty: 0, unitCost: 0, stockLoading: false });

// Maps the UI's adjustment-type buttons to the API's documented slugs.
const TYPE_SLUG = { Increase: "increase", Decrease: "decrease", "Set Stock": "set_stock" };

export default function NewAdjustmentModal({
  open, onClose, onSaved,
  allItems, itemsLoading, itemsError,
  users, usersLoading,
  locations, locationsLoading, locationsError,
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationId, setLocationId] = useState("");
  const [adjType, setAdjType] = useState("Increase");
  const [reason, setReason] = useState("");
  const [adjustedBy, setAdjustedBy] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const locationOptions = locations.map((l) => ({ value: String(l.id), label: `${l.name} (${l.warehouseName})` }));
  const userOptions = users.map(u => ({ value: String(u.id), label: u.name }));

  const adjTypes = [
    { id: "Increase", icon: icons.plus, color: "#16a34a", label: "Increase Stock", sub: "Add stock to inventory" },
    { id: "Decrease", icon: icons.minus, color: "#dc2626", label: "Decrease Stock", sub: "Remove stock from inventory" },
    { id: "Set Stock", icon: icons.set, color: "#d97706", label: "Set Stock", sub: "Set inventory to a specific quantity" },
  ];

  const addItem = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const handlePickItem = async (rowId, apiItem) => {
    setItems(p => p.map(r => r.id === rowId ? {
      ...r,
      itemId: apiItem.id,
      item: apiItem.name,
      sku: apiItem.sku || "",
      unit: apiItem.unit?.abbreviation || apiItem.unit?.name || "",
      unitCost: parseFloat(apiItem.unit_cost) || r.unitCost,
      stockLoading: true,
    } : r));

    try {
      const balance = await api.getItemStockBalance(apiItem.id);
      setItems(p => p.map(r => r.id === rowId ? { ...r, currentStock: balance?.total_available ?? balance?.total_on_hand ?? 0, stockLoading: false } : r));
    } catch {
      setItems(p => p.map(r => r.id === rowId ? { ...r, stockLoading: false } : r));
    }
  };

  const totalQty = items.reduce((s, r) => s + Math.abs(+r.adjQty), 0);
  const totalImpact = items.reduce((s, r) => s + r.adjQty * r.unitCost, 0);

  function resetForm() {
    setDate(new Date().toISOString().slice(0, 10));
    setLocationId("");
    setAdjType("Increase");
    setReason("");
    setAdjustedBy("");
    setItems([emptyItem()]);
    setSaveError(null);
  }

  function validate() {
    if (!locationId) return "Select a location.";
    if (!reason.trim()) return "Enter a reason.";
    const validItems = items.filter((r) => r.itemId);
    if (validItems.length === 0) return "Add at least one item.";
    if (validItems.some((r) => !r.adjQty)) return "Every item needs a quantity.";
    return null;
  }

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    const selectedLocation = locations.find((l) => String(l.id) === String(locationId));
    const payload = {
      warehouse_id: selectedLocation.warehouseId,
      warehouse_location_id: selectedLocation.id,
      adjustment_type: TYPE_SLUG[adjType],
      reason: reason.trim(),
      adjustment_date: date,
      items: items
        .filter((r) => r.itemId)
        .map((r) => ({ item_id: r.itemId, adjustment_quantity: Number(r.adjQty) })),
    };

    setSaving(true);
    setSaveError(null);
    try {
      await api.createAdjustment(payload);
      resetForm();
      onSaved();
    } catch (err) {
      setSaveError(err.message || "Couldn't save this adjustment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">New Inventory Adjustment</h2>
            <p className="text-sm text-gray-500 mt-0.5">Record inventory quantity adjustments.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        {saveError && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <Icon d={icons.warning} size={15} /> {saveError}
          </div>
        )}
        {locationsError && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <Icon d={icons.warning} size={15} /> Couldn't load locations: {locationsError}
          </div>
        )}
        {itemsError && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <Icon d={icons.warning} size={15} /> Couldn't load items: {itemsError}
          </div>
        )}

        {/* Step 1: Adjustment Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="font-semibold text-gray-800">Adjustment Information</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-3">
              {adjTypes.map(t => (
                <AdjTypeButton key={t.id} {...t} selected={adjType === t.id} onClick={setAdjType} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DatePicker label="Adjustment Date" required value={date} onChange={setDate} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location<span className="text-red-500">*</span></label>
              <Select
                value={locationId}
                onChange={setLocationId}
                options={locationOptions}
                placeholder={locationsLoading ? "Loading locations..." : "Select location"}
                disabled={locationsLoading || locationOptions.length === 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-500">*</span></label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Damaged in transit"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted By</label>
              <Select value={adjustedBy} onChange={setAdjustedBy} options={userOptions} placeholder={usersLoading ? "Loading users..." : "Select user"} disabled={usersLoading} />
            </div>
          </div>
        </div>

        {/* Step 2: Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="font-semibold text-gray-800">Items</span>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">Item *</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">Current Stock</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">Unit</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">
                      {adjType === "Set Stock" ? "Set Qty *" : "Adjustment Qty *"}
                    </th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">Unit Cost (₦)</th>
                    <th className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500">
                      {adjType === "Set Stock" ? "New Stock" : "Est. Value Impact (₦)"}
                    </th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const impact = adjType === "Set Stock" ? row.adjQty : row.adjQty * row.unitCost;
                    return (
                      <tr key={row.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <ItemPicker row={row} allItems={allItems} itemsLoading={itemsLoading} itemsError={itemsError} onPick={(it) => handlePickItem(row.id, it)} />
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-400">{row.sku || "—"}</td>
                        <td className="py-2 px-3 text-sm text-gray-700">{row.stockLoading ? <Loader2 size={13} className="animate-spin text-gray-400" /> : row.currentStock}</td>
                        <td className="py-2 px-3 text-sm text-gray-500">{row.unit || "—"}</td>
                        <td className="py-2 px-3">
                          <input type="number" value={row.adjQty} onChange={e => updateItem(row.id, "adjQty", +e.target.value)} className="w-20 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                        </td>
                        <td className="py-2 px-3">
                          <input type="number" value={row.unitCost} onChange={e => updateItem(row.id, "unitCost", +e.target.value)} className="w-24 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className={`py-2 px-3 text-sm font-medium whitespace-nowrap ${adjType !== "Set Stock" && impact < 0 ? "text-red-500" : adjType !== "Set Stock" && impact > 0 ? "text-green-600" : "text-gray-700"}`}>
                          {adjType === "Set Stock" ? row.adjQty : impact.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <button onClick={() => removeItem(row.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500">
                            <Icon d={icons.trash} size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
                <Icon d={icons.plus} size={14} /> Add Item
              </button>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span>Total Items: <strong className="text-gray-700">{items.filter(r => r.itemId).length}</strong></span>
                <span>Total Adjustment Qty: <strong className="text-gray-700">{totalQty}</strong></span>
                {adjType !== "Set Stock" && (
                  <span>Est. Value Impact (₦): <strong className={totalImpact >= 0 ? "text-green-600" : "text-red-500"}>₦{totalImpact.toLocaleString()}</strong></span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Unit cost is only used to preview the value impact here — it isn't sent to the API.</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} Save Adjustment
          </button>
        </div>
      </div>
    </Modal>
  );
}