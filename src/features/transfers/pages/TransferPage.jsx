import { useState, useRef } from "react";

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  transfer: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  transferAlt: "M8 7h12m0 0l-4-4m4 4l-4 4M4 17h12m0 0l-4-4m4 4l-4 4",
  plus: "M12 4v16m8-8H4",
  x: "M6 18L18 6M6 6l12 12",
  search: "M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  template: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  chevronDown: "M19 9l-7 7-7-7",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  arrowUp: "M5 10l7-7m0 0l7 7m-7-7v18",
  arrowRight: "M13 7l5 5m0 0l-5 5m5-5H6",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  clearAll: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };
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

const DateTimePicker = ({ label, required, value, onChange, showTime = false, className = "" }) => {
  const inputRef = useRef(null);
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        <input
          ref={inputRef}
          type={showTime ? "datetime-local" : "date"}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => inputRef.current?.showPicker?.()} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
          <Icon d={showTime ? icons.clock : icons.calendar} size={15} />
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

// ── New Transfer Modal ───────────────────────────────────────────────────────
const emptyItem = () => ({ id: Date.now() + Math.random(), item: "", sku: "", unit: "", qty: "", availableStock: 0 });

const NewTransferModal = ({ open, onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [refNum, setRefNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [searchQty, setSearchQty] = useState("");
  const [searchUnit, setSearchUnit] = useState("");

  const locs = ["Receiving Area", "Storage Area", "Storage Area A1-01", "Storage Area A1-02", "Storage Area B2-01", "Dispatch Area", "Damaged Goods Area"];
  const users = ["Inventory Officer", "Warehouse Manager", "System Administrator"];

  const addItem = () => {
    if (!searchItem) return;
    setItems(p => [...p, { id: Date.now(), item: searchItem, sku: "—", unit: searchUnit, qty: searchQty || 0, availableStock: Math.floor(Math.random() * 100) }]);
    setSearchItem(""); setSearchQty(""); setSearchUnit("");
  };

  const removeItem = id => setItems(p => p.filter(r => r.id !== id));

  const totalQty = items.reduce((s, r) => s + +r.qty, 0);

  const handleSave = () => {
    onSave({ fromLoc, toLoc, date, items });
    onClose();
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

        {/* Step 1: Details */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="font-semibold text-gray-800">Transfer Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateTimePicker label="Transfer Date" required value={date} onChange={setDate} showTime className="col-span-1" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (optional)</label>
              <input value={refNum} onChange={e => setRefNum(e.target.value)} placeholder="Enter reference number (e.g. PO, Ticket #)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By<span className="text-red-500">*</span></label>
              <Select value={requestedBy} onChange={setRequestedBy} options={users} placeholder="Select user" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Location<span className="text-red-500">*</span></label>
              <Select value={fromLoc} onChange={setFromLoc} options={locs} placeholder="Select source location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Location<span className="text-red-500">*</span></label>
              <Select value={toLoc} onChange={setToLoc} options={locs} placeholder="Select destination location" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={1} placeholder="Enter any notes for this transfer" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Step 2: Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="font-semibold text-gray-800">Items</span>
          </div>

          {/* Add item bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1 min-w-0">
              <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                placeholder="Search item by name, SKU or barcode"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <input value={searchQty} onChange={e => setSearchQty(e.target.value)} placeholder="Enter quantity" className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <Select value={searchUnit} onChange={setSearchUnit} options={["pcs", "kg", "box", "carton", "set"]} placeholder="Select unit" className="w-full sm:w-36" />
              <button onClick={addItem} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0">
                <Icon d={icons.plus} size={14} /> Add Item
              </button>
            </div>
          </div>

          {/* Items table */}
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
                      <td className="py-2 px-3 text-sm text-gray-600">{row.unit || "—"}</td>
                      <td className="py-2 px-3 text-sm text-gray-700">{row.availableStock}</td>
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
            <p className="text-xs text-blue-700">Transfers will be processed based on availability at the source location.</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Save Transfer</button>
        </div>
      </div>
    </Modal>
  );
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRANSFERS = [
  { id: "TRF-000312", date: "May 27, 2025", time: "02:45 PM", item: "Dell Latitude 5440", sku: "LAP-001", from: "Receiving Area", to: "Storage Area", qty: 20, requestedBy: "Inventory Officer", status: "Completed" },
  { id: "TRF-000311", date: "May 27, 2025", time: "11:20 AM", item: "Ergonomic Office Chair", sku: "CHR-002", from: "Storage Area", to: "Dispatch Area", qty: 3, requestedBy: "Inventory Officer", status: "Completed" },
  { id: "TRF-000310", date: "May 26, 2025", time: "04:15 PM", item: "USB-C Hub 7-in-1", sku: "ACC-003", from: "Storage Area", to: "Damaged Goods Area", qty: -5, requestedBy: "Warehouse Manager", status: "Completed" },
  { id: "TRF-000309", date: "May 26, 2025", time: "10:05 AM", item: "HP LaserJet Pro M428", sku: "PRN-001", from: "Receiving Area", to: "Storage Area", qty: 10, requestedBy: "Inventory Officer", status: "Completed" },
  { id: "TRF-000308", date: "May 25, 2025", time: "03:30 PM", item: "Cat6 Ethernet Cable 2M", sku: "CAB-002", from: "Storage Area", to: "Dispatch Area", qty: 30, requestedBy: "Inventory Officer", status: "Pending" },
  { id: "TRF-000307", date: "May 25, 2025", time: "09:45 AM", item: '24" LED Monitor', sku: "MON-001", from: "Storage Area", to: "Receiving Area", qty: 5, requestedBy: "Inventory Officer", status: "Pending" },
  { id: "TRF-000306", date: "May 24, 2025", time: "02:10 PM", item: "Mechanical Keyboard", sku: "ACC-006", from: "Storage Area", to: "Dispatch Area", qty: 12, requestedBy: "Inventory Officer", status: "Completed" },
  { id: "TRF-000305", date: "May 24, 2025", time: "10:30 AM", item: "HP 58A Toner Cartridge", sku: "CON-001", from: "Storage Area", to: "Storage Area B", qty: 2, requestedBy: "Warehouse Manager", status: "Cancelled" },
  { id: "TRF-000304", date: "May 23, 2025", time: "04:50 PM", item: "Wireless Mouse", sku: "ACC-005", from: "Dispatch Area", to: "Storage Area", qty: 15, requestedBy: "Inventory Officer", status: "Completed" },
  { id: "TRF-000303", date: "May 23, 2025", time: "09:15 AM", item: "Office Desk", sku: "DSK-001", from: "Storage Area", to: "Dispatch Area", qty: 2, requestedBy: "Inventory Officer", status: "Completed" },
];

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TransfersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const locs = ["Receiving Area", "Storage Area", "Dispatch Area", "Damaged Goods Area"];

  const filtered = transfers.filter(t =>
    (!fromFilter || t.from === fromFilter) &&
    (!toFilter || t.to === toFilter) &&
    (!statusFilter || t.status === statusFilter)
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pendingCount = transfers.filter(t => t.status === "Pending").length;

  const handleSave = (data) => {
    setTransfers(p => [{
      id: `TRF-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      item: data.items[0]?.item || "New Item",
      sku: "NEW-001",
      from: data.fromLoc || "—",
      to: data.toLoc || "—",
      qty: data.items.reduce((s, r) => s + +r.qty, 0),
      requestedBy: "System Administrator",
      status: "Pending",
    }, ...p]);
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-5">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transfers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Move inventory items between different locations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Icon d={icons.download} size={15} /> Export
            </button>
            <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Icon d={icons.filter} size={15} /> Filters
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
            </button>
            <button onClick={() => setModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              <Icon d={icons.plus} size={15} /> New Transfer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Transfers", value: "312", sub: "▲ 9.4% vs last 7 days", subColor: "text-green-600", icon: icons.transferAlt, bg: "bg-blue-50 text-blue-500" },
            { label: "Total Qty Transferred", value: "2,845", sub: "▲ 11.6% vs last 7 days", subColor: "text-green-600", icon: icons.box, bg: "bg-green-50 text-green-500" },
            { label: "Total Value Transferred", value: "₦28,450,000", sub: "▲ 7.2% vs last 7 days", subColor: "text-green-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", bg: "bg-orange-50 text-orange-500" },
            { label: "Pending Transfers", value: `${pendingCount}`, sub: "Pending approval/processing", subColor: "text-orange-500", icon: icons.clock, bg: "bg-red-50 text-red-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                  <Icon d={s.icon} size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 truncate">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
                  <p className={`text-xs ${s.subColor} truncate`}>{s.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500 sm:border-r border-gray-200 sm:pr-3 whitespace-nowrap">
            <Icon d={icons.calendar} size={14} /> May 21 – 27, 2025
          </div>
          <Select value={fromFilter} onChange={v => { setFromFilter(v); setPage(1); }} options={locs} placeholder="From Location" className="w-full sm:w-40" />
          <Select value={toFilter} onChange={v => { setToFilter(v); setPage(1); }} options={locs} placeholder="To Location" className="w-full sm:w-40" />
          <Select value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={["Completed", "Pending", "Cancelled"]} placeholder="All Statuses" className="w-full sm:w-36" />
          {(fromFilter || toFilter || statusFilter) && (
            <button onClick={() => { setFromFilter(""); setToFilter(""); setStatusFilter(""); setPage(1); }} className="text-sm text-red-500 hover:underline sm:ml-auto">Clear filters</button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Transfer ID", "Date & Time", "Item", "From Location", "To Location", "Quantity", "Requested By", "Status", "Actions"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline whitespace-nowrap">{t.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-sm text-gray-800">{t.date}</p>
                      <p className="text-xs text-gray-400">{t.time}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon d={icons.box} size={14} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{t.item}</p>
                          <p className="text-xs text-gray-400">{t.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{t.from}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{t.to}</td>
                    <td className={`py-3 px-4 text-sm font-semibold whitespace-nowrap ${t.qty < 0 ? "text-red-500" : "text-gray-800"}`}>{t.qty}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{t.requestedBy}</td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4">
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
            <p className="text-sm text-gray-500 text-center sm:text-left">Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} transfers</p>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => setModalOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 border border-dashed border-blue-300 text-blue-600 transition-colors">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Icon d={icons.plus} size={13} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">New Transfer</p>
                <p className="text-xs text-blue-400">Create a new inventory transfer</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-200 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Icon d={icons.clock} size={13} className="text-orange-500" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">Pending Transfers</p>
                  <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>
                </div>
                <p className="text-xs text-gray-400">View all pending transfers</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Icon d={icons.template} size={13} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Transfer Templates</p>
                <p className="text-xs text-gray-400">Manage transfer templates</p>
              </div>
            </button>
          </div>
        </div>

        {/* Transfer Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Transfer Summary <span className="text-xs text-gray-400 font-normal">(This Month)</span></h3>
          <div className="space-y-3">
            {[
              { label: "Total Transfers", value: "78" },
              { label: "Quantity Transferred", value: "642" },
              { label: "Value Transferred", value: "₦7,950,000" },
              { label: "Pending Transfers", value: pendingCount, valueClass: "text-orange-500" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className={`text-sm font-semibold ${s.valueClass || "text-gray-900"}`}>{s.value}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View full report <Icon d={icons.arrowRight} size={13} />
          </button>
        </div>

        {/* Help */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon d={icons.book} size={15} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Help & Guidelines</h3>
          </div>
          <p className="text-xs font-medium text-gray-700 mb-1">Learn how transfers work</p>
          <p className="text-xs text-gray-500 mb-3">Transfers move items between locations without affecting total stock.</p>
          <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View Guide <Icon d={icons.arrowRight} size={13} />
          </button>
        </div>
      </div>

      <NewTransferModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}