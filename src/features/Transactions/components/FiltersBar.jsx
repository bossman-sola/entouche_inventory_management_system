import React, { useRef } from "react";
import { SearchSm, CalIcon, ChevDown, FilterIcon } from "./icons/SmallIcons.jsx";
import { DateRangePicker } from "./DateRangePicker.jsx";

// The search box + date range + type/status selects + clear button row
// that sits above the transactions table.
export const FiltersBar = ({
  search, onSearchChange,
  dateRange, onDateRangeChange,
  isDatePickerOpen, onToggleDatePicker, onCloseDatePicker,
  filterType, onFilterTypeChange,
  filterStatus, onFilterStatusChange,
  onClear,
}) => {
  const dateBtnRef = useRef(null);

  const dateLabel = dateRange
    ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All dates";

  return (
    <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: "14px 16px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

      {/* Search */}
      <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 280 }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><SearchSm /></span>
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by item or transaction ID…"
          style={{ width: "100%", padding: "7px 10px 7px 30px", background: "#f4f6fb", border: "1px solid #e4e7ef", borderRadius: 7, color: "#1e2740", fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>

      {/* Date Range Picker */}
      <div style={{ position: "relative" }} ref={dateBtnRef}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Date Range</span>
          <div
            onClick={e => { e.stopPropagation(); onToggleDatePicker(); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <CalIcon /> {dateLabel} <ChevDown />
          </div>
        </div>
        {isDatePickerOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 400 }} onClick={onCloseDatePicker} />
            <DateRangePicker
              isOpen={isDatePickerOpen}
              initialStart={dateRange?.start}
              initialEnd={dateRange?.end}
              onClose={onCloseDatePicker}
              onApply={(start, end) => onDateRangeChange({ start, end })}
            />
          </>
        )}
      </div>

      {/* Type */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Type</span>
        <div style={{ position: "relative" }}>
          <select value={filterType} onChange={e => onFilterTypeChange(e.target.value)}
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
          <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", minWidth: 120, color: "#1e2740", fontFamily: "inherit" }}>
            <option value="">All Statuses</option>
            {["Completed","Approved","Pending","Cancelled","Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
        </div>
      </div>

      {/* Clear */}
      <div
        onClick={onClear}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", marginLeft: "auto", whiteSpace: "nowrap" }}
      >
        <FilterIcon /> Clear Filters
      </div>
    </div>
  );
};

export default FiltersBar;
