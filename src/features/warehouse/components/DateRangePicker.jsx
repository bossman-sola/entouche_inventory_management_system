import { useState, useRef, useEffect } from "react";
import { Icon, icons } from "./ui/Icon.jsx";
import {
  startOfDay,
  endOfDay,
  sameDay,
  isBetween,
  formatFull,
  formatRangeLabel,
  buildPresets,
  buildMonthGrid,
  WEEKDAY_LABELS,
} from "../../../lib/dateUtils.js";

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

export const DateRangePicker = ({ onChange }) => {
  const today = new Date();
  const presets = buildPresets();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("list"); // "list" | "custom"
  const [activeKey, setActiveKey] = useState("last7");
  const [range, setRange] = useState(presets.find((p) => p.key === "last7"));

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
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
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
              {presets.map((p) => (
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
