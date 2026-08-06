import React from "react";
import { RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { cx } from "./utils.js";
import { ACTIVITY_ICONS } from "./constants.js";
import { Donut } from "./Donut.jsx";

export function StockCountOverview({ overview, loading, onOpenCalendar }) {
  const breakdown = overview?.breakdown || [];
  const countTypes = overview?.countTypes || [];
  const recentActivity = overview?.recentActivity || [];

  return (
    <aside className="w-[300px] shrink-0 space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[15px] font-semibold text-gray-900">
          Stock Count Overview
        </h3>

        <div className="mt-5 flex justify-center">
          <Donut segments={breakdown} />
        </div>

        <div className="mt-5 space-y-2.5">
          {loading && breakdown.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3.5 w-full animate-pulse rounded bg-gray-100"
              />
            ))
          ) : breakdown.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            breakdown.map((seg) => (
              <div
                key={seg.label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  {seg.label}
                </div>
                <span className="font-medium text-gray-900">
                  {seg.value} {seg.pct != null && `(${seg.pct}%)`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-[15px] font-semibold text-gray-900">Count Types</h3>
        <div className="mt-4 space-y-3.5">
          {loading && countTypes.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-3.5 w-full animate-pulse rounded bg-gray-100"
              />
            ))
          ) : countTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No count types yet.</p>
          ) : (
            countTypes.map((ct) => (
              <div
                key={ct.label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <RotateCcw size={14} className="text-gray-400" />
                  {ct.label}
                </div>
                <span className="font-medium text-gray-900">{ct.value}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Recent Activity
          </h3>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View all
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {loading && recentActivity.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing has happened yet.</p>
          ) : (
            recentActivity.map((a) => {
              const cfg = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.created;
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="flex gap-3">
                  <div
                    className={cx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      cfg.bg,
                    )}
                  >
                    <Icon size={14} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.title}
                    </p>
                    <p className="text-sm text-gray-500">{a.description}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{a.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onOpenCalendar}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
        >
          <CalendarIcon size={15} />
          View Count Calendar
        </button>
      </div>
    </aside>
  );
}
