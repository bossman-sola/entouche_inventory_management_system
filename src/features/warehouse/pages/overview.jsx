import { useState, useRef, useEffect, useCallback } from "react";
import { locationsApi } from "../api/locationsApi.js";

const API_BASE_URL = "https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1";

const getAccessToken = () => localStorage.getItem("access_token");

async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.success === false)) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json;
}

// Items are paginated — walk every page so totals aren't just page 1.
async function fetchAllItems() {
  let page = 1;
  let all = [];
  while (page <= 50) { // hard stop so a bad API response can't loop forever
    const json = await apiFetch(`/items?per_page=100&page=${page}`);
    all = all.concat(json.data || []);
    const meta = json.meta;
    if (!meta || page >= meta.last_page) break;
    page += 1;
  }
  return all;
}

// NOTE: there is currently no bulk/aggregate stock endpoint, so this calls
// GET /items/{id}/stock-balance once per item. Fine for a small catalog;
// worth asking the backend for a bulk endpoint if the item count grows large.
async function fetchStockBalances(items) {
  const settled = await Promise.allSettled(
    items.map((item) => apiFetch(`/items/${item.id}/stock-balance`))
  );
  return settled.map((r, idx) => ({
    item: items[idx],
    balance: r.status === "fulfilled" ? r.value.data : null,
  }));
}

const currency = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);


const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  hexagon: "M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  pie: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  chevronDown: "M19 9l-7 7-7-7",
  chevronLeft: "M15 19l-7-7 7-7",
  chevronRight: "M9 5l7 7-7 7",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  xCircle: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  arrowUp: "M7 11l5-5m0 0l5 5m-5-5v12",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  storage: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  dispatch: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  receive: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  damaged: "M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97L13.75 4a2 2 0 00-3.5 0l-6.25 11A2 2 0 005.07 19z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
};

// These chart primitives are kept ready to go for whenever the
// Locations/movements endpoints exist — currently unused because there's
// no real location data to feed them yet.
const DonutChart = ({ segments, total }) => {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const innerR = 36;

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    return (
      <path
        key={seg.label}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
        fill={seg.color}
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="w-full max-w-[140px] h-auto">
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6b7280">Total</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#6b7280">Quantity</text>
    </svg>
  );
};

const UtilBar = ({ label, pct, color }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-1.5 gap-2">
      <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
      <span className="text-sm font-semibold text-gray-700 shrink-0">{pct}%</span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const s = {
    Active: "bg-green-100 text-green-700",
    Attention: "bg-yellow-100 text-yellow-700",
    Inactive: "bg-red-100 text-red-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
};

const LocationIcon = ({ type }) => {
  const configs = {
    "Storage Area": { icon: icons.storage, bg: "bg-blue-50", color: "text-blue-500" },
    "Dispatch Area": { icon: icons.dispatch, bg: "bg-orange-50", color: "text-orange-500" },
    "Receiving Area": { icon: icons.receive, bg: "bg-green-50", color: "text-green-500" },
    "Damaged Goods Area": { icon: icons.damaged, bg: "bg-yellow-50", color: "text-yellow-500" },
  };
  const c = configs[type] || { icon: icons.storage, bg: "bg-gray-50", color: "text-gray-500" };
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
      <Icon d={c.icon} size={15} className={c.color} />
    </div>
  );
};

const MiniUtilBar = ({ pct, color }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
    <span className="text-sm text-gray-700 whitespace-nowrap">{pct}%</span>
  </div>
);


// ---------------- Date helpers ----------------
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const isBetween = (d, a, b) => a && b && d > a && d < b;

const formatShort = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const formatFull = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatRangeLabel = (start, end) => {
  if (sameDay(start, end)) return formatFull(start);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (sameYear) {
    return `${formatShort(start)} – ${formatShort(end)}, ${end.getFullYear()}`;
  }
  return `${formatFull(start)} – ${formatFull(end)}`;
};

const buildPresets = () => {
  const today = new Date();
  return [
    { key: "today", label: "Today", start: startOfDay(today), end: endOfDay(today) },
    { key: "last7", label: "Last 7 days", start: startOfDay(addDays(today, -6)), end: endOfDay(today) },
    { key: "last30", label: "Last 30 days", start: startOfDay(addDays(today, -29)), end: endOfDay(today) },
    { key: "thisMonth", label: "This month", start: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)), end: endOfDay(today) },
    { key: "lastMonth", label: "Last month", start: startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1)), end: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)) },
  ];
};

const buildMonthGrid = (year, month) => {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const gridStart = addDays(firstOfMonth, -startWeekday);
  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];


