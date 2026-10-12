import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cx } from "./utils.js";
import { COUNT_TYPES, CALENDAR_TYPE_COLORS } from "./constants.js";

export function StockCountCalendarModal({
  open,
  onClose,
  monthDate,
  onMonthChange,
  events,
  loading,
  locations,
  onNewCount,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");

  if (!open) return null;

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, muted: false, date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({
      day: cells.length - startWeekday - daysInMonth + 1,
      muted: true,
    });
  }

  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  const isToday = (d) => d && d.toDateString() === today.toDateString();

  const eventsForDay = (date) => {
    if (!date || !events) return [];
    return events.filter(
      (ev) =>
        new Date(ev.date).toDateString() === date.toDateString() &&
        (!selectedLocation ||
          String(ev.location_id ?? ev.locationId ?? ev.location) ===
            selectedLocation) &&
        (!selectedType || ev.type === selectedType),
    );
  };
  const toDateInputValue = (date) => {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  return (
    <div
      className="absolute inset-0 z-40 overflow-auto- bg-black/30 p-4"
      onClick={onClose}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[920px] items-start justify-center">
        <div
          className="w-full rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-4rem)] sm:overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Stock Count Calendar
              </h3>
              <p className="text-sm text-gray-500">
                View and manage all scheduled stock counts
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onMonthChange(new Date())}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                onClick={() => onMonthChange(new Date(year, month - 1, 1))}
                className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onMonthChange(new Date(year, month + 1, 1))}
                className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
              <span className="ml-1 text-[15px] font-semibold text-gray-900">
                {monthLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                >
                  <option value="">All Locations</option>
                  {(locations || []).map((location) => (
                    <option key={location.value} value={location.value}>
                      {String(location.label).replace(/\s*--\s*/g, " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {COUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
              <button
                onClick={() =>
                  onNewCount({
                    scheduledDate: selectedDate
                      ? toDateInputValue(selectedDate)
                      : "",
                    location: selectedLocation,
                    countType: selectedType,
                  })
                }
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={15} /> New Count
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 overflow-hidden rounded-xl border border-gray-100">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div
                key={d}
                className="border-b border-gray-100 bg-gray-50 py-2 text-center text-xs font-semibold tracking-wide text-gray-400"
              >
                {d}
              </div>
            ))}
            {cells.map((c, i) => (
              <button
                type="button"
                key={i}
                disabled={c.muted}
                onClick={() => !c.muted && setSelectedDate(c.date)}
                className={cx(
                  "min-h-[92px] border-b border-r border-gray-100 p-2 text-left last:border-r-0 [&:nth-child(7n)]:border-r-0",
                  c.muted
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-blue-50",
                  selectedDate?.toDateString() === c.date?.toDateString() &&
                    "bg-blue-50 ring-2 ring-inset ring-blue-500",
                )}
              >
                <span
                  className={cx(
                    "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    c.muted
                      ? "text-gray-300"
                      : isToday(c.date)
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-gray-700",
                  )}
                >
                  {c.day}
                </span>
                <div className="mt-1 space-y-1">
                  {loading && !c.muted ? (
                    <div className="h-8 w-full animate-pulse rounded bg-gray-50" />
                  ) : (
                    eventsForDay(c.date).map((ev) => {
                      const colors =
                        CALENDAR_TYPE_COLORS[ev.type] ||
                        CALENDAR_TYPE_COLORS["Cycle Count"];
                      return (
                        <div
                          key={ev.id}
                          className={cx(
                            "rounded-md px-1.5 py-1 text-[11px] leading-tight",
                            colors.bg,
                            colors.text,
                          )}
                        >
                          <p className="font-semibold">{ev.type}</p>
                          <p>{ev.time}</p>
                          <p className="opacity-80">{ev.location}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {Object.entries(CALENDAR_TYPE_COLORS)
                .filter(([k]) => k !== "Recount")
                .map(([label, c]) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className={cx("h-2 w-2 rounded-full", c.dot)} />{" "}
                    {label}
                  </div>
                ))}
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X size={15} /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
