import { useState, useRef, useEffect } from "react";


const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  receipt: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  transfer: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  adjustment: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  stockcount: "M4 6h16M4 10h16M4 14h16M4 18h16",
  search: "M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z",
  plus: "M12 4v16m8-8H4",
  x: "M6 18L18 6M6 6l12 12",
  chevronDown: "M19 9l-7 7-7-7",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  arrowUp: "M5 10l7-7m0 0l7 7m-7-7v18",
  arrowDown: "M19 14l-7 7m0 0l-7-7m7 7V3",
};


const Badge = ({ type }) => {
  const styles = {
    Receipt: "bg-green-100 text-green-700",
    Transfer: "bg-blue-100 text-blue-700",
    Adjustment: "bg-orange-100 text-orange-700",
    "Stock Count": "bg-purple-100 text-purple-700",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || "bg-gray-100 text-gray-600"}`}>{type}</span>;
};

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

const Select = ({ value, onChange, options, placeholder, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <Icon d={icons.chevronDown} size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

const Input = ({ label, required, placeholder, value, onChange, type = "text", className = "" }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
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
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => inputRef.current?.showPicker?.()} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
          <Icon d={icons.calendar} size={15} />
        </button>
      </div>
    </div>
  );
};


const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};


const txTypes = [
  { id: "Receipt", icon: icons.receipt, color: "text-green-500 bg-green-50", desc: "Record items received into inventory." },
  { id: "Transfer", icon: icons.transfer, color: "text-blue-500 bg-blue-50", desc: "Move items between different locations." },
  { id: "Adjustment", icon: icons.adjustment, color: "text-orange-500 bg-orange-50", desc: "Adjust inventory quantities." },
  { id: "Stock Count", icon: icons.stockcount, color: "text-purple-500 bg-purple-50", desc: "Record physical stock count." },
];

const TypeCard = ({ t, selected, onClick }) => (
  <button
    onClick={() => onClick(t.id)}
    className={`border-2 rounded-xl p-4 text-left transition-all flex-1 ${selected ? "border-blue-600 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}>
        <Icon d={t.icon} size={18} />
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-blue-600" : "border-gray-300"}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
      </div>
    </div>
    <p className="font-semibold text-gray-900 text-sm">{t.id}</p>
    <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
  </button>
);


const emptyItem = () => ({ id: Date.now(), item: "", sku: "", unit: "", qty: 0, unitCost: 0 });

const ItemRow = ({ row, idx, onChange, onRemove, showCost = true, showAvailable = false, showCurrentStock = false, showAdjQty = false, showNewStock = false }) => {
  const total = (row.qty * row.unitCost).toFixed(2);
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 px-3 text-sm text-gray-500">{idx + 1}</td>
      <td className="py-2 px-3">
        <input value={row.item} onChange={e => onChange(row.id, "item", e.target.value)} placeholder="Search item..." className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>
      <td className="py-2 px-3 text-sm text-gray-400">{row.sku || "—"}</td>
      {showAvailable && <td className="py-2 px-3 text-sm text-gray-400">—</td>}
      {showCurrentStock && <td className="py-2 px-3 text-sm text-gray-400">0</td>}
      <td className="py-2 px-3">
        <select value={row.unit} onChange={e => onChange(row.id, "unit", e.target.value)} className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Unit</option>
          {["pcs", "kg", "box", "carton", "set"].map(u => <option key={u}>{u}</option>)}
        </select>
      </td>
      <td className="py-2 px-3">
        <input type="number" value={row.qty} onChange={e => onChange(row.id, "qty", +e.target.value)} className="w-16 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
      </td>
      {showCost && <td className="py-2 px-3">
        <input type="number" value={row.unitCost} onChange={e => onChange(row.id, "unitCost", +e.target.value)} className="w-24 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>}
      {showCost && <td className="py-2 px-3 text-sm font-medium text-gray-700">{Number(total).toLocaleString()}</td>}
      {showNewStock && <td className="py-2 px-3 text-sm text-gray-700">{row.qty}</td>}
      <td className="py-2 px-3">
        <button onClick={() => onRemove(row.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500">
          <Icon d={icons.trash} size={13} />
        </button>
      </td>
    </tr>
  );
};


const NewTransactionModal = ({ open, onClose, onSave }) => {
  const [type, setType] = useState("Receipt");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier] = useState("");
  const [receivingLoc, setReceivingLoc] = useState("");
  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [location, setLocation] = useState("");
  const [adjustType, setAdjustType] = useState("Increase Stock");
  const [reason, setReason] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [refNum, setRefNum] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const addItem = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const totalQty = items.reduce((s, r) => s + +r.qty, 0);
  const totalCost = items.reduce((s, r) => s + r.qty * r.unitCost, 0);

  const handleSave = () => {
    onSave({ type, date, items });
    onClose();
  };

  const locs = ["Receiving Area", "Storage Area", "Storage Area A1-01", "Dispatch Area", "Damaged Goods Area"];
  const users = ["Inventory Officer", "Warehouse Manager", "System Administrator"];
  const reasons = ["Damaged items", "Lost during handling", "Stock count variance", "Supplier sent extra items", "New stock found", "Customer return"];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Inventory Transaction</h2>
            <p className="text-sm text-gray-500 mt-0.5">Select the type of transaction and fill in the details below.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="font-semibold text-gray-800">Transaction Type</span>
          </div>
          <div className="flex gap-3">
            {txTypes.map(t => <TypeCard key={t.id} t={t} selected={type === t.id} onClick={setType} />)}
          </div>
        </div>

        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <span className="font-semibold text-gray-800">{type} Information</span>
          </div>

          {type === "Receipt" && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier<span className="text-red-500">*</span></label>
                <Select value={supplier} onChange={setSupplier} options={["TechMart Ltd", "Office Supplies Co", "Digital Hub"]} placeholder="Select supplier" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Location<span className="text-red-500">*</span></label>
                <Select value={receivingLoc} onChange={setReceivingLoc} options={locs} placeholder="Select location" />
              </div>
              <DateTimePicker label="Receipt Date" required value={date} onChange={setDate} />
              <Input label="Reference Number" placeholder="Enter PO or reference number (optional)" value={refNum} onChange={setRefNum} className="col-span-1" />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Enter any notes (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          )}

          {type === "Transfer" && (
            <div className="grid grid-cols-3 gap-4">
              <DateTimePicker label="Transfer Date" required value={date} onChange={setDate} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Location<span className="text-red-500">*</span></label>
                <Select value={fromLoc} onChange={setFromLoc} options={locs} placeholder="Select source location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Location<span className="text-red-500">*</span></label>
                <Select value={toLoc} onChange={setToLoc} options={locs} placeholder="Select destination location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested By<span className="text-red-500">*</span></label>
                <Select value={requestedBy} onChange={setRequestedBy} options={users} placeholder="Select user" />
              </div>
              <Input label="Reference Number (optional)" placeholder="Enter reference number (e.g. TRF-001)" value={refNum} onChange={setRefNum} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Enter any notes (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          )}

          {type === "Adjustment" && (
            <div className="grid grid-cols-3 gap-4">
              <DateTimePicker label="Adjustment Date" required value={date} onChange={setDate} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location<span className="text-red-500">*</span></label>
                <Select value={location} onChange={setLocation} options={locs} placeholder="Select location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type<span className="text-red-500">*</span></label>
                <Select value={adjustType} onChange={setAdjustType} options={["Increase Stock", "Decrease Stock", "Set Stock"]} placeholder="Select adjustment type" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason<span className="text-red-500">*</span></label>
                <Select value={reason} onChange={setReason} options={reasons} placeholder="Select reason" />
              </div>
              <Input label="Reference Number (optional)" placeholder="Enter reference number (e.g. ADJ-001)" value={refNum} onChange={setRefNum} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Enter any notes (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          )}

          {type === "Stock Count" && (
            <div className="grid grid-cols-3 gap-4">
              <DateTimePicker label="Count Date" required value={date} onChange={setDate} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location<span className="text-red-500">*</span></label>
                <Select value={location} onChange={setLocation} options={locs} placeholder="Select location" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Counted By<span className="text-red-500">*</span></label>
                <Select value={requestedBy} onChange={setRequestedBy} options={users} placeholder="Select user" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Enter any notes (optional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Items */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
            <span className="font-semibold text-gray-800">Items</span>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 w-8">#</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Item *</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">SKU</th>
                  {type === "Transfer" && <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Available Stock</th>}
                  {type === "Adjustment" && <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Current Stock</th>}
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Unit</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Quantity *</th>
                  {(type === "Receipt" || type === "Adjustment") && <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Unit Cost (₦)</th>}
                  {(type === "Receipt" || type === "Adjustment") && <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Total Cost (₦)</th>}
                  <th className="py-2 px-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <ItemRow key={row.id} row={row} idx={idx} onChange={updateItem} onRemove={removeItem}
                    showCost={type === "Receipt" || type === "Adjustment"}
                    showAvailable={type === "Transfer"}
                    showCurrentStock={type === "Adjustment"}
                  />
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 flex items-center justify-between bg-gray-50 border-t border-gray-100">
              <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700">
                <Icon d={icons.plus} size={14} /> Add Item
              </button>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Total Items: <strong className="text-gray-700">{items.length}</strong></span>
                <span>Total Quantity: <strong className="text-gray-700">{totalQty}</strong></span>
                {(type === "Receipt" || type === "Adjustment") && <span>Total Cost: <strong className="text-gray-900">₦{totalCost.toLocaleString()}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Save {type}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK = [
  { id: "TXN-000156", date: "May 27, 2025", time: "10:15 AM", type: "Receipt", item: "HP LaserJet Pro MFP M428", sku: "PRN-001", from: "—", to: "Receiving Area", qty: 10, unitCost: 250000, total: 2500000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000155", date: "May 27, 2025", time: "09:32 AM", type: "Transfer", item: "Dell Latitude 5440", sku: "LAP-001", from: "Receiving Area", to: "Storage Area", qty: 20, unitCost: 850000, total: 17000000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000154", date: "May 26, 2025", time: "04:45 PM", type: "Adjustment", item: "USB-C Hub 7-in-1", sku: "ACC-003", from: "Storage Area", to: "Damaged Goods Area", qty: -5, unitCost: 25000, total: -125000, user: "Warehouse Manager", status: "Completed" },
  { id: "TXN-000153", date: "May 26, 2025", time: "02:10 PM", type: "Transfer", item: "Ergonomic Office Chair", sku: "CHR-002", from: "Storage Area", to: "Dispatch Area", qty: 3, unitCost: 75000, total: 225000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000152", date: "May 26, 2025", time: "11:05 AM", type: "Stock Count", item: "Wireless Mouse", sku: "ACC-005", from: "Storage Area", to: "Storage Area", qty: 15, unitCost: 12000, total: 180000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000151", date: "May 25, 2025", time: "03:22 PM", type: "Receipt", item: '24" LED Monitor', sku: "MON-001", from: "—", to: "Receiving Area", qty: 8, unitCost: 95000, total: 760000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000150", date: "May 25, 2025", time: "10:18 AM", type: "Adjustment", item: "HP 58A Toner Cartridge", sku: "CON-001", from: "Storage Area", to: "Storage Area", qty: 2, unitCost: 45000, total: 90000, user: "Inventory Officer", status: "Pending" },
  { id: "TXN-000149", date: "May 24, 2025", time: "04:05 PM", type: "Transfer", item: "Cat6 Ethernet Cable 2M", sku: "CAB-002", from: "Storage Area", to: "Receiving Area", qty: 30, unitCost: 3500, total: 105000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000148", date: "May 24, 2025", time: "01:15 PM", type: "Receipt", item: "Office Desk", sku: "DSK-001", from: "—", to: "Dispatch Area", qty: 5, unitCost: 120000, total: 600000, user: "Warehouse Manager", status: "Completed" },
  { id: "TXN-000147", date: "May 24, 2025", time: "09:40 AM", type: "Stock Count", item: "Mechanical Keyboard", sku: "ACC-006", from: "Storage Area", to: "Storage Area", qty: 12, unitCost: 18000, total: 216000, user: "Inventory Officer", status: "Completed" },
];

// ── Stats Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, change, positive, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon d={icon} size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs mt-0.5 flex items-center gap-1 ${positive ? "text-green-600" : "text-red-500"}`}>
          <Icon d={positive ? icons.arrowUp : icons.arrowDown} size={11} strokeWidth={2.5} />
          {change} vs last 7 days
        </p>
      </div>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [transactions, setTransactions] = useState(MOCK);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = transactions.filter(t =>
    (!filterType || t.type === filterType) &&
    (!filterStatus || t.status === filterStatus) &&
    (!search || t.item.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()))
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data) => {
    const newTx = {
      id: `TXN-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: data.type,
      item: data.items[0]?.item || "New Item",
      sku: "NEW-001",
      from: "—",
      to: "Receiving Area",
      qty: data.items.reduce((s, r) => s + +r.qty, 0),
      unitCost: 0,
      total: 0,
      user: "System Administrator",
      status: "Pending",
    };
    setTransactions(p => [newTx, ...p]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and track all inventory transactions across your organization.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Icon d={icons.download} size={15} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Icon d={icons.filter} size={15} /> Filters
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
            <Icon d={icons.plus} size={15} /> New Transaction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <StatCard label="Total Transactions" value="1,248" change="12.5%" positive icon={icons.receipt} color="text-blue-500 bg-blue-50" />
        <StatCard label="Receipts" value="456" change="18.2%" positive icon={icons.download} color="text-green-500 bg-green-50" />
        <StatCard label="Transfers" value="312" change="9.4%" positive icon={icons.transfer} color="text-blue-500 bg-blue-50" />
        <StatCard label="Adjustments" value="214" change="6.7%" positive={false} icon={icons.adjustment} color="text-orange-500 bg-orange-50" />
        <StatCard label="Stock Counts" value="266" change="4.3%" positive icon={icons.stockcount} color="text-purple-500 bg-purple-50" />
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-500 border-r border-gray-200 pr-3">
          <Icon d={icons.calendar} size={14} /> May 21 – 27, 2025
        </div>
        <Select value={filterType} onChange={v => { setFilterType(v); setPage(1); }} options={["Receipt", "Transfer", "Adjustment", "Stock Count"]} placeholder="All Types" className="w-36" />
        <Select value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }} options={["Completed", "Pending", "Cancelled"]} placeholder="All Statuses" className="w-36" />
        <div className="relative ml-auto">
          <Icon d={icons.search} size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search item..."
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Date & Time", "Type", "Item", "From", "To", "Quantity", "Unit Cost (₦)", "Total Value (₦)", "User", "Status", "Actions"].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{t.id}</td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-800">{t.date}</p>
                  <p className="text-xs text-gray-400">{t.time}</p>
                </td>
                <td className="py-3 px-4"><Badge type={t.type} /></td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-800">{t.item}</p>
                  <p className="text-xs text-gray-400">{t.sku}</p>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{t.from}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{t.to}</td>
                <td className={`py-3 px-4 text-sm font-medium ${t.qty < 0 ? "text-red-500" : "text-gray-800"}`}>{t.qty}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{t.unitCost.toLocaleString()}</td>
                <td className={`py-3 px-4 text-sm font-semibold ${t.total < 0 ? "text-red-500" : "text-gray-800"}`}>{t.total.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{t.user}</td>
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
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} transactions</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
            ))}
            {pages > 5 && <span className="text-gray-400 text-sm">...</span>}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      <NewTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
    </div>
  );
}