// ---------------- Mini calendar month grid ----------------
const CalendarMonth = ({ year, month, rangeStart, rangeEnd, hoverDate, onHover, onPick, today }) => {
  const days = buildMonthGrid(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const effectiveEnd = rangeEnd || hoverDate;

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gray-700 text-center mb-2">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-[10px] font-medium text-gray-400 text-center h-6 flex items-center justify-center">{w}</div>
        ))}
        {days.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isStart = sameDay(d, rangeStart);
          const isEnd = sameDay(d, rangeEnd);
          const inRange = rangeStart && effectiveEnd && isBetween(startOfDay(d), startOfDay(rangeStart), startOfDay(effectiveEnd));
          const isToday = sameDay(d, today);
          const isFuture = startOfDay(d) > startOfDay(today);

          return (
            <button
              key={i}
              type="button"
              disabled={isFuture}
              onMouseEnter={() => onHover(d)}
              onClick={() => onPick(d)}
              className={[
                "h-7 text-xs rounded-md flex items-center justify-center transition-colors",
                !inMonth ? "text-gray-300" : "text-gray-700",
                isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50 cursor-pointer",
                inRange && !isStart && !isEnd ? "bg-blue-50" : "",
                isStart || isEnd ? "bg-blue-600 text-white font-semibold hover:bg-blue-600" : "",
                isToday && !isStart && !isEnd ? "ring-1 ring-inset ring-blue-300" : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};


// ---------------- DateRangePicker (fully functional) ----------------
const DateRangePicker = ({ onChange }) => {
  const today = new Date();
  const presets = buildPresets();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "custom"
  const [activeKey, setActiveKey] = useState("last7");
  const [range, setRange] = useState(presets.find(p => p.key === "last7"));

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [pickStart, setPickStart] = useState(null);
  const [pickEnd, setPickEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setMode("list");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && (setOpen(false), setMode("list"));
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const applyPreset = (preset) => {
    setActiveKey(preset.key);
    setRange(preset);
    onChange && onChange({ start: preset.start, end: preset.end, label: preset.label });
    setOpen(false);
    setMode("list");
  };

  const openCustom = () => {
    setPickStart(range.start ? startOfDay(range.start) : null);
    setPickEnd(range.end ? startOfDay(range.end) : null);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setMode("custom");
  };

  const handlePick = (d) => {
    const day = startOfDay(d);
    if (!pickStart || (pickStart && pickEnd)) {
      setPickStart(day);
      setPickEnd(null);
    } else if (day < pickStart) {
      setPickEnd(pickStart);
      setPickStart(day);
    } else {
      setPickEnd(day);
    }
  };

  const applyCustom = () => {
    if (!pickStart) return;
    const start = startOfDay(pickStart);
    const end = endOfDay(pickEnd || pickStart);
    const label = formatRangeLabel(start, end);
    setActiveKey("custom");
    setRange({ key: "custom", label, start, end });
    onChange && onChange({ start, end, label });
    setOpen(false);
    setMode("list");
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
      >
        <Icon d={icons.calendar} size={14} className="text-gray-500 shrink-0" />
        <span className="truncate">{range.label}</span>
        <Icon d={icons.chevronDown} size={13} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {mode === "list" ? (
            <div className="w-52 py-1">
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className="w-full flex items-center justify-between text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{p.label}</span>
                  {activeKey === p.key && <Icon d={icons.check} size={14} className="text-blue-600" />}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={openCustom}
                  className="w-full flex items-center justify-between text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <span>Custom range</span>
                  {activeKey === "custom" && <Icon d={icons.check} size={14} className="text-blue-600" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-72 p-3">
              <div className="flex items-center justify-between mb-1">
                <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500">
                  <Icon d={icons.chevronLeft} size={14} />
                </button>
                <div className="text-xs text-gray-500">
                  {pickStart ? formatFull(pickStart) : "Start date"}
                  <span className="mx-1 text-gray-300">→</span>
                  {pickEnd ? formatFull(pickEnd) : "End date"}
                </div>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Icon d={icons.chevronRight} size={14} />
                </button>
              </div>

              <CalendarMonth
                year={viewYear}
                month={viewMonth}
                rangeStart={pickStart}
                rangeEnd={pickEnd}
                hoverDate={hoverDate}
                onHover={setHoverDate}
                onPick={handlePick}
                today={today}
              />

              <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={applyCustom}
                  disabled={!pickStart}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Reusable stat tile with real loading/error handling.
// `unavailable` is a distinct third state from `error` — it means the
// backing endpoint simply doesn't exist yet (expected, e.g. /locations
// 404ing), not that a live request failed. It renders muted, not red.
const StatCard = ({
  iconD,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor = "text-gray-400",
  loading,
  error,
  unavailable,
  unavailableText,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon d={iconD} size={18} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5 truncate">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
        ) : error ? (
          <p className="text-sm text-red-500 font-medium">—</p>
        ) : unavailable ? (
          <p className="text-2xl font-bold text-gray-300">—</p>
        ) : (
          <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
        )}
        {!loading && !error && !unavailable && sub && (
          <p className={`text-xs font-medium mt-0.5 truncate ${subColor}`}>{sub}</p>
        )}
        {!loading && unavailable && (
          <p className="text-xs font-medium mt-0.5 truncate text-gray-400">{unavailableText}</p>
        )}
      </div>
    </div>
  </div>
);

// Honest placeholder for widgets that need endpoints which don't exist yet
// (there is no Locations / Transfers / Movements module in the tested API).
const NotConnectedPanel = ({ title, description, className = "" }) => (
  <div className={`bg-white border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center ${className}`}>
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Icon d={icons.inbox} size={18} className="text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{description}</p>
  </div>
);


export default function WarehouseOverviewPage() {
  const [range, setRange] = useState(null);

  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Locations is tracked separately from items/balances: until the backend
  // ships /api/v1/locations this will 404, and that's an expected "not
  // available yet" state, not a page-level error banner.
  const [locationsCount, setLocationsCount] = useState(null);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsUnavailable, setLocationsUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedItems = await fetchAllItems();
      const fetchedBalances = await fetchStockBalances(fetchedItems);
      setItems(fetchedItems);
      setBalances(fetchedBalances);
    } catch (err) {
      setError(err.message || "Couldn't load inventory data.");
    } finally {
      setLoading(false);
    }

    setLocationsLoading(true);
    try {
      const locs = await locationsApi.list();
      const count = Array.isArray(locs) ? locs.length : Array.isArray(locs?.data) ? locs.data.length : null;
      setLocationsCount(count);
      setLocationsUnavailable(count === null);
    } catch (err) {
      // Expected for now (404) — the endpoint doesn't exist yet.
      setLocationsCount(null);
      setLocationsUnavailable(true);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalQuantity = balances.reduce((sum, b) => sum + (b.balance?.total_on_hand || 0), 0);
  const totalValue = balances.reduce((sum, b) => {
    const qty = b.balance?.total_on_hand || 0;
    const cost = parseFloat(b.item.unit_cost) || 0;
    return sum + qty * cost;
  }, 0);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Warehouse Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time overview of your item inventory</p>
        </div>
        <DateRangePicker onChange={setRange} />
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
            <Icon d={icons.warning} size={16} className="text-red-500 shrink-0" /> {error}
          </p>
          <button onClick={load} className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap">
            Retry
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          iconD={icons.location}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Locations"
          value={locationsCount != null ? locationsCount.toLocaleString() : "—"}
          sub="All operational locations"
          subColor="text-blue-500"
          loading={locationsLoading}
          unavailable={locationsUnavailable}
          unavailableText="Locations endpoint isn't live yet"
        />

        <StatCard
          iconD={icons.hexagon}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Total Inventory Quantity"
          value={totalQuantity.toLocaleString()}
          sub="Sum of on-hand stock"
          subColor="text-green-600"
          loading={loading}
          error={error}
        />

        <StatCard
          iconD={icons.briefcase}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          label="Total Inventory Value"
          value={currency(totalValue)}
          sub="At unit cost"
          subColor="text-orange-500"
          loading={loading}
          error={error}
        />

        <StatCard
          iconD={icons.pie}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Utilization Rate"
          unavailable
          unavailableText="Capacity data isn't exposed by the API yet"
        />
      </div>

      {/* ── Middle Row: 3 panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 mb-4">
        <NotConnectedPanel
          title="Inventory by Location"
          description="No Locations endpoints are available yet, so stock can't be broken down by location."
        />
        <NotConnectedPanel
          title="Capacity Utilization by Location"
          description="Capacity data isn't exposed by the API yet — this needs a Locations module with capacity fields."
        />
        <NotConnectedPanel
          title="Location Status Summary"
          description="Waiting on a Locations endpoint to report active/attention/inactive status."
        />
      </div>

      {/* ── Bottom Row: Location Summary + Recent Movements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NotConnectedPanel
          className="min-h-[220px]"
          title="Location Summary"
          description="A GET /locations endpoint would populate this table — not present in the tested API yet."
        />
        <NotConnectedPanel
          className="min-h-[220px]"
          title="Recent Location Movements"
          description="This needs Transfers/Receipts endpoints (permissions like transfers.view exist, but no endpoints are tested yet)."
        />
      </div>
    </div>
  );
}