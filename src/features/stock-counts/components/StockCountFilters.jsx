import {
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";


function SelectFilter({
  label,
  value,
  onChange,
  options = [],
  placeholder,
}) {
  return (
    <div className="relative min-w-[160px] border-l border-slate-200 pl-4">
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <div className="relative mt-0.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            appearance-none
            bg-transparent
            pr-6
            text-[12px]
            font-medium
            text-slate-700
            outline-none
            cursor-pointer
          "
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="
            pointer-events-none
            absolute
            right-0
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>
    </div>
  );
}


export default function StockCountFilters({
  search,
  onSearchChange,

  warehouse,
  onWarehouseChange,
  warehouseOptions = [],

  location,
  onLocationChange,
  locationOptions = [],

  status,
  onStatusChange,
  statusOptions = [],

  onOpenFilters,
}) {
  return (
    <div
      className="
        w-full
        min-h-[54px]

        flex
        items-center

        rounded-xl
        border
        border-slate-200
        bg-white

        px-4
      "
    >
      {/* Search */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Search
          size={17}
          className="shrink-0 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search stock count number..."
          className="
            w-full
            bg-transparent
            text-[13px]
            text-slate-700
            placeholder:text-slate-400
            outline-none
          "
        />
      </div>


      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center gap-4 ml-4">

        <SelectFilter
          label="Warehouse"
          value={warehouse}
          onChange={onWarehouseChange}
          options={warehouseOptions}
          placeholder="All Warehouses"
        />

        <SelectFilter
          label="Location"
          value={location}
          onChange={onLocationChange}
          options={locationOptions}
          placeholder="All Locations"
        />

        <SelectFilter
          label="Status"
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="All Statuses"
        />

        <button
          type="button"
          onClick={onOpenFilters}
          className="
            h-9
            px-3

            flex
            items-center
            justify-center
            gap-2

            rounded-lg
            border
            border-slate-200

            bg-white

            text-[12px]
            font-medium
            text-slate-700

            hover:bg-slate-50
            transition-colors
          "
        >
          <SlidersHorizontal
            size={15}
          />

          Filters
        </button>

      </div>
    </div>
  );
}