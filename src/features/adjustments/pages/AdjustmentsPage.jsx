import { useState, useRef } from "react";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  adjustment: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  plus: "M12 4v16m8-8H4",
  minus: "M20 12H4",
  x: "M6 18L18 6M6 6l12 12",
  search: "M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  chevronDown: "M19 9l-7 7-7-7",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  arrowUp: "M5 10l7-7m0 0l7 7m-7-7v18",
  arrowDown: "M19 14l-7 7m0 0l-7-7m7 7V3",
  refresh: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  set: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const AdjBadge = ({ type }) => {
  const s = { Increase: "bg-green-100 text-green-700", Decrease: "bg-red-100 text-red-600", "Set Stock": "bg-yellow-100 text-yellow-700" };
  return <span className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${s[type] || "bg-gray-100 text-gray-600"}`}>{type}</span>;
};

const StatusBadge = ({ status }) => {
  const s = { Completed: "bg-green-100 text-green-700", Pending: "bg-yellow-100 text-yellow-700", Cancelled: "bg-red-100 text-red-700" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

const Select = ({ value, onChange, options, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <select value={value} onChange={e => onChange(e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <Icon d={icons.chevronDown} size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

const DateTimePicker = ({ label, required, value, onChange, className = "" }) => {
  const inputRef = useRef(null);
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type="datetime-local"
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

// ── Modal ────────────────────────────────────────────────────────────────────
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

// ── Adjustment Type Selector ─────────────────────────────────────────────────
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

// ── New Adjustment Modal ─────────────────────────────────────────────────────
const emptyItem = () => ({ id: Date.now() + Math.random(), item: "", sku: "", unit: "", currentStock: 0, adjQty: 0, unitCost: 0 });

const NewAdjustmentModal = ({ open, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [adjType, setAdjType] = useState("Increase");
  const [reason, setReason] = useState("");
  const [refNum, setRefNum] = useState("");
  const [adjustedBy, setAdjustedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const locs = ["Receiving Area", "Storage Area", "Storage Area A1-01", "Storage Area A1-02", "Storage Area B2-01", "Storage Area B2-02", "Dispatch Area", "Dispatch Area D1-01", "Damaged Goods Area"];
  const users = ["Inventory Officer", "Warehouse Manager", "System Administrator"];
  const reasons = ["Damaged items", "Lost during handling", "Stock count variance adjustment", "Supplier sent extra items", "Additional stock found in store", "New stock found", "Customer return – damaged", "Not working", "Received missing items from supplier"];

  const adjTypes = [
    { id: "Increase", icon: icons.plus, color: "#16a34a", label: "Increase Stock", sub: "Add stock to inventory" },
    { id: "Decrease", icon: icons.minus, color: "#dc2626", label: "Decrease Stock", sub: "Remove stock from inventory" },
    { id: "Set Stock", icon: icons.set, color: "#d97706", label: "Set Stock", sub: "Set inventory to a specific quantity" },
  ];

  const addItem = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const totalQty = items.reduce((s, r) => s + Math.abs(+r.adjQty), 0);
  const totalImpact = items.reduce((s, r) => s + r.adjQty * r.unitCost, 0);

  const handleSave = () => {
    onSave({ adjType, date, location, reason, items });
    onClose();
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

        {/* Step 1: Adjustment Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="font-semibold text-gray-800">Adjustment Information</span>
          </div>

          {/* Adjustment Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type<span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-3">
              {adjTypes.map(t => (
                <AdjTypeButton key={t.id} {...t} selected={adjType === t.id} onClick={setAdjType} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateTimePicker label="Adjustment Date" required value={date} onChange={setDate} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location<span className="text-red-500">*</span></label>
              <Select value={location} onChange={setLocation} options={locs} placeholder="Select location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-500">*</span></label>
              <Select value={reason} onChange={setReason} options={reasons} placeholder="Select reason" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (optional)</label>
              <input value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="Enter reference number (e.g. ADJ-001)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted By<span className="text-red-500">*</span></label>
              <Select value={adjustedBy} onChange={setAdjustedBy} options={users} placeholder="Select user" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={1} placeholder="Enter any notes about this adjustment" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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
                      {adjType === "Set Stock" ? "New Stock" : "Total Impact (₦)"}
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
                          <input value={row.item} onChange={e => updateItem(row.id, "item", e.target.value)} placeholder="Search item..." className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-400">{row.sku || "—"}</td>
                        <td className="py-2 px-3 text-sm text-gray-700">{row.currentStock}</td>
                        <td className="py-2 px-3">
                          <select value={row.unit} onChange={e => updateItem(row.id, "unit", e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Unit</option>
                            {["pcs", "kg", "box", "carton", "set"].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
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
                <span>Total Items: <strong className="text-gray-700">{items.length}</strong></span>
                <span>Total Adjustment Qty: <strong className="text-gray-700">{totalQty}</strong></span>
                {adjType !== "Set Stock" && <span>Total Impact (₦): <strong className={totalImpact >= 0 ? "text-green-600" : "text-red-500"}>₦{totalImpact.toLocaleString()}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Save Adjustment</button>
        </div>
      </div>
    </Modal>
  );
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ADJ = [
  { id: "ADJ-000124", date: "May 27, 2025", time: "02:45 PM", item: "Dell Latitude 5440", sku: "LAP-001", type: "Increase", location: "Storage Area A1-01", qtyChange: +10, valueImpact: 6250000, reason: "Received missing items from supplier", adjustedBy: "Inventory Officer", status: "Completed" },
  { id: "ADJ-000123", date: "May 27, 2025", time: "11:20 AM", item: "HP LaserJet Pro M428", sku: "PRN-001", type: "Decrease", location: "Storage Area A1-02", qtyChange: -2, valueImpact: 1700000, reason: "Damaged items", adjustedBy: "Inventory Officer", status: "Completed" },
  { id: "ADJ-000122", date: "May 26, 2025", time: "04:15 PM", item: "Ergonomic Office Chair", sku: "CHR-002", type: "Increase", location: "Storage Area B2-01", qtyChange: +5, valueImpact: 750000, reason: "Stock count variance adjustment", adjustedBy: "Warehouse Manager", status: "Completed" },
  { id: "ADJ-000121", date: "May 26, 2025", time: "10:05 AM", item: "Cat6 Ethernet Cable 2M", sku: "CAB-002", type: "Decrease", location: "Storage Area A1-03", qtyChange: -15, valueImpact: 75000, reason: "Lost during handling", adjustedBy: "Inventory Officer", status: "Completed" },
  { id: "ADJ-000120", date: "May 25, 2025", time: "03:30 PM", item: "USB-C Hub 7-in-1", sku: "ACC-003", type: "Increase", location: "Storage Area A1-04", qtyChange: +8, valueImpact: 296000, reason: "Additional stock found in store", adjustedBy: "Inventory Officer", status: "Completed" },
  { id: "ADJ-000119", date: "May 25, 2025", time: "09:45 AM", item: '24" LED Monitor', sku: "MON-001", type: "Decrease", location: "Dispatch Area D1-01", qtyChange: -3, valueImpact: 165000, reason: "Damaged in transit", adjustedBy: "Warehouse Manager", status: "Pending" },
  { id: "ADJ-000118", date: "May 24, 2025", time: "02:10 PM", item: "HP 58A Toner Cartridge", sku: "CON-001", type: "Increase", location: "Storage Area B2-02", qtyChange: +12, valueImpact: 180000, reason: "Supplier sent extra items", adjustedBy: "Inventory Officer", status: "Completed" },
  { id: "ADJ-000117", date: "May 24, 2025", time: "10:30 AM", item: "Wireless Keyboard", sku: "ACC-004", type: "Decrease", location: "Storage Area A1-05", qtyChange: -6, valueImpact: 90000, reason: "Not working", adjustedBy: "Inventory Officer", status: "Cancelled" },
  { id: "ADJ-000116", date: "May 23, 2025", time: "04:50 PM", item: "Wireless Mouse", sku: "ACC-005", type: "Increase", location: "Storage Area B2-03", qtyChange: +20, valueImpact: 200000, reason: "New stock found", adjustedBy: "Warehouse Manager", status: "Completed" },
  { id: "ADJ-000115", date: "May 23, 2025", time: "09:15 AM", item: "Office Desk", sku: "DSK-001", type: "Decrease", location: "Dispatch Area D1-02", qtyChange: -1, valueImpact: 180000, reason: "Customer return – damaged", adjustedBy: "Inventory Officer", status: "Completed" },
];

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, subColor, icon, bg }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
        <Icon d={icon} size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className={`text-xs ${subColor} truncate`}>{sub}</p>}
      </div>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdjustmentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [adjustments, setAdjustments] = useState(MOCK_ADJ);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = adjustments.filter(a =>
    (!typeFilter || a.type === typeFilter) &&
    (!statusFilter || a.status === statusFilter) &&
    (!search || a.item.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase()))
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalIncreases = adjustments.filter(a => a.type === "Increase").length;
  const totalDecreases = adjustments.filter(a => a.type === "Decrease").length;
  const totalIncUnits = adjustments.filter(a => a.type === "Increase").reduce((s, a) => s + a.qtyChange, 0);
  const totalDecUnits = adjustments.filter(a => a.type === "Decrease").reduce((s, a) => s + Math.abs(a.qtyChange), 0);
  const totalValueImpact = adjustments.reduce((s, a) => s + a.valueImpact, 0);

  const handleSave = (data) => {
    setAdjustments(p => [{
      id: `ADJ-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      item: data.items[0]?.item || "New Item",
      sku: "NEW-001",
      type: data.adjType === "Increase" ? "Increase" : data.adjType === "Decrease" ? "Decrease" : "Set Stock",
      location: data.location || "Storage Area",
      qtyChange: data.adjType === "Increase" ? +data.items[0]?.adjQty : -Math.abs(data.items[0]?.adjQty || 0),
      valueImpact: 0,
      reason: data.reason || "Manual adjustment",
      adjustedBy: "System Administrator",
      status: "Pending",
    }, ...p]);
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Adjustments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record and manage inventory quantity adjustments.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <Icon d={icons.download} size={15} /> Export
          </button>
          <button onClick={() => setModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
            <Icon d={icons.plus} size={15} /> New Adjustment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Adjustments" value="124" sub="All time" subColor="text-gray-400" icon={icons.refresh} bg="bg-blue-50 text-blue-500" />
        <StatCard label="Total Increases" value={totalIncreases} sub={`+ ${totalIncUnits.toLocaleString()} units`} subColor="text-green-600" icon={icons.arrowUp} bg="bg-green-50 text-green-500" />
        <StatCard label="Total Decreases" value={totalDecreases} sub={`- ${totalDecUnits.toLocaleString()} units`} subColor="text-red-500" icon={icons.arrowDown} bg="bg-red-50 text-red-500" />
        <StatCard label="Total Value Impact" value={`₦${totalValueImpact.toLocaleString()}`} sub="All time" subColor="text-gray-400" icon={icons.dollar} bg="bg-purple-50 text-purple-500" />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
          <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search adjustments by reference, item, or reason..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 border-l border-gray-200 pl-3 whitespace-nowrap">
          <Icon d={icons.calendar} size={14} /> May 21 – 27, 2025
        </div>
        <Select value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} options={["Increase", "Decrease", "Set Stock"]} placeholder="All Types" className="w-full sm:w-36" />
        <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={["Completed", "Pending", "Cancelled"]} placeholder="All Statuses" className="w-full sm:w-36" />
        {(typeFilter || statusFilter || search) && (
          <button onClick={() => { setTypeFilter(""); setStatusFilter(""); setSearch(""); setPage(1); }} className="text-sm text-red-500 hover:underline sm:ml-auto">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Adjustment No.", "Date & Time", "Item", "Adjustment Type", "Location", "Quantity Change", "Value Impact (₦)", "Reason", "Adjusted By", "Status", ""].map(h => (
                  <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(a => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3 text-sm font-medium text-blue-600 cursor-pointer hover:underline whitespace-nowrap">{a.id}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="text-sm text-gray-800">{a.date}</p>
                    <p className="text-xs text-gray-400">{a.time}</p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon d={icons.box} size={13} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium leading-tight whitespace-nowrap">{a.item}</p>
                        <p className="text-xs text-gray-400">{a.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3"><AdjBadge type={a.type} /></td>
                  <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{a.location}</td>
                  <td className={`py-3 px-3 text-sm font-bold whitespace-nowrap ${a.qtyChange > 0 ? "text-green-600" : "text-red-500"}`}>
                    {a.qtyChange > 0 ? `+${a.qtyChange}` : a.qtyChange}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700 whitespace-nowrap">₦{a.valueImpact.toLocaleString()}</td>
                  <td className="py-3 px-3 text-sm text-gray-600 max-w-[160px]">
                    <span className="truncate block" title={a.reason}>{a.reason}</span>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{a.adjustedBy}</td>
                  <td className="py-3 px-3"><StatusBadge status={a.status} /></td>
                  <td className="py-3 px-3">
                    <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                      <Icon d={icons.dotsV} size={16} fill="currentColor" stroke="none" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500 text-center sm:text-left">Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} adjustments</p>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
            ))}
            {pages > 5 && <span className="text-gray-400 text-sm px-1">...</span>}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      <NewAdjustmentModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}