import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  PlayCircle,
  Printer,
  Copy,
  Check,
  XCircle,
  RotateCcw,
  FileSpreadsheet,
  FileDown,
  Upload,
  MessageSquare,
  Info,
  ArrowLeft,
  Filter as FilterIcon,
  ClipboardList,
} from "lucide-react";

import {
  listStockCounts,
  createStockCount,
  getStockCount,
  updateStockCount,
  deleteStockCount,
  startStockCount,
  completeStockCount,
  approveStockCount,
  cancelStockCount,
} from "../api/StockCountApi.js";
import apiClient from "../../../shared/api/axiosClient.js";
import { warehousesApi } from "../../warehouse/api/warehousesApi.js";

/* ============================================================================
   DATA LAYER
   ----------------------------------------------------------------------------
   Wiring to StockCountApi.js — map backend shapes to the UI's expectations.
============================================================================ */

const STATUSES = [
  "Draft",
  "Submitted",
  "Pending Review",
  "Approved",
  "Completed",
];
const COUNT_TYPES = ["Cycle Count", "Spot Check", "Full Physical", "Recount"];


// GET /api/stock-counts/overview
async function apiFetchOverview() {
  // No dedicated overview endpoint in the SDK; derive a lightweight
  // summary from the first page of results so overview cards render.
  try {
    const { stockCounts, meta } = await listStockCounts({ page: 1 });
    const total = meta?.total ?? stockCounts.length;
    const completedCounts = stockCounts.filter((s) => s.status === "approved" || s.status === "completed").length;
    const variancesFound = stockCounts.reduce((acc, sc) => {
      const items = sc.items || [];
      const v = items.reduce((a, it) => a + (Number(it.variance_quantity || it.variance || 0) !== 0 ? 1 : 0), 0);
      return acc + v;
    }, 0);
    return {
      totalStockCounts: total,
      totalDelta: undefined,
      pendingReview: stockCounts.filter((s) => s.status === "completed").length,
      variancesFound,
      completedCounts,
      completedDelta: undefined,
      breakdown: [],
      countTypes: [],
      recentActivity: [],
    };
  } catch (err) {
    return null;
  }
}

// GET /api/stock-counts?search=&warehouse=&location=&status=&page=&pageSize=
async function apiFetchStockCounts(params = {}) {
  const { stockCounts, meta } = await listStockCounts(params);
  const rows = (stockCounts || []).map((sc) => {
    const varianceVal = sc.total_variance ?? sc.totalVariance ?? (sc.items ? sc.items.reduce((a, it) => a + Number(it.variance_quantity || it.variance || 0), 0) : 0);
    const countedBy = sc.counted_by_name || sc.counted_by || sc.countedBy || "-";
    const date = sc.count_date || sc.countDate || sc.created_at || sc.createdAt;
    const d = date ? new Date(date) : null;
    return {
      id: sc.id,
      countNo: sc.count_number || sc.countNo || `#${sc.id}`,
      warehouse: (sc.warehouse && (sc.warehouse.name || sc.warehouse)) || sc.warehouse_id || "-",
      location: (sc.location && (sc.location.name || sc.location)) || sc.warehouse_location_id || "-",
      countType: sc.count_type || sc.countType || sc.type || "-",
      items: sc.items ? sc.items.length : sc.items_count ?? 0,
      variance: varianceVal,
      status: (sc.status || "").replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase()),
      countedBy,
      date: d ? d.toLocaleDateString() : "-",
      time: d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    };
  });
  return { rows, total: meta?.total ?? rows.length, page: meta?.current_page ?? params.page ?? 1, pageSize: meta?.per_page ?? params.pageSize ?? 10 };
}

// GET /api/stock-counts/:id
async function apiFetchStockCountDetails(id) {
  const sc = await getStockCount(id);
  if (!sc) return null;
  const header = {
    id: sc.id,
    countNo: sc.count_number || sc.countNo || `#${sc.id}`,
    warehouse: sc.warehouse?.name || sc.warehouse || sc.warehouse_id,
    location: sc.location?.name || sc.location || sc.warehouse_location_id,
    countType: sc.count_type || sc.countType,
    countScope: sc.count_scope || sc.scope,
    priority: sc.priority,
    scheduledDate: sc.count_date || sc.countDate,
    startedTime: sc.started_at || sc.startedAt,
    assignedCounter: sc.assigned_counter_name || sc.assignedCounter || sc.counted_by,
    notes: sc.notes || sc.description,
    status: (sc.status || "").replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase()),
  };

  const items = (sc.items || []).map((it) => ({
    id: it.id,
    name: it.item?.name || it.name || "-",
    sku: it.item?.sku || it.sku || "-",
    barcode: it.item?.barcode || it.barcode || "-",
    location: it.location?.name || it.location || "-",
    shelf: it.shelf || "-",
    systemQty: it.system_quantity ?? it.systemQty ?? it.system_quantity?.toString?.() ?? "-",
    countedQty: it.counted_quantity ?? it.countedQty ?? null,
    variance: Number(it.variance_quantity ?? it.variance ?? 0),
    remarks: it.remarks,
  }));

  const totalItems = items.length;
  const countedItems = items.filter((i) => i.countedQty !== null && i.countedQty !== undefined && i.countedQty !== "").length;
  const uncountedItems = totalItems - countedItems;
  const totalVariance = items.reduce((a, it) => a + (Number(it.variance) || 0), 0);

  const stats = {
    totalItems,
    countedItems,
    uncountedItems,
    countedPct: totalItems ? Math.round((countedItems / totalItems) * 100) : 0,
    uncountedPct: totalItems ? Math.round((uncountedItems / totalItems) * 100) : 0,
    totalVariance,
    totalVariancePct: undefined,
    progressPct: totalItems ? Math.round((countedItems / totalItems) * 100) : 0,
  };

  const activity = (sc.activity || []).map((a) => ({
    title: a.title || a.type,
    detail: a.description || a.detail,
    time: a.time || a.created_at,
    done: !!a.done,
  }));

  return { header, stats, items, activity };
}

// GET /api/warehouses, /api/locations, /api/users
async function apiFetchLookups() {
  try {
    // Fetch all warehouses
    const allWarehouses = await warehousesApi.listAll();
    const warehouses = allWarehouses.map((w) => ({
      value: w.id,
      label: w.name || w.warehouse_name || `Warehouse ${w.id}`,
    }));

    // Fetch locations for all warehouses
    const locationsByWarehouse = await Promise.all(
      allWarehouses.map((w) =>
        warehousesApi
          .listLocations(w.id)
          .then((locs) =>
            (locs || []).map((loc) => ({
              value: loc.id,
              label: loc.name || loc.location_name || `Location ${loc.id}`,
              warehouseId: w.id,
            }))
          )
          .catch(() => [])
      )
    );
    const locations = locationsByWarehouse.flat();

    return { warehouses, locations, users: [] };
  } catch (err) {
    return { warehouses: [], locations: [], users: [] };
  }
}

// POST /api/stock-counts
async function apiCreateStockCount(payload) {
  // Map UI form to backend shape
  const body = {
    warehouse_id: payload.warehouse || payload.warehouse_id,
    warehouse_location_id: payload.location || payload.warehouse_location_id || null,
    count_date: payload.scheduledDate || payload.count_date,
    count_type: payload.countType,
    priority: payload.priority,
    assigned_counter: payload.assignedCounter,
    notes: payload.notes,
    items: payload.items || [],
  };
  return await createStockCount(body);
}

// PATCH /api/stock-counts/:id
async function apiUpdateStockCount(id, payload) {
  return await updateStockCount(id, payload);
}

// DELETE /api/stock-counts/:id
async function apiDeleteStockCount(id) {
  return await deleteStockCount(id);
}

// POST /api/stock-counts/:id/approve | /reject | /request-recount
async function apiTransitionStockCount(id, action) {
  switch (action) {
    case "approve":
      return await approveStockCount(id);
    case "start":
      return await startStockCount(id);
    case "complete":
      return await completeStockCount(id);
    case "cancel":
    case "reject":
      return await cancelStockCount(id);
    default:
      throw new Error(`Unsupported transition action: ${action}`);
  }
}

// GET /api/stock-counts/export?format=&scope=
async function apiExportStockCounts(options = {}) {
  const params = { format: options.format || "xlsx", scope: options.scope || "current" };
  if (options.id) params.id = options.id;
  const res = await apiClient.get("/stock-counts/export", { params, responseType: "blob" });
  return res.data;
}

/* ============================================================================
   SMALL SHARED UI PRIMITIVES
============================================================================ */

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside]);
}

const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-indigo-100 text-indigo-700",
  "Pending Review": "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

function StatusBadge({ status }) {
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

function VarianceCell({ value }) {
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

/* Skeleton row shown while data is loading (no hardcoded content, just placeholders) */
function SkeletonRow({ cols }) {
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

function EmptyState({ icon: Icon = ClipboardList, title, description }) {
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

/* ============================================================================
   STAT CARD (top of list page)
============================================================================ */
function StatCard({
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

/* ============================================================================
   OVERVIEW SIDEBAR (donut + count types + recent activity)
============================================================================ */
function Donut({ segments, size = 128, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  const total = segments.reduce((s, seg) => s + seg.pct, 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      {total === 0 ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
      ) : (
        segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAcc}
              strokeLinecap="butt"
            />
          );
          offsetAcc += dash;
          return circle;
        })
      )}
    </svg>
  );
}

const ACTIVITY_ICONS = {
  variance: { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-500" },
  completed: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    color: "text-emerald-500",
  },
  submitted: { icon: Check, bg: "bg-blue-50", color: "text-blue-500" },
  created: { icon: Plus, bg: "bg-violet-50", color: "text-violet-500" },
};

function StockCountOverview({ overview, loading, onOpenCalendar }) {
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

/* ============================================================================
   EXPORT DROPDOWN
============================================================================ */
function ExportDropdown({ onExport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const formats = [
    {
      id: "xlsx",
      label: "Excel (.xlsx)",
      icon: FileSpreadsheet,
      color: "text-emerald-600",
    },
    { id: "csv", label: "CSV", icon: FileText, color: "text-emerald-600" },
    { id: "pdf", label: "PDF Report", icon: FileDown, color: "text-red-500" },
  ];
  const scopes = [
    { id: "current", label: "Export Current Page", icon: FileText },
    { id: "filtered", label: "Export Filtered Results", icon: FilterIcon },
    { id: "all", label: "Export All Counts", icon: Upload },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Upload size={15} />
        Export
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <p className="px-2 pb-1 pt-1 text-xs font-semibold tracking-wide text-gray-400">
            EXPORT FORMAT
          </p>
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                onExport({ format: f.id, scope: "current" });
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <f.icon size={16} className={f.color} />
              {f.label}
            </button>
          ))}
          <div className="my-1.5 border-t border-gray-100" />
          <p className="px-2 pb-1 pt-1 text-xs font-semibold tracking-wide text-gray-400">
            EXPORT SCOPE
          </p>
          {scopes.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onExport({ format: "xlsx", scope: s.id });
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <s.icon size={16} className="text-gray-400" />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ROW ACTIONS DROPDOWN (menu items depend on the row's status)
============================================================================ */
function RowActionsMenu({
  row,
  onView,
  onEdit,
  onContinue,
  onDelete,
  onPrint,
  onDuplicate,
  onApprove,
  onReject,
  onRequestRecount,
  onExportPdf,
  onClose,
}) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const item = (icon, label, onClick, danger) => (
    <button
      onClick={() => {
        onClick && onClick(row);
        onClose();
      }}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50",
        danger ? "text-red-500" : "text-gray-700",
      )}
    >
      {React.createElement(icon, {
        size: 15,
        className: danger ? "text-red-500" : "text-gray-400",
      })}
      {label}
    </button>
  );

  let content;
  switch (row.status) {
    case "Draft":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Pencil, "Edit", onEdit)}
          {item(PlayCircle, "Continue Count", onContinue)}
          {item(Trash2, "Delete", onDelete, true)}
        </>
      );
      break;
    case "Submitted":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Printer, "Print Count Sheet", onPrint)}
          {item(Copy, "Duplicate", onDuplicate)}
        </>
      );
      break;
    case "Pending Review":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Check, "Approve", onApprove)}
          {item(XCircle, "Reject", onReject, true)}
          {item(RotateCcw, "Request Recount", onRequestRecount)}
        </>
      );
      break;
    case "Completed":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Printer, "Print", onPrint)}
          {item(Copy, "Duplicate", onDuplicate)}
          {item(FileDown, "Export PDF", onExportPdf)}
        </>
      );
      break;
    default: // Approved and any other status
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Printer, "Print", onPrint)}
          {item(Copy, "Duplicate", onDuplicate)}
        </>
      );
  }

  return (
    <div
      ref={ref}
      className="absolute right-8 top-0 z-20 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
    >
      {content}
    </div>
  );
}

/* ============================================================================
   ADVANCED FILTERS MODAL
============================================================================ */
function AdvancedFiltersModal({ open, onClose, filters, onApply }) {
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

/* ============================================================================
   NEW STOCK COUNT MODAL
============================================================================ */
function LabeledSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  hint,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value || o} value={o.value || o}>
              {o.label || o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function NewStockCountModal({ open, onClose, lookups, onCreate }) {
  const [form, setForm] = useState({
    warehouse: "",
    location: "",
    countType: "",
    priority: "Medium",
    scheduledDate: "",
    startTime: "",
    assignedCounter: "",
    notes: "",
  });

  useEffect(() => {
    if (open)
      setForm({
        warehouse: "",
        location: "",
        countType: "",
        priority: "Medium",
        scheduledDate: "",
        startTime: "",
        assignedCounter: "",
        notes: "",
      });
  }, [open]);

  if (!open) return null;
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const warehouses = lookups?.warehouses || [];
  const locations = lookups?.locations || [];
  const users = lookups?.users || [];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-[640px] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={19} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                New Stock Count
              </h3>
              <p className="text-sm text-gray-500">
                Create a new stock count to record physical inventory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-sm font-semibold text-gray-900">
            Count Information
          </p>

          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect
              label="Warehouse"
              required
              placeholder="Select warehouse"
              value={form.warehouse}
              onChange={set("warehouse")}
              options={warehouses}
            />
            <LabeledSelect
              label="Location"
              placeholder="Select location"
              hint="Specific area or zone for this count (optional)."
              value={form.location}
              onChange={set("location")}
              options={locations}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect
              label="Count Type"
              required
              placeholder="Select count type"
              hint="Choose the type of stock count you want to perform."
              value={form.countType}
              onChange={set("countType")}
              options={COUNT_TYPES}
            />
            <LabeledSelect
              label="Priority"
              placeholder="Select priority"
              hint="Set the priority level for this count."
              value={form.priority}
              onChange={set("priority")}
              options={["Low", "Medium", "High"]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => set("scheduledDate")(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime")(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <LabeledSelect
            label="Assigned Counter"
            required
            placeholder="Select user"
            hint="Person responsible for conducting this count."
            value={form.assignedCounter}
            onChange={set("assignedCounter")}
            options={users}
          />

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">Notes</p>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              maxLength={500}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Add any additional notes or instructions for this stock count..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {form.notes.length} / 500
            </p>
          </div>

          <div className="flex gap-3 rounded-lg bg-blue-50 px-4 py-3">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700">
              <span className="font-semibold">What happens next?</span>
              <br />
              After creating the stock count, you can add items and begin the
              counting process.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onCreate(form)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={15} /> Create Stock Count
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   STOCK COUNT CALENDAR MODAL
============================================================================ */
const CALENDAR_TYPE_COLORS = {
  "Cycle Count": {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  "Full Physical": {
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  "Spot Check": {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  Recount: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
};

function StockCountCalendarModal({
  open,
  onClose,
  monthDate,
  onMonthChange,
  events,
  loading,
  onNewCount,
}) {
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
      (ev) => new Date(ev.date).toDateString() === date.toDateString(),
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-[920px] max-w-full rounded-2xl bg-white p-6 shadow-xl"
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
              <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none">
                <option>All Locations</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <div className="relative">
              <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none">
                <option>All Types</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <button
              onClick={onNewCount}
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
            <div
              key={i}
              className="min-h-[92px] border-b border-r border-gray-100 p-2 last:border-r-0 [&:nth-child(7n)]:border-r-0"
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
            </div>
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
                  <span className={cx("h-2 w-2 rounded-full", c.dot)} /> {label}
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
  );
}

/* ============================================================================
   STOCK COUNT DETAILS PAGE
============================================================================ */
const DETAIL_TABS = ["Items", "Summary", "Adjustments", "History", "Notes"];

function StockCountDetails({ countId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Items");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiFetchStockCountDetails(countId).then((res) => {
      if (alive) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [countId]);

  const header = data?.header;
  const stats = data?.stats;
  const items = data?.items || [];
  const activity = data?.activity || [];

  return (
    <div className="mx-auto max-w-[1500px] px-8 py-6">
      <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-400">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> Stock Counts
        </button>
        <span>/</span>
        <span className="text-gray-600">{header?.countNo || countId}</span>
        <span>/</span>
        <span className="text-gray-600">Details</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Stock Count Details
            </h1>
            <StatusBadge status={header?.status || "Draft"} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-blue-600">
              {header?.countNo || "–"}
            </span>{" "}
            • {header?.countType || "–"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer size={15} /> Print Count Sheet
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            More Actions <ChevronDown size={14} />
          </button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Submit Count
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4">
        <StatCard
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Items"
          value={stats?.totalItems}
          footer={stats ? `${stats.totalItems} to count` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Counted Items"
          value={stats?.countedItems}
          footer={stats ? `${stats.countedPct}%` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Uncounted Items"
          value={stats?.uncountedItems}
          footer={stats ? `${stats.uncountedPct}%` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Total Variance"
          value={
            stats?.totalVariance != null
              ? `${stats.totalVariance} PCS`
              : undefined
          }
          footer={
            stats?.totalVariancePct != null
              ? `${stats.totalVariancePct}%`
              : undefined
          }
          footerColor="text-red-400"
        />
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <SlidersHorizontal size={18} className="text-violet-600" />
          </div>
          <p className="text-sm text-gray-500">Progress</p>
          <p className="mt-1 text-[28px] font-semibold leading-none text-gray-900">
            {stats?.progressPct != null ? `${stats.progressPct}%` : "–"}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${stats?.progressPct || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <div className="flex-1">
          <div className="flex gap-6 border-b border-gray-200">
            {DETAIL_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "-mb-px border-b-2 px-1 pb-3 text-sm font-medium",
                  tab === t
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                {t}
                {t === "Items" && ` (${stats?.totalItems ?? 0})`}
              </button>
            ))}
          </div>

          {tab === "Items" && (
            <div className="mt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-72">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    placeholder="Search items by name, SKU, or barcode..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <FilterIcon size={14} /> Filter
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Plus size={14} /> Add Items
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Upload size={14} /> Import from File
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3">Item Details</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">System Qty</th>
                      <th className="px-4 py-3">Counted Qty</th>
                      <th className="px-4 py-3">Variance</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonRow key={i} cols={7} />
                      ))
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            title="No items in this count yet"
                            description="Add items manually or import them from a file to get started."
                          />
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr
                          key={it.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {it.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              SKU: {it.sku} • Barcode: {it.barcode}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {it.location}
                            <br />
                            <span className="text-xs text-gray-400">
                              {it.shelf}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {it.systemQty} PCS
                          </td>
                          <td className="px-4 py-3">
                            <input
                              defaultValue={it.countedQty ?? ""}
                              placeholder="Enter qty"
                              className="w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <VarianceCell value={it.variance} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-gray-400">
                              <MessageSquare
                                size={15}
                                className="cursor-pointer hover:text-gray-600"
                              />
                              <MoreVertical
                                size={15}
                                className="cursor-pointer hover:text-gray-600"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab !== "Items" && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-white">
              <EmptyState
                title={`No ${tab.toLowerCase()} yet`}
                description={`${tab} will show up here once available.`}
              />
            </div>
          )}
        </div>

        <aside className="w-[300px] shrink-0 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-[15px] font-semibold text-gray-900">
              Stock Count Information
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Warehouse", header?.warehouse],
                ["Location", header?.location],
                ["Count Type", header?.countType],
                ["Count Scope", header?.countScope],
                ["Priority", header?.priority],
                ["Scheduled Date", header?.scheduledDate],
                ["Started Time", header?.startedTime],
                ["Assigned Counter", header?.assignedCounter],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900">{v || "–"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Count Activity
              </h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full animate-pulse rounded bg-gray-100"
                  />
                ))
              ) : activity.length === 0 ? (
                <p className="text-sm text-gray-400">No activity yet.</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className={cx(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        a.done
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-gray-100 text-gray-300",
                      )}
                    >
                      <Check size={13} />
                    </div>
                    <div>
                      <p
                        className={cx(
                          "text-sm font-medium",
                          a.done ? "text-gray-900" : "text-gray-400",
                        )}
                      >
                        {a.title}
                      </p>
                      {a.detail && (
                        <p className="text-sm text-gray-500">{a.detail}</p>
                      )}
                      {a.time && (
                        <p className="mt-0.5 text-xs text-gray-400">{a.time}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-blue-50 p-4">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Next Step</p>
              <p className="mt-0.5 text-sm text-blue-700">
                Review all counted items, add any adjustments if needed, and
                submit the count for review.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN LIST PAGE
============================================================================ */
function StockCountsList({ onOpenDetails }) {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowsLoading, setRowsLoading] = useState(true);

  const [lookups, setLookups] = useState(null);

  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [newCountOpen, setNewCountOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState(null);

  const loadOverview = useCallback(() => {
    setOverviewLoading(true);
    apiFetchOverview().then((res) => {
      setOverview(res);
      setOverviewLoading(false);
    });
  }, []);

  const loadRows = useCallback(() => {
    setRowsLoading(true);
    apiFetchStockCounts({
      search,
      warehouse,
      location,
      status,
      page,
      pageSize,
      ...advancedFilters,
    }).then((res) => {
      setRows(res?.rows || []);
      setTotal(res?.total || 0);
      setRowsLoading(false);
    });
  }, [search, warehouse, location, status, page, pageSize, advancedFilters]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);
  useEffect(() => {
    loadRows();
  }, [loadRows]);
  useEffect(() => {
    apiFetchLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (!calendarOpen) return;
    setCalendarLoading(true);
    // GET /api/stock-counts/calendar?month=&year=
    Promise.resolve(null).then((res) => {
      setCalendarEvents(res || []);
      setCalendarLoading(false);
    });
  }, [calendarOpen, calendarMonth]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleCreate = async (form) => {
    await apiCreateStockCount(form);
    setNewCountOpen(false);
    loadRows();
    loadOverview();
  };

  const handleExport = async (options) => {
    await apiExportStockCounts(options);
  };

  const rowAction = (fn) => async (row) => {
    await fn(row);
    loadRows();
    loadOverview();
  };

  return (
    <div className="mx-auto max-w-[1500px] px-8 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Counts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage physical stock counts across your warehouses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown onExport={handleExport} />
          <button
            onClick={() => setNewCountOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={15} /> New Stock Count
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="Total Stock Counts"
              value={overview?.totalStockCounts}
              footer={overview?.totalDelta}
              footerColor="text-emerald-600"
            />
            <StatCard
              icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Pending Review"
              value={overview?.pendingReview}
              footer="View counts"
              footerColor="text-amber-600"
            />
            <StatCard
              icon={AlertTriangle}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              label="Variances Found"
              value={overview?.variancesFound}
              footer="View counts"
              footerColor="text-red-500"
            />
            <StatCard
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Completed Counts"
              value={overview?.completedCounts}
              footer={overview?.completedDelta}
              footerColor="text-emerald-600"
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
              <div className="relative w-72">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search stock count number..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    WAREHOUSE
                  </p>
                  <div className="relative">
                    <select
                      value={warehouse}
                      onChange={(e) => {
                        setWarehouse(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Warehouses</option>
                      {(lookups?.warehouses || []).map((w) => (
                        <option key={w.value} value={w.value}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    LOCATION
                  </p>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Locations</option>
                      {(lookups?.locations || []).map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    STATUS
                  </p>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                    <th className="px-4 py-3">Count No.</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Count Type</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Variance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Counted By</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} cols={10} />
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <EmptyState
                          title="No stock counts found"
                          description="Try adjusting your search or filters, or create a new stock count to get started."
                        />
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 text-sm hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onOpenDetails(row.id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {row.countNo}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.warehouse}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.location}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.countType}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.items}</td>
                        <td className="px-4 py-3">
                          <VarianceCell value={row.variance} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.countedBy}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {row.date}
                          <br />
                          <span className="text-xs">{row.time}</span>
                        </td>
                        <td className="relative px-4 py-3">
                          <div className="flex items-center gap-3 text-gray-400">
                            <Eye
                              size={16}
                              className="cursor-pointer hover:text-gray-600"
                              onClick={() => onOpenDetails(row.id)}
                            />
                            <MoreVertical
                              size={16}
                              className="cursor-pointer hover:text-gray-600"
                              onClick={() => setOpenMenuRowId(row.id)}
                            />
                          </div>
                          {openMenuRowId === row.id && (
                            <RowActionsMenu
                              row={row}
                              onClose={() => setOpenMenuRowId(null)}
                              onView={() => onOpenDetails(row.id)}
                              onEdit={() => {}}
                              onContinue={() => onOpenDetails(row.id)}
                              onDelete={rowAction((r) =>
                                apiDeleteStockCount(r.id),
                              )}
                              onPrint={() => {}}
                              onDuplicate={() => {}}
                              onApprove={rowAction((r) =>
                                apiTransitionStockCount(r.id, "approve"),
                              )}
                              onReject={rowAction((r) =>
                                apiTransitionStockCount(r.id, "reject"),
                              )}
                              onRequestRecount={rowAction((r) =>
                                apiTransitionStockCount(
                                  r.id,
                                  "request-recount",
                                ),
                              )}
                              onExportPdf={() =>
                                apiExportStockCounts({
                                  format: "pdf",
                                  scope: "single",
                                  id: row.id,
                                })
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                {total === 0
                  ? "Showing 0 results"
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total} results`}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cx(
                        "h-8 w-8 rounded-lg text-sm font-medium",
                        page === p
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 3 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                {totalPages > 3 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={cx(
                      "h-8 w-8 rounded-lg text-sm font-medium",
                      page === totalPages
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
                <div className="relative ml-2">
                  <select className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none">
                    <option>10 / page</option>
                    <option>25 / page</option>
                    <option>50 / page</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <StockCountOverview
          overview={overview}
          loading={overviewLoading}
          onOpenCalendar={() => setCalendarOpen(true)}
        />
      </div>

      <AdvancedFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={advancedFilters}
        onApply={(f) => {
          setAdvancedFilters(f);
          setPage(1);
        }}
      />

      <NewStockCountModal
        open={newCountOpen}
        onClose={() => setNewCountOpen(false)}
        lookups={lookups}
        onCreate={handleCreate}
      />

      <StockCountCalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        monthDate={calendarMonth}
        onMonthChange={setCalendarMonth}
        events={calendarEvents}
        loading={calendarLoading}
        onNewCount={() => {
          setCalendarOpen(false);
          setNewCountOpen(true);
        }}
      />
    </div>
  );
}

/* ============================================================================
   ROOT APP — swaps between list and details "pages"
============================================================================ */
export default function StockCountApp() {
  const [route, setRoute] = useState({ name: "list" });

  return (
    <div
      className="min-h-screen bg-gray-50 font-sans"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      {route.name === "list" ? (
        <StockCountsList
          onOpenDetails={(id) => setRoute({ name: "details", id })}
        />
      ) : (
        <StockCountDetails
          countId={route.id}
          onBack={() => setRoute({ name: "list" })}
        />
      )}
    </div>
  );
}
