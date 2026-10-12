import React from "react";
import { ClipboardList } from "lucide-react";
import { cx } from "./utils.js";
import { STATUS_STYLES } from "./constants.js";

export function StatusBadge({ status }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}

export function VarianceCell({ value }) {
  if (value === 0 || value === null || value === undefined) {
    return (
      <span className="text-gray-500 text-sm">
        {value === 0 ? "0 PCS" : "–"}
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={cx(
        "text-sm font-medium",
        positive ? "text-emerald-600" : "text-red-500",
      )}
    >
      {positive ? "+" : ""}
      {value} PCS
    </span>
  );
}


export function SkeletonRow({ cols }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-3.5 rounded bg-gray-100 animate-pulse"
            style={{ width: `${50 + (i % 3) * 15}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function EmptyState({ icon: Icon = ClipboardList, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
        <Icon size={22} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-400 max-w-sm">{description}</p>
      )}
    </div>
  );
}



export function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  footer,
  footerColor,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div
        className={cx(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
          iconBg,
        )}
      >
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-none text-gray-900">
        {value ?? "–"}
      </p>
      {footer && (
        <p className={cx("mt-2 text-sm font-medium", footerColor)}>{footer}</p>
      )}
    </div>
  );
}
