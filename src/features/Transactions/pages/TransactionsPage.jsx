import { useState, useRef, useEffect } from "react";

/* ─────────────────────────── icons ─────────────────────────── */
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  receipt: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  transfer: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  adjustment: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  stockcount: "M4 6h16M4 10h16M4 14h16M4 18h16",
  plus: "M12 4v16m8-8H4",
  x: "M6 18L18 6M6 6l12 12",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

/* ─────────────────────────── small svg icons ─────────────────────────── */
const SearchSm = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CalIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FilterIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const ChevDown = ({ color = "#9aa1b4" }) => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SortIcon = () => (
  <svg style={{ verticalAlign: "-2px", display: "inline" }} width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}>
    <polyline points="8 9 12 5 16 9" /><polyline points="16 15 12 19 8 15" />
  </svg>
);
const DotsIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth={2}>
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);
const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PlusIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevLeft = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevRight = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const EyeIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth={2}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

/* ─────────────────────────── pagination button ─────────────────────────── */
const PagBtn = ({ children, active, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    style={{
      width: 30, height: 30,
      background: active ? "#4f6ef7" : "#fff",
      border: active ? "none" : "1px solid #e4e7ef",
      borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: active ? "#fff" : disabled ? "#c0c4d0" : "#1e2740",
      fontSize: 12.5, fontWeight: active ? 600 : 400,
      cursor: disabled ? "default" : "pointer", userSelect: "none",
    }}
  >{children}</div>
);

/* ─────────────────────────── metric card ─────────────────────────── */
const MetricCard = ({ iconBg, icon, label, value, sub, subAccent, onClick }) => (
  <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 40, height: 40, background: iconBg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ color: "#6b7591", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: String(value).length > 8 ? 16 : 21, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div onClick={onClick} style={{ fontSize: 10.5, color: subAccent ? "#4f6ef7" : "#6b7591", marginTop: 2, fontWeight: subAccent ? 500 : 400, cursor: subAccent ? "pointer" : "default" }}>{sub}</div>
    </div>
  </div>
);

/* ─────────────────────────── date range picker ─────────────────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function DateRangePicker({ isOpen, initialStart, initialEnd, onClose, onApply }) {
  const today = startOfDay(new Date());
  const [hovered, setHovered] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [viewYear, setViewYear] = useState((initialStart || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((initialStart || today).getMonth());
  const [localStart, setLocalStart] = useState(initialStart || null);
  const [localEnd, setLocalEnd] = useState(initialEnd || null);

  if (!isOpen) return null;

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const total = daysInMonth(viewYear, viewMonth);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const handleDayClick = (day) => {
    const clicked = new Date(viewYear, viewMonth, day);
    if (!selecting) {
      setSelecting(clicked);
      setLocalStart(clicked);
      setLocalEnd(null);
    } else {
      const s = selecting <= clicked ? selecting : clicked;
      const e = selecting <= clicked ? clicked : selecting;
      setLocalStart(s);
      setLocalEnd(e);
      setSelecting(null);
    }
  };

  const isStart = (day) => localStart && startOfDay(localStart).getTime() === new Date(viewYear, viewMonth, day).getTime();
  const isEnd   = (day) => localEnd   && startOfDay(localEnd).getTime()   === new Date(viewYear, viewMonth, day).getTime();
  const inRange = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const end = selecting ? hovered : localEnd;
    if (!localStart || !end) return false;
    const s = localStart <= end ? localStart : end;
    const e = localStart <= end ? end : localStart;
    return d > s && d < e;
  };

  const presets = [
    { label: "Today", fn: () => { setLocalStart(today); setLocalEnd(today); setSelecting(null); } },
    { label: "Last 7 days", fn: () => { const s = new Date(today); s.setDate(s.getDate()-6); setLocalStart(s); setLocalEnd(today); setSelecting(null); } },
    { label: "Last 30 days", fn: () => { const s = new Date(today); s.setDate(s.getDate()-29); setLocalStart(s); setLocalEnd(today); setSelecting(null); } },
    { label: "This month", fn: () => { setLocalStart(new Date(today.getFullYear(),today.getMonth(),1)); setLocalEnd(today); setSelecting(null); } },
    { label: "Last month", fn: () => {
      const y = today.getMonth()===0 ? today.getFullYear()-1 : today.getFullYear();
      const m = today.getMonth()===0 ? 11 : today.getMonth()-1;
      setLocalStart(new Date(y,m,1)); setLocalEnd(new Date(y,m+1,0)); setSelecting(null);
    }},
  ];

  const fmtDate = (d) => d ? `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";

  return (
    <div style={{
      position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 500,
      background: "#fff", border: "1px solid #e4e7ef", borderRadius: 12,
      boxShadow: "0 8px 32px rgba(20,25,50,0.16)", display: "flex", overflow: "hidden",
      minWidth: 520,
    }}>
      {/* Presets */}
      <div style={{ padding: "16px 0", borderRight: "1px solid #e4e7ef", minWidth: 130 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#9aa1b4", padding: "0 16px 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick select</div>
        {presets.map(p => (
          <div key={p.label} onClick={p.fn}
            style={{ padding: "8px 16px", fontSize: 12.5, cursor: "pointer", color: "#1e2740" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >{p.label}</div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div onClick={prevMonth}
            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          ><ChevLeft /></div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{MONTHS[viewMonth]} {viewYear}</div>
          <div onClick={nextMonth}
            style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          ><ChevRight /></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)", gap: 2, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#9aa1b4", fontWeight: 500, padding: "2px 0" }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,32px)", gap: 2 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
          {Array.from({ length: total }, (_, i) => i + 1).map(day => {
            const s = isStart(day), e = isEnd(day), r = inRange(day);
            return (
              <div key={day}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => selecting && setHovered(new Date(viewYear, viewMonth, day))}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: s || e ? 8 : r ? 0 : 8,
                  background: s || e ? "#4f6ef7" : r ? "#eef1fe" : "",
                  color: s || e ? "#fff" : "#1e2740",
                  fontSize: 12.5, cursor: "pointer", fontWeight: s || e ? 600 : 400,
                }}
              >{day}</div>
            );
          })}
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e4e7ef", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#6b7591" }}>
            {localStart ? fmtDate(localStart) : "Start"}{localEnd ? ` → ${fmtDate(localEnd)}` : selecting ? " → pick end" : ""}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "6px 14px", border: "1px solid #e4e7ef", borderRadius: 7, background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button
              onClick={() => { if (localStart && localEnd) onApply(localStart, localEnd); }}
              disabled={!localStart || !localEnd}
              style={{ padding: "6px 14px", border: "none", borderRadius: 7, background: localStart && localEnd ? "#4f6ef7" : "#c5ccf5", color: "#fff", fontSize: 12, cursor: localStart && localEnd ? "pointer" : "default", fontFamily: "inherit" }}
            >Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── status styles ─────────────────────────── */
