import React, { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { STATUSES, COUNT_TYPES } from "./constants.js";

export function AdvancedFiltersModal({ open, onClose, filters, onApply }) {
  const [status, setStatus] = useState(filters.status || []);
  const [countType, setCountType] = useState(filters.countType || []);
  const [variance, setVariance] = useState(filters.variance || null);
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");

  useEffect(() => {
    if (open) {
      setStatus(filters.status || []);
      setCountType(filters.countType || []);
      setVariance(filters.variance || null);
      setStartDate(filters.startDate || "");
      setEndDate(filters.endDate || "");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const toggle = (arr, setArr, value) =>
    setArr(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/30 pt-24"
      onClick={onClose}
    >
      <div
        className="w-[380px] rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Advanced Filters
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
              STATUS
            </p>
            <div className="space-y-2.5">
              {STATUSES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={status.includes(s)}
                    onChange={() => toggle(status, setStatus, s)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
              COUNT TYPE
            </p>
            <div className="space-y-2.5">
              {COUNT_TYPES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={countType.includes(s)}
                    onChange={() => toggle(countType, setCountType, s)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
              VARIANCE
            </p>
            <div className="space-y-2.5">
              {["Matches Only", "Variance Only"].map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="variance"
                    checked={variance === v}
                    onChange={() => setVariance(v)}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
              DATE RANGE
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <CalendarIcon
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-2 text-sm text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <span className="text-gray-300">→</span>
              <div className="relative flex-1">
                <CalendarIcon
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-2 text-sm text-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => {
              setStatus([]);
              setCountType([]);
              setVariance(null);
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply({ status, countType, variance, startDate, endDate });
              onClose();
            }}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
