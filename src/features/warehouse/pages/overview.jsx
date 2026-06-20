import { useState, useRef } from "react";


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
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  xCircle: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  arrowUp: "M7 11l5-5m0 0l5 5m-5-5v12",
  dotsV: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  storage: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  dispatch: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  receive: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  damaged: "M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.97L13.75 4a2 2 0 00-3.5 0l-6.25 11A2 2 0 005.07 19z",
};


const DonutChart = ({ segments, total }) => {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const innerR = 36;
  const circumference = 2 * Math.PI * r;

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
    <svg width={size} height={size}>
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6b7280">Total</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#6b7280">Quantity</text>
    </svg>
  );
};


const UtilBar = ({ label, pct, color }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-1.5">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">*</p>
      </div>
      <span className="text-sm font-semibold text-gray-700">{pct}%</span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  </div>
);


const DateRangePicker = () => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("May 21 – May 27, 2025");
  const ranges = ["Today", "Last 7 days", "May 21 – May 27, 2025", "This month", "Last 30 days", "Custom range"];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Icon d={icons.calendar} size={14} className="text-gray-500" />
        <span>{label}</span>
        <Icon d={icons.chevronDown} size={13} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-48 py-1">
          {ranges.map(r => (
            <button key={r} onClick={() => { setLabel(r === "Last 7 days" ? "May 21 – May 27, 2025" : r); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const StatusBadge = ({ status }) => {
  const s = {
    Active: "bg-green-100 text-green-700",
    Attention: "bg-yellow-100 text-yellow-700",
    Inactive: "bg-red-100 text-red-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
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
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
    <span className="text-sm text-gray-700">{pct}%</span>
  </div>
);


const LOCATIONS = [
  { name: "Storage Area", desc: "Main storage location", qty: 2348, value: "₦38,240,000", util: 73, utilColor: "#22c55e", status: "Active" },
  { name: "Dispatch Area", desc: "Outgoing goods area", qty: 215, value: "₦4,320,500", util: 42, utilColor: "#f59e0b", status: "Active" },
  { name: "Receiving Area", desc: "Incoming goods area", qty: 128, value: "₦2,180,750", util: 18, utilColor: "#3b82f6", status: "Active" },
  { name: "Damaged Goods Area", desc: "Damaged items storage", qty: 38, value: "₦1,039,000", util: 10, utilColor: "#a855f7", status: "Attention" },
];

const MOVEMENTS = [
  { date: "May 27, 2025 10:15 AM", item: "Dell Latitude 5440", from: "Receiving Area", to: "Storage Area", qty: 20, user: "Inventory Officer" },
  { date: "May 27, 2025 09:32 AM", item: "Office Chair", from: "Storage Area", to: "Dispatch Area", qty: 3, user: "Inventory Officer" },
  { date: "May 26, 2025 04:45 PM", item: "USB-C Hub 7-in-1", from: "Storage Area", to: "Damaged Goods Area", qty: 5, user: "Warehouse Manager" },
  { date: "May 26, 2025 02:10 PM", item: "HP LaserJet Toner", from: "Receiving Area", to: "Storage Area", qty: 10, user: "Inventory Officer" },
  { date: "May 26, 2025 11:05 AM", item: "Wireless Mouse", from: "Storage Area", to: "Dispatch Area", qty: 15, user: "Inventory Officer" },
];

const DONUT_SEGS = [
  { label: "Storage Area", value: 2348, color: "#22c55e", pct: "86.0%" },
  { label: "Dispatch Area", value: 215, color: "#f59e0b", pct: "7.9%" },
  { label: "Receiving Area", value: 128, color: "#3b82f6", pct: "4.7%" },
  { label: "Damaged Goods Area", value: 38, color: "#ef4444", pct: "1.4%" },
];

const UTIL_BARS = [
  { label: "Storage Area", pct: 73, color: "#22c55e" },
  { label: "Dispatch Area", pct: 42, color: "#f59e0b" },
  { label: "Receiving Area", pct: 18, color: "#3b82f6" },
  { label: "Damaged Goods Area", pct: 10, color: "#a855f7" },
];

export default function WarehouseOverviewPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time overview of your warehouse locations and inventory distribution</p>
        </div>
        <DateRangePicker />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Locations */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon d={icons.location} size={18} className="text-blue-500" fill="none" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Locations</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">All operational locations</p>
            </div>
          </div>
        </div>

        {/* Total Inventory Quantity */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Icon d={icons.hexagon} size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Inventory Quantity</p>
              <p className="text-3xl font-bold text-gray-900">2,729</p>
              <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                <Icon d={icons.arrowUp} size={11} strokeWidth={2.5} />
                6.7% vs last 7 days
              </p>
            </div>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Icon d={icons.briefcase} size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900">₦45,780,250</p>
              <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                <Icon d={icons.arrowUp} size={11} strokeWidth={2.5} />
                8.4% vs last 7 days
              </p>
            </div>
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Icon d={icons.pie} size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Utilization Rate</p>
              <p className="text-3xl font-bold text-gray-900">68.4%</p>
              <p className="text-xs text-purple-500 font-medium mt-0.5">Overall capacity utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Row: 3 panels ── */}
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 mb-4">

        {/* Inventory by Location */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Inventory by Location</h2>
          <div className="flex justify-center mb-4">
            <DonutChart segments={DONUT_SEGS} total={2729} />
          </div>
          <div className="space-y-2">
            {DONUT_SEGS.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-700">{s.label}</span>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{s.value.toLocaleString()} ({s.pct})</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-xs text-blue-600 font-medium hover:text-blue-700">View all locations</button>
        </div>

        {/* Capacity Utilization by Location */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Capacity Utilization by Location</h2>
          <div>
            {UTIL_BARS.map(b => <UtilBar key={b.label} {...b} />)}
          </div>
          <button className="mt-4 text-xs text-blue-600 font-medium hover:text-blue-700">View capacity details</button>
        </div>

        {/* Location Status Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Location Status Summary</h2>
          <div className="space-y-3">
            {/* Active */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/60 border border-green-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon d={icons.check} size={15} className="text-green-600" fill="none" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Active Locations</p>
                  <p className="text-xs text-gray-500">All systems operational</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>

            {/* Attention */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50/60 border border-yellow-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Icon d={icons.warning} size={14} className="text-yellow-600" fill="none" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Attention Required</p>
                  <p className="text-xs text-gray-500">Requires monitoring</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-500">1</span>
            </div>

            {/* Inactive */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/40 border border-red-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                  <Icon d={icons.xCircle} size={14} className="text-red-400" fill="none" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Inactive Locations</p>
                  <p className="text-xs text-gray-500">Currently inactive</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-400">0</span>
            </div>
          </div>
          <button className="mt-4 text-xs text-blue-600 font-medium hover:text-blue-700">View all locations</button>
        </div>
      </div>

      {/* ── Bottom Row: Location Summary + Recent Movements ── */}
      <div className="grid grid-cols-[1fr_1fr] gap-4">

        {/* Location Summary */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Location Summary</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Location", "Description", "Quantity", "Inventory Value", "Utilization", "Status", ""].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOCATIONS.map((loc, i) => (
                <tr key={loc.name} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <LocationIcon type={loc.name} />
                      <span className="text-sm font-medium text-gray-800">{loc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{loc.desc}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800">{loc.qty.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{loc.value}</td>
                  <td className="py-3 px-4">
                    <MiniUtilBar pct={loc.util} color={loc.utilColor} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={loc.status} />
                  </td>
                  <td className="py-3 px-4">
                    <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <Icon d={icons.dotsV} size={15} fill="currentColor" stroke="none" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">Showing 1 to 4 of 4 locations</p>
            <button className="text-xs text-blue-600 font-medium hover:text-blue-700">View all locations</button>
          </div>
        </div>

        {/* Recent Location Movements */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Recent Location Movements</h2>
            <button className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Date & Time", "Item", "From", "To", "Qty", "User"].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOVEMENTS.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{m.date}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 whitespace-nowrap">{m.item}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{m.from}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{m.to}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800">{m.qty}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button className="text-xs text-blue-600 font-medium hover:text-blue-700">View all movements</button>
          </div>
        </div>

      </div>
    </div>
  );
}