const txTypeStyle = {
  Receipt:       { bg: "#e6faf3", color: "#16a369" },
  Transfer:      { bg: "#eef2ff", color: "#4f6ef7" },
  Adjustment:    { bg: "#fff7ed", color: "#c27a0a" },
  "Stock Count": { bg: "#f5f3ff", color: "#7c3aed" },
};
const statusStyle = {
  Completed: { bg: "#e6faf3", color: "#16a369" },
  Pending:   { bg: "#fff7ed", color: "#c27a0a" },
  Cancelled: { bg: "#fff1f0", color: "#c0392b" },
};

/* ─────────────────────────── modal wrapper ─────────────────────────── */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
};

/* ─────────────────────────── transaction type cards ─────────────────────────── */
const txTypes = [
  { id: "Receipt",     iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", iconBg: "#e6faf3", iconColor: "#16a369", desc: "Record items received into inventory." },
  { id: "Transfer",    iconPath: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",                                                                      iconBg: "#eef2ff", iconColor: "#4f6ef7", desc: "Move items between different locations." },
  { id: "Adjustment",  iconPath: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",  iconBg: "#fff7ed", iconColor: "#c27a0a", desc: "Adjust inventory quantities." },
  { id: "Stock Count", iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16",                                                                                          iconBg: "#f5f3ff", iconColor: "#7c3aed", desc: "Record physical stock count." },
];

const TypeCard = ({ t, selected, onClick }) => (
  <div onClick={() => onClick(t.id)} style={{
    border: selected ? "2px solid #4f6ef7" : "1px solid #e4e7ef",
    borderRadius: 10, padding: 12, cursor: "pointer", flex: 1, minWidth: 120,
    background: selected ? "#f0f4ff" : "#fff", transition: "border-color .15s",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={t.iconPath} size={16} stroke={t.iconColor} />
      </div>
      <div style={{ width: 18, height: 18, borderRadius: "50%", border: selected ? "2px solid #4f6ef7" : "2px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f6ef7" }} />}
      </div>
    </div>
    <div style={{ fontWeight: 600, fontSize: 12.5, color: "#1e2740" }}>{t.id}</div>
    <div style={{ fontSize: 11, color: "#6b7591", marginTop: 2 }}>{t.desc}</div>
  </div>
);

/* ─────────────────────────── item row ─────────────────────────── */
const emptyItem = () => ({ id: Date.now() + Math.random(), item: "", sku: "", unit: "", qty: 0, unitCost: 0 });

const ItemRow = ({ row, idx, onChange, onRemove, showCost, showAvailable, showCurrentStock }) => {
  const total = (row.qty * row.unitCost).toFixed(2);
  const td = { padding: "6px 8px", borderBottom: "1px solid #f4f6fb" };
  return (
    <tr>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{idx + 1}</td>
      <td style={td}>
        <input value={row.item} onChange={e => onChange(row.id, "item", e.target.value)} placeholder="Search item…"
          style={{ width: "100%", padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
      </td>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.sku || "—"}</td>
      {showAvailable    && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>—</td>}
      {showCurrentStock && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>0</td>}
      <td style={td}>
        <select value={row.unit} onChange={e => onChange(row.id, "unit", e.target.value)}
          style={{ padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }}>
          <option value="">Unit</option>
          {["pcs","kg","box","carton","set"].map(u => <option key={u}>{u}</option>)}
        </select>
      </td>
      <td style={td}>
        <input type="number" value={row.qty} onChange={e => onChange(row.id, "qty", +e.target.value)}
          style={{ width: 56, padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, textAlign: "center", fontFamily: "inherit" }} />
      </td>
      {showCost && <td style={td}>
        <input type="number" value={row.unitCost} onChange={e => onChange(row.id, "unitCost", +e.target.value)}
          style={{ width: 90, padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }} />
      </td>}
      {showCost && <td style={{ ...td, fontSize: 12, fontWeight: 500, color: "#1e2740" }}>{Number(total).toLocaleString()}</td>}
      <td style={td}>
        <div onClick={() => onRemove(row.id)} style={{ width: 26, height: 26, borderRadius: 6, background: "#fff1f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon d={icons.trash} size={12} stroke="#c0392b" />
        </div>
      </td>
    </tr>
  );
};

/* ─────────────────────────── field helpers ─────────────────────────── */
const locs      = ["Receiving Area","Storage Area","Storage Area A1-01","Dispatch Area","Damaged Goods Area"];
const users     = ["Inventory Officer","Warehouse Manager","System Administrator"];
const reasons   = ["Damaged items","Lost during handling","Stock count variance","Supplier sent extra items","New stock found","Customer return"];
const suppliersList = ["TechMart Ltd","Office Supplies Co","Digital Hub"];

const FieldLabel = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
    {children}{required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
);
const FieldSelect = ({ value, onChange, options, placeholder }) => (
  <div style={{ position: "relative" }}>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ appearance: "none", width: "100%", padding: "7px 28px 7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
  </div>
);
const FieldInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
);
const FieldTextarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", resize: "none", boxSizing: "border-box" }} />
);

/* ─────────────────────────── new transaction modal ─────────────────────────── */
const NewTransactionModal = ({ open, onClose, onSave }) => {
  const [type, setType]           = useState("Receipt");
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier]   = useState("");
  const [receivingLoc, setReceivingLoc] = useState("");
  const [fromLoc, setFromLoc]     = useState("");
  const [toLoc, setToLoc]         = useState("");
  const [location, setLocation]   = useState("");
  const [adjustType, setAdjustType] = useState("");
  const [reason, setReason]       = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [refNum, setRefNum]       = useState("");
  const [notes, setNotes]         = useState("");
  const [items, setItems]         = useState([emptyItem()]);

  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const totalQty  = items.reduce((s, r) => s + +r.qty, 0);
  const totalCost = items.reduce((s, r) => s + r.qty * r.unitCost, 0);

  const handleSave = () => { onSave({ type, date, items }); onClose(); };

  const gridStyle    = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 };
  const stepNumStyle = { width: 22, height: 22, borderRadius: "50%", background: "#4f6ef7", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 24, fontFamily: "Inter,system-ui,sans-serif", fontSize: 13 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>New Inventory Transaction</div>
            <div style={{ fontSize: 12, color: "#6b7591", marginTop: 3 }}>Select the type of transaction and fill in the details below.</div>
          </div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon d={icons.x} size={14} stroke="#6b7591" />
          </div>
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>1</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>Transaction Type</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {txTypes.map(t => <TypeCard key={t.id} t={t} selected={type === t.id} onClick={setType} />)}
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>2</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>{type} Information</div>
          </div>
          {type === "Receipt" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Supplier</FieldLabel><FieldSelect value={supplier} onChange={setSupplier} options={suppliersList} placeholder="Select supplier" /></div>
              <div><FieldLabel required>Receiving Location</FieldLabel><FieldSelect value={receivingLoc} onChange={setReceivingLoc} options={locs} placeholder="Select location" /></div>
              <div><FieldLabel required>Receipt Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="PO or reference (optional)" /></div>
              <div style={{ gridColumn: "span 2" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Transfer" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Transfer Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel required>From Location</FieldLabel><FieldSelect value={fromLoc} onChange={setFromLoc} options={locs} placeholder="Select source" /></div>
              <div><FieldLabel required>To Location</FieldLabel><FieldSelect value={toLoc} onChange={setToLoc} options={locs} placeholder="Select destination" /></div>
              <div><FieldLabel required>Requested By</FieldLabel><FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder="Select user" /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. TRF-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Adjustment" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Adjustment Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel required>Location</FieldLabel><FieldSelect value={location} onChange={setLocation} options={locs} placeholder="Select location" /></div>
              <div><FieldLabel required>Adjustment Type</FieldLabel><FieldSelect value={adjustType} onChange={setAdjustType} options={["Increase Stock","Decrease Stock","Set Stock"]} placeholder="Select type" /></div>
              <div><FieldLabel required>Reason</FieldLabel><FieldSelect value={reason} onChange={setReason} options={reasons} placeholder="Select reason" /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. ADJ-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Stock Count" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Count Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel required>Location</FieldLabel><FieldSelect value={location} onChange={setLocation} options={locs} placeholder="Select location" /></div>
              <div><FieldLabel required>Counted By</FieldLabel><FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder="Select user" /></div>
              <div style={{ gridColumn: "1 / -1" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>3</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>Items</div>
          </div>
          <div style={{ border: "1px solid #e4e7ef", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead style={{ background: "#f8f9fb", borderBottom: "1px solid #e4e7ef" }}>
                  <tr>
                    {["#","Item *","SKU",
                      ...(type==="Transfer"   ? ["Available"]    : []),
                      ...(type==="Adjustment" ? ["Current Stock"] : []),
                      "Unit","Qty *",
                      ...(type==="Receipt"||type==="Adjustment" ? ["Unit Cost (₦)","Total (₦)"] : []),
                      ""
                    ].map(h => (
                      <th key={h} style={{ padding: "8px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "#6b7591", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <ItemRow key={row.id} row={row} idx={idx} onChange={updateItem} onRemove={removeItem}
                      showCost={type==="Receipt"||type==="Adjustment"}
                      showAvailable={type==="Transfer"}
                      showCurrentStock={type==="Adjustment"}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "8px 12px", background: "#f8f9fb", borderTop: "1px solid #f0f2f8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4f6ef7", fontWeight: 500, cursor: "pointer" }}>
                <Icon d={icons.plus} size={13} stroke="#4f6ef7" /> Add Item
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#6b7591", flexWrap: "wrap" }}>
                <span>Items: <strong style={{ color: "#1e2740" }}>{items.length}</strong></span>
                <span>Qty: <strong style={{ color: "#1e2740" }}>{totalQty}</strong></span>
                {(type==="Receipt"||type==="Adjustment") && <span>Total: <strong style={{ color: "#1e2740" }}>₦{totalCost.toLocaleString()}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e4e7ef" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e4e7ef", borderRadius: 8, fontSize: 12.5, background: "#fff", cursor: "pointer", color: "#1e2740", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 20px", border: "none", borderRadius: 8, fontSize: 12.5, background: "#4f6ef7", color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Save {type}</button>
        </div>
      </div>
    </Modal>
  );
};

/* ─────────────────────────── mock data ─────────────────────────── */
const MOCK = [
  { id: "TXN-000156", date: "May 27, 2025", time: "10:15 AM", type: "Receipt",     item: "HP LaserJet Pro MFP M428", sku: "PRN-001", from: "—",             to: "Receiving Area",     qty: 10, unitCost: 250000, total: 2500000,  user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000155", date: "May 27, 2025", time: "09:32 AM", type: "Transfer",    item: "Dell Latitude 5440",       sku: "LAP-001", from: "Receiving Area", to: "Storage Area",       qty: 20, unitCost: 850000, total: 17000000, user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000154", date: "May 26, 2025", time: "04:45 PM", type: "Adjustment",  item: "USB-C Hub 7-in-1",         sku: "ACC-003", from: "Storage Area",   to: "Damaged Goods Area", qty: -5, unitCost: 25000,  total: -125000,  user: "Warehouse Manager", status: "Completed" },
  { id: "TXN-000153", date: "May 26, 2025", time: "02:10 PM", type: "Transfer",    item: "Ergonomic Office Chair",   sku: "CHR-002", from: "Storage Area",   to: "Dispatch Area",      qty: 3,  unitCost: 75000,  total: 225000,   user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000152", date: "May 26, 2025", time: "11:05 AM", type: "Stock Count", item: "Wireless Mouse",           sku: "ACC-005", from: "Storage Area",   to: "Storage Area",       qty: 15, unitCost: 12000,  total: 180000,   user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000151", date: "May 25, 2025", time: "03:22 PM", type: "Receipt",     item: '24" LED Monitor',          sku: "MON-001", from: "—",             to: "Receiving Area",     qty: 8,  unitCost: 95000,  total: 760000,   user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000150", date: "May 25, 2025", time: "10:18 AM", type: "Adjustment",  item: "HP 58A Toner Cartridge",   sku: "CON-001", from: "Storage Area",   to: "Storage Area",       qty: 2,  unitCost: 45000,  total: 90000,    user: "Inventory Officer", status: "Pending"   },
  { id: "TXN-000149", date: "May 24, 2025", time: "04:05 PM", type: "Transfer",    item: "Cat6 Ethernet Cable 2M",   sku: "CAB-002", from: "Storage Area",   to: "Receiving Area",     qty: 30, unitCost: 3500,   total: 105000,   user: "Inventory Officer", status: "Completed" },
  { id: "TXN-000148", date: "May 24, 2025", time: "01:15 PM", type: "Receipt",     item: "Office Desk",              sku: "DSK-001", from: "—",             to: "Dispatch Area",      qty: 5,  unitCost: 120000, total: 600000,   user: "Warehouse Manager", status: "Completed" },
  { id: "TXN-000147", date: "May 24, 2025", time: "09:40 AM", type: "Stock Count", item: "Mechanical Keyboard",      sku: "ACC-006", from: "Storage Area",   to: "Storage Area",       qty: 12, unitCost: 18000,  total: 216000,   user: "Inventory Officer", status: "Completed" },
];

/* ─────────────────────────── main page ─────────────────────────── */
export default function TransactionsPage() {
  const [modalOpen, setModalOpen]         = useState(false);
  const [transactions, setTransactions]   = useState(MOCK);
  const [filterType, setFilterType]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [openMenuId, setOpenMenuId]       = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange]         = useState(null);
  const dateBtnRef = useRef(null);
  const PER_PAGE = 10;

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* date-aware filtering */
  const filtered = transactions.filter(t => {
    if (filterType   && t.type   !== filterType)   return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.item.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
    }
    if (dateRange) {
      const parts = t.date.match(/([A-Za-z]+)\s+(\d+),\s+(\d+)/);
      if (parts) {
        const mIdx = SHORT_MONTHS.indexOf(parts[1].slice(0,3));
        const d = new Date(+parts[3], mIdx !== -1 ? mIdx : 0, +parts[2]);
        if (d < dateRange.start || d > dateRange.end) return false;
      }
    }
    return true;
  });

  const pages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data) => {
    const newTx = {
      id: `TXN-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: data.type,
      item: data.items[0]?.item || "New Item",
      sku: "NEW-001",
      from: "—", to: "Receiving Area",
      qty: data.items.reduce((s, r) => s + +r.qty, 0),
      unitCost: 0, total: 0,
      user: "System Administrator",
      status: "Pending",
    };
    setTransactions(p => [newTx, ...p]);
  };

  const dateLabel = dateRange
    ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All dates";

  const totalTxns     = transactions.length;
  const totalReceipts = transactions.filter(t => t.type === "Receipt").length;
  const totalTransfers= transactions.filter(t => t.type === "Transfer").length;
  const totalAdj      = transactions.filter(t => t.type === "Adjustment").length;
  const totalStock    = transactions.filter(t => t.type === "Stock Count").length;
  const pendingCount  = transactions.filter(t => t.status === "Pending").length;

  return (
    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>

      <NewTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>View and track all inventory transactions across your organization.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: "pointer", color: "#1e2740", fontWeight: 500 }}>
            <DownloadIcon /> Export
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#4f6ef7", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            <PlusIcon /> New Transaction
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        <MetricCard iconBg="#eef2ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Total Transactions" value={totalTxns} sub="All time" />
        <MetricCard iconBg="#e6faf3"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
          label="Receipts" value={totalReceipts} sub="All time" />
        <MetricCard iconBg="#eef2ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>}
          label="Transfers" value={totalTransfers} sub="All time" />
        <MetricCard iconBg="#fff7ed"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          label="Adjustments" value={totalAdj} sub="All time" />
        <MetricCard iconBg="#f5f3ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          label="Pending" value={pendingCount}
          sub="View pending" subAccent onClick={() => { setFilterStatus("Pending"); setPage(1); }} />
      </div>

      {/* Filters bar */}
      <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: "14px 16px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 280 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><SearchSm /></span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by item or transaction ID…"
            style={{ width: "100%", padding: "7px 10px 7px 30px", background: "#f4f6fb", border: "1px solid #e4e7ef", borderRadius: 7, color: "#1e2740", fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Date Range Picker */}
        <div style={{ position: "relative" }} ref={dateBtnRef}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Date Range</span>
            <div
              onClick={e => { e.stopPropagation(); setIsDatePickerOpen(o => !o); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <CalIcon /> {dateLabel} <ChevDown />
            </div>
          </div>
          {isDatePickerOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 400 }} onClick={() => setIsDatePickerOpen(false)} />
              <DateRangePicker
                isOpen={isDatePickerOpen}
                initialStart={dateRange?.start}
                initialEnd={dateRange?.end}
                onClose={() => setIsDatePickerOpen(false)}
                onApply={(start, end) => { setDateRange({ start, end }); setIsDatePickerOpen(false); setPage(1); }}
              />
            </>
          )}
        </div>

        {/* Type */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Type</span>
          <div style={{ position: "relative" }}>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
              style={{ appearance: "none", padding: "7px 28px 7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", minWidth: 120, color: "#1e2740", fontFamily: "inherit" }}>
              <option value="">All Types</option>
              {["Receipt","Transfer","Adjustment","Stock Count"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Status</span>
          <div style={{ position: "relative" }}>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              style={{ appearance: "none", padding: "7px 28px 7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", minWidth: 120, color: "#1e2740", fontFamily: "inherit" }}>
              <option value="">All Statuses</option>
              {["Completed","Pending","Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
          </div>
        </div>

        {/* Clear */}
        <div
          onClick={() => { setSearch(""); setFilterType(""); setFilterStatus(""); setDateRange(null); setPage(1); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", marginLeft: "auto", whiteSpace: "nowrap" }}
        >
          <FilterIcon /> Clear Filters
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e4e7ef", background: "#f8f9fb" }}>
                {["ID","Date & Time","Type","Item","From","To","Qty","Unit Cost (₦)","Total (₦)","User","Status","Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap", fontSize: 12 }}>
                    {!["Type","Actions","Status"].includes(h) ? <>{h} <SortIcon /></> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>No transactions match your filters.</td></tr>
              ) : visible.map(t => {
                const ts = txTypeStyle[t.type] || {};
                const ss = statusStyle[t.status] || {};
                return (
                  <tr key={t.id}
                    style={{ borderBottom: "1px solid #f4f6fb", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 500, color: "#4f6ef7", whiteSpace: "nowrap", cursor: "pointer" }}>{t.id}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#1e2740" }}>{t.date}</div>
                      <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{t.time}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: ts.bg, color: ts.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap" }}>{t.type}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ color: "#1e2740", whiteSpace: "nowrap" }}>{t.item}</div>
                      <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{t.sku}</div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.from}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.to}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 500, color: t.qty < 0 ? "#c0392b" : "#1e2740" }}>{t.qty}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.unitCost.toLocaleString()}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: t.total < 0 ? "#c0392b" : "#1e2740", whiteSpace: "nowrap" }}>{t.total.toLocaleString()}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.user}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500 }}>{t.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", position: "relative" }}>
                      <div
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6, margin: "0 auto", transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <DotsIcon />
                      </div>
                      {openMenuId === t.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 8, top: 32, zIndex: 50, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, boxShadow: "0 8px 24px rgba(20,25,50,0.14)", minWidth: 150, padding: 4, textAlign: "left" }}>
                          <div onClick={() => setOpenMenuId(null)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#1e2740", fontWeight: 500 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <EyeIcon /> View Details
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e4e7ef", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#6b7591" }}>
            Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1} to {Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} transactions
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <PagBtn disabled={page===1}     onClick={() => setPage(p => Math.max(1,p-1))}><ChevLeft /></PagBtn>
            {Array.from({ length: Math.min(pages,5) }, (_,i) => i+1).map(n => (
              <PagBtn key={n} active={page===n} onClick={() => setPage(n)}>{n}</PagBtn>
            ))}
            {pages > 5 && <span style={{ color: "#9aa1b4", fontSize: 12 }}>…</span>}
            <PagBtn disabled={page===pages} onClick={() => setPage(p => Math.min(pages,p+1))}><ChevRight /></PagBtn>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, cursor: "pointer", marginLeft: 8 }}>
              10 / page <ChevDown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}