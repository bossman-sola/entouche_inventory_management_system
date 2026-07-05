import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = "https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1";

async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok || (json && json.success === false)) {
    const msg = json?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = json?.errors;
    throw err;
  }
  return json;
}

// Follows Laravel-style { data, meta: { current_page, last_page } } pagination
// and collects every page into one flat array.
async function fetchAllPages(path, token, { maxPages = 10 } = {}) {
  let page = 1;
  let out = [];
  while (page <= maxPages) {
    const sep = path.includes("?") ? "&" : "?";
    const json = await apiRequest(`${path}${sep}page=${page}`, { token });
    const chunk = Array.isArray(json.data) ? json.data : [];
    out = out.concat(chunk);
    const meta = json.meta;
    if (!meta || meta.current_page >= meta.last_page) break;
    page += 1;
  }
  return out;
}

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
  refresh: "M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16",
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
  Approved:  { bg: "#e6faf3", color: "#16a369" },
  Pending:   { bg: "#fff7ed", color: "#c27a0a" },
  Cancelled: { bg: "#fff1f0", color: "#c0392b" },
  Rejected:  { bg: "#fff1f0", color: "#c0392b" },
  "—":       { bg: "#f4f6fb", color: "#6b7591" },
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
  { id: "Receipt",     apiType: "receipt",     iconPath: icons.receipt,    iconBg: "#e6faf3", iconColor: "#16a369", desc: "Record items received into inventory." },
  { id: "Transfer",    apiType: "transfer",    iconPath: icons.transfer,   iconBg: "#eef2ff", iconColor: "#4f6ef7", desc: "Move items between different locations." },
  { id: "Adjustment",  apiType: "adjustment",  iconPath: icons.adjustment, iconBg: "#fff7ed", iconColor: "#c27a0a", desc: "Adjust inventory quantities." },
  { id: "Stock Count", apiType: "stock_count", iconPath: icons.stockcount, iconBg: "#f5f3ff", iconColor: "#7c3aed", desc: "Record physical stock count." },
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
const emptyItem = () => ({ id: Date.now() + Math.random(), itemId: "", item: "", sku: "", unit: "", qty: 0, unitCost: 0 });

const ItemRow = ({ row, idx, onChange, onRemove, showCost, showAvailable, showCurrentStock, catalogItems, units }) => {
  const total = (row.qty * row.unitCost).toFixed(2);
  const td = { padding: "6px 8px", borderBottom: "1px solid #f4f6fb" };

  const handlePickItem = (itemId) => {
    const found = catalogItems.find(ci => String(ci.id) === String(itemId));
    if (!found) { onChange(row.id, "itemId", ""); return; }
    onChange(row.id, "itemId", found.id);
    onChange(row.id, "item", found.name);
    onChange(row.id, "sku", found.sku || "");
    onChange(row.id, "unit", found.unit?.abbreviation || found.unit?.name || "");
    onChange(row.id, "unitCost", Number(found.unit_cost) || 0);
    onChange(row.id, "stockOnHand", found.stockOnHand ?? null);
  };

  return (
    <tr>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{idx + 1}</td>
      <td style={td}>
        <select value={row.itemId} onChange={e => handlePickItem(e.target.value)}
          style={{ width: "100%", padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit", background: "#fff" }}>
          <option value="">Select item…</option>
          {catalogItems.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
        </select>
      </td>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.sku || "—"}</td>
      {showAvailable    && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.stockOnHand ?? "—"}</td>}
      {showCurrentStock && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.stockOnHand ?? "—"}</td>}
      <td style={td}>
        <select value={row.unit} onChange={e => onChange(row.id, "unit", e.target.value)}
          style={{ padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }}>
          <option value="">Unit</option>
          {units.map(u => <option key={u.id} value={u.abbreviation || u.name}>{u.abbreviation || u.name}</option>)}
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
const FieldLabel = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
    {children}{required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
);
const FieldSelect = ({ value, onChange, options, placeholder, getLabel = o => o, getValue = o => o }) => (
  <div style={{ position: "relative" }}>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ appearance: "none", width: "100%", padding: "7px 28px 7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={getValue(o)} value={getValue(o)}>{getLabel(o)}</option>)}
    </select>
    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
  </div>
);
const FieldInput = ({ value, onChange, placeholder, type = "text", listId, listOptions }) => (
  <>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} list={listId}
      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
    {listId && listOptions && (
      <datalist id={listId}>
        {listOptions.map(o => <option key={o} value={o} />)}
      </datalist>
    )}
  </>
);
const FieldTextarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", resize: "none", boxSizing: "border-box" }} />
);

/* ─────────────────────────── new transaction modal ─────────────────────────── */
const NewTransactionModal = ({ open, onClose, onSave, catalogItems, units, suppliers, users, knownLocations, saving, saveError }) => {
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

  const handleSave = () => {
    onSave({
      type,
      date,
      supplier, receivingLoc, fromLoc, toLoc, location, adjustType, reason, requestedBy, refNum, notes,
      items,
    });
  };

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
              <div>
                <FieldLabel required>Supplier</FieldLabel>
                <FieldSelect value={supplier} onChange={setSupplier} options={suppliers} placeholder={suppliers.length ? "Select supplier" : "No suppliers found"} getLabel={s => s.name} getValue={s => s.id} />
              </div>
              <div>
                <FieldLabel required>Receiving Location</FieldLabel>
                <FieldInput value={receivingLoc} onChange={setReceivingLoc} placeholder="Type a location" listId="loc-list-receiving" listOptions={knownLocations} />
              </div>
              <div><FieldLabel required>Receipt Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="PO or reference (optional)" /></div>
              <div style={{ gridColumn: "span 2" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Transfer" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Transfer Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>From Location</FieldLabel>
                <FieldInput value={fromLoc} onChange={setFromLoc} placeholder="Type source location" listId="loc-list-from" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>To Location</FieldLabel>
                <FieldInput value={toLoc} onChange={setToLoc} placeholder="Type destination location" listId="loc-list-to" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>Requested By</FieldLabel>
                <FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder={users.length ? "Select user" : "No users found"} getLabel={u => u.name} getValue={u => u.id} />
              </div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. TRF-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Adjustment" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Adjustment Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <FieldInput value={location} onChange={setLocation} placeholder="Type a location" listId="loc-list-adj" listOptions={knownLocations} />
              </div>
              <div><FieldLabel required>Adjustment Type</FieldLabel><FieldSelect value={adjustType} onChange={setAdjustType} options={["Increase Stock","Decrease Stock","Set Stock"]} placeholder="Select type" /></div>
              <div><FieldLabel required>Reason</FieldLabel><FieldInput value={reason} onChange={setReason} placeholder="e.g. Damaged items, stock count variance…" /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. ADJ-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Stock Count" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Count Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <FieldInput value={location} onChange={setLocation} placeholder="Type a location" listId="loc-list-count" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>Counted By</FieldLabel>
                <FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder={users.length ? "Select user" : "No users found"} getLabel={u => u.name} getValue={u => u.id} />
              </div>
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
                      catalogItems={catalogItems}
                      units={units}
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

        {saveError && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 8, fontSize: 12, color: "#c0392b" }}>
            {saveError}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e4e7ef" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e4e7ef", borderRadius: 8, fontSize: 12.5, background: "#fff", cursor: "pointer", color: "#1e2740", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", border: "none", borderRadius: 8, fontSize: 12.5, background: saving ? "#9aa8f7" : "#4f6ef7", color: "#fff", cursor: saving ? "default" : "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            {saving ? "Saving…" : `Save ${type}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ─────────────────────────── normalization helpers ─────────────────────────── */
const TYPE_LABELS = {
  receipt: "Receipt",
  transfer: "Transfer",
  adjustment: "Adjustment",
  stock_count: "Stock Count",
  stock_taking: "Stock Count",
  stocktake: "Stock Count",
};

function labelizeType(raw, fallback) {
  if (!raw) return fallback || "Transaction";
  const key = String(raw).toLowerCase().trim().replace(/\s+/g, "_");
  if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  return String(raw).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== "") return v;
  return undefined;
}

function normalizeTransaction(raw, itemMeta, assumedType) {
  const type = labelizeType(
    firstDefined(raw.type, raw.transaction_type, raw.txn_type, raw.movement_type),
    assumedType
  );

  const qty = Number(firstDefined(raw.quantity, raw.qty, raw.quantity_change, 0)) || 0;
  const unitCost = Number(firstDefined(raw.unit_cost, raw.cost, itemMeta?.unit_cost, 0)) || 0;
  const total = Number(firstDefined(raw.total_cost, raw.total, qty * unitCost)) || 0;

  const createdAtRaw = firstDefined(raw.created_at, raw.date, raw.performed_at, raw.transaction_date);
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

  const from = firstDefined(
    raw.from_location?.name, raw.source_location?.name, raw.from,
    "—"
  );
  const to = firstDefined(
    raw.to_location?.name, raw.destination_location?.name, raw.location?.name, raw.to,
    "—"
  );

  const userName = firstDefined(
    raw.user?.name, raw.created_by_user?.name, raw.performed_by?.name, raw.creator?.name, raw.requested_by?.name,
    "—"
  );

  const status = labelizeType(firstDefined(raw.status), "—");

  return {
    id: firstDefined(raw.id, raw.reference_number, `${itemMeta?.id || "x"}-${Math.random().toString(36).slice(2, 8)}`),
    refLabel: firstDefined(raw.reference_number, raw.id ? `#${raw.id}` : null, "—"),
    date: createdAt,
    type,
    item: firstDefined(raw.item?.name, itemMeta?.name, "—"),
    sku: firstDefined(raw.item?.sku, itemMeta?.sku, "—"),
    from,
    to,
    qty,
    unitCost,
    total,
    user: userName,
    status,
  };
}

function fmtDateTime(d) {
  if (!d || isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

// Auto-auth: every endpoint requires a Bearer token, but there's no reason to make
// the person sign in manually for this environment, so we authenticate silently
// in the background using the staging demo account from the API doc.
const AUTO_LOGIN_EMAIL = "admin@inventory.local";
const AUTO_LOGIN_PASSWORD = "Admin@1234";

/* ─────────────────────────── main page ─────────────────────────── */
export default function TransactionsPage() {
  const [token, setToken]                 = useState(null);
  const [authError, setAuthError]         = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  const [modalOpen, setModalOpen]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");

  const [transactions, setTransactions]   = useState([]);
  const [catalogItems, setCatalogItems]   = useState([]);
  const [suppliers, setSuppliers]         = useState([]);
  const [units, setUnits]                 = useState([]);
  const [users, setUsers]                 = useState([]);

  const [dataLoading, setDataLoading]     = useState(false);
  const [dataError, setDataError]         = useState("");
  const [partialWarning, setPartialWarning] = useState("");

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

  // Silent background auth — no sign-in screen, just get a token and go.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await apiRequest("/auth/login", {
          method: "POST",
          body: { email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD },
        });
        if (cancelled) return;
        setToken(json.data.access_token);
        setCurrentUserName(json.data.user?.name || AUTO_LOGIN_EMAIL);
      } catch (e) {
        if (cancelled) return;
        setAuthError(e.message || "Could not connect to the API. Check your network access to the staging server.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError("");
    setPartialWarning("");
    try {
      const [itemsRaw, suppliersRaw, unitsRaw, usersRaw] = await Promise.all([
        fetchAllPages("/items", token),
        fetchAllPages("/suppliers", token),
        fetchAllPages("/units", token),
        fetchAllPages("/users", token),
      ]);

      setCatalogItems(itemsRaw);
      setSuppliers(suppliersRaw);
      setUnits(unitsRaw);
      setUsers(usersRaw);

      // No global "list all transactions" endpoint exists in the API — aggregate
      // from each item's transaction history instead.
      const ITEM_CAP = 40;
      const itemsToFetch = itemsRaw.slice(0, ITEM_CAP);
      let warned = itemsRaw.length > ITEM_CAP;

      const results = await Promise.all(itemsToFetch.map(async (it) => {
        try {
          const json = await apiRequest(`/items/${it.id}/transactions`, { token });
          const list = Array.isArray(json.data?.data) ? json.data.data
                     : Array.isArray(json.data) ? json.data
                     : [];
          return list.map(raw => normalizeTransaction(raw, it));
        } catch (e) {
          warned = true;
          return [];
        }
      }));

      const flat = results.flat().sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      setTransactions(flat);
      if (warned) {
        setPartialWarning(itemsRaw.length > ITEM_CAP
          ? `Showing transaction history for the first ${ITEM_CAP} of ${itemsRaw.length} items.`
          : "Some items' transaction history could not be loaded.");
      }
    } catch (e) {
      setDataError(e.message || "Could not reach the API. Check your connection or CORS access to the staging server.");
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const knownLocations = Array.from(new Set(
    transactions.flatMap(t => [t.from, t.to]).filter(l => l && l !== "—")
  )).sort();

  /* date-aware filtering */
  const filtered = transactions.filter(t => {
    if (filterType   && t.type   !== filterType)   return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${t.item} ${t.id} ${t.sku}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateRange && t.date) {
      if (t.date < dateRange.start || t.date > dateRange.end) return false;
    }
    return true;
  });

  const pages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = async (form) => {
    setSaving(true);
    setSaveError("");

    const typeConfig = txTypes.find(t => t.id === form.type);
    const endpointMap = {
      receipt: "/receipts",
      transfer: "/transfers",
      adjustment: "/adjustments",
      stock_count: "/stock-counts",
    };
    const endpoint = endpointMap[typeConfig.apiType];

    const payloadItems = form.items
      .filter(r => r.itemId && r.qty)
      .map(r => ({
        item_id: r.itemId,
        quantity: r.qty,
        unit_cost: r.unitCost || undefined,
      }));

    const body = {
      date: form.date,
      reference_number: form.refNum || undefined,
      notes: form.notes || undefined,
      supplier_id: form.supplier || undefined,
      location: form.receivingLoc || form.location || undefined,
      from_location: form.fromLoc || undefined,
      to_location: form.toLoc || undefined,
      requested_by: form.requestedBy || undefined,
      reason: form.reason || undefined,
      adjustment_type: form.adjustType || undefined,
      items: payloadItems,
    };

    try {
      await apiRequest(endpoint, { method: "POST", token, body });
      setModalOpen(false);
      await loadData();
    } catch (e) {
      // The tested API reference doesn't document a create endpoint for this
      // transaction type, so the write may not be supported server-side yet.
      setSaveError(
        e.status === 404
          ? `The API has no ${endpoint} endpoint yet — this transaction type can't be saved until that's added server-side.`
          : (e.message || "Could not save this transaction.")
      );
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = dateRange
    ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All dates";

  const totalTxns     = transactions.length;
  const totalReceipts = transactions.filter(t => t.type === "Receipt").length;
  const totalTransfers= transactions.filter(t => t.type === "Transfer").length;
  const totalAdj      = transactions.filter(t => t.type === "Adjustment").length;
  const pendingCount  = transactions.filter(t => t.status === "Pending").length;

  if (!token) {
    return (
      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>View and track all inventory transactions across your organization.</p>
        </div>
        {authError ? (
          <div style={{ padding: "12px 14px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 10, fontSize: 12.5, color: "#c0392b" }}>
            {authError}
          </div>
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10 }}>
            Connecting to the inventory system…
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>

      <NewTransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSaveError(""); }}
        onSave={handleSave}
        catalogItems={catalogItems}
        units={units}
        suppliers={suppliers}
        users={users}
        knownLocations={knownLocations}
        saving={saving}
        saveError={saveError}
      />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>
            View and track all inventory transactions across your organization.
            {currentUserName && <span style={{ color: "#9aa1b4" }}> · Signed in as {currentUserName}</span>}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={loadData}
            disabled={dataLoading}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: dataLoading ? "default" : "pointer", color: "#1e2740", fontWeight: 500 }}
          >
            <Icon d={icons.refresh} size={13} stroke="#5c657a" /> {dataLoading ? "Refreshing…" : "Refresh"}
          </button>
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

      {dataError && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 10, fontSize: 12.5, color: "#c0392b" }}>
          {dataError}
        </div>
      )}
      {!dataError && partialWarning && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff7ed", border: "1px solid #fbdba0", borderRadius: 10, fontSize: 12, color: "#946200" }}>
          {partialWarning}
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        <MetricCard iconBg="#eef2ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          label="Total Transactions" value={dataLoading ? "…" : totalTxns} sub="All time" />
        <MetricCard iconBg="#e6faf3"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
          label="Receipts" value={dataLoading ? "…" : totalReceipts} sub="All time" />
        <MetricCard iconBg="#eef2ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>}
          label="Transfers" value={dataLoading ? "…" : totalTransfers} sub="All time" />
        <MetricCard iconBg="#fff7ed"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          label="Adjustments" value={dataLoading ? "…" : totalAdj} sub="All time" />
        <MetricCard iconBg="#f5f3ff"
          icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          label="Pending" value={dataLoading ? "…" : pendingCount}
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
              {["Completed","Approved","Pending","Cancelled","Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
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
              {dataLoading ? (
                <tr><td colSpan={12} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>Loading transactions…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>
                  {transactions.length === 0 ? "No transactions found for this organization yet." : "No transactions match your filters."}
                </td></tr>
              ) : visible.map(t => {
                const ts = txTypeStyle[t.type] || { bg: "#f4f6fb", color: "#5c657a" };
                const ss = statusStyle[t.status] || { bg: "#f4f6fb", color: "#5c657a" };
                const { date: dLabel, time: tLabel } = fmtDateTime(t.date);
                return (
                  <tr key={t.id}
                    style={{ borderBottom: "1px solid #f4f6fb", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 500, color: "#4f6ef7", whiteSpace: "nowrap", cursor: "pointer" }}>{t.refLabel}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ color: "#1e2740" }}>{dLabel}</div>
                      <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{tLabel}</div>
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