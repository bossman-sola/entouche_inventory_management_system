import { Icon, icons } from "./icons.jsx";
import { Select, TRANSFER_STATUSES, STATUS_META } from "./ui.jsx";

export default function TransferFiltersBar({
  locations,
  fromFilter, setFromFilter,
  toFilter, setToFilter,
  statusFilter, setStatusFilter,
}) {
  const locationOptions = locations.map(l => ({ value: String(l.id), label: `${l.warehouseName} - ${l.name}` }));
  const statusOptions = TRANSFER_STATUSES.map(s => ({ value: s, label: STATUS_META[s].label }));
  const hasFilters = fromFilter || toFilter || statusFilter;

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-gray-500 sm:border-r border-gray-200 sm:pr-3 whitespace-nowrap">
        <Icon d={icons.calendar} size={14} /> All time
      </div>
      <Select value={fromFilter} onChange={setFromFilter} options={locationOptions} placeholder="From Location" className="w-full sm:w-48" />
      <Select value={toFilter} onChange={setToFilter} options={locationOptions} placeholder="To Location" className="w-full sm:w-48" />
      <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="All Statuses" className="w-full sm:w-44" />
      {hasFilters && (
        <button onClick={() => { setFromFilter(""); setToFilter(""); setStatusFilter(""); }} className="text-sm text-red-500 hover:underline sm:ml-auto">
          Clear filters
        </button>
      )}
    </div>
  );
}