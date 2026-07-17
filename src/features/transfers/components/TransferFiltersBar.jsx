import { useState, useRef, useEffect } from "react";
import { Icon, icons } from "./icons.jsx";
import { Select, TRANSFER_STATUSES, STATUS_META } from "./ui.jsx";

function DateRangeFilter({ start, end, onChange }) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(start || "");
  const [localEnd, setLocalEnd] = useState(end || "");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const label = start && end
    ? `${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All time";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 whitespace-nowrap"
      >
        <Icon d={icons.calendar} size={14} /> {label}
        <Icon d={icons.chevronDown} size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Start</label>
            <input type="date" value={localStart} onChange={e => setLocalStart(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">End</label>
            <input type="date" value={localEnd} onChange={e => setLocalEnd(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setLocalStart(""); setLocalEnd(""); onChange(null, null); setOpen(false); }} className="flex-1 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">Clear</button>
            <button type="button" onClick={() => { onChange(localStart, localEnd); setOpen(false); }} className="flex-1 text-xs font-semibold text-white bg-blue-600 rounded-lg py-1.5 hover:bg-blue-700">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferFiltersBar({
  locations,
  fromFilter, setFromFilter,
  toFilter, setToFilter,
  statusFilter, setStatusFilter,
  itemFilter, setItemFilter,
  dateStart, dateEnd, setDateRange,
}) {
  const locationOptions = locations.map(l => ({ value: String(l.id), label: `${l.warehouseName} — ${l.name}` }));
  const statusOptions = TRANSFER_STATUSES.map(s => ({ value: s, label: STATUS_META[s].label }));
  const hasFilters = fromFilter || toFilter || statusFilter || itemFilter || (dateStart && dateEnd);

  const clearAll = () => {
    setFromFilter("");
    setToFilter("");
    setStatusFilter("");
    setItemFilter("");
    setDateRange(null, null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
      <DateRangeFilter start={dateStart} end={dateEnd} onChange={setDateRange} />
      <Select value={fromFilter} onChange={setFromFilter} options={locationOptions} placeholder="From Location" className="w-full sm:w-48" />
      <Select value={toFilter} onChange={setToFilter} options={locationOptions} placeholder="To Location" className="w-full sm:w-48" />
      <div className="relative w-full sm:w-48">
        <Icon d={icons.search} size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={itemFilter}
          onChange={e => setItemFilter(e.target.value)}
          placeholder="Search item..."
          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" className="w-full sm:w-44" />
      <div className="flex items-center gap-3 sm:ml-auto">
        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-red-500 hover:underline whitespace-nowrap">
            Clear filters
          </button>
        )}
        <button type="button" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
          <Icon d={icons.filter} size={14} /> More Filters
        </button>
      </div>
    </div>
  );
}