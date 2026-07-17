import { useMemo, useRef, useState, useEffect } from "react";
import { AlertCircle, MoreVertical } from "lucide-react";
import { useAdjustments, useAdjustmentFormData } from "../hooks/useAdjustments.js";
import NewAdjustmentModal from "../components/NewAdjustmentModal.jsx";
import { Icon } from "../components/icon.jsx";
import { icons } from "../components/icon.js";
import {
  TYPE_LABELS, TYPE_BADGE_CLASS, STATUS_LABELS, STATUS_BADGE_CLASS,
  getAdjType, getStatus, getReason, getDate, getReference,
  getLocationName, getWarehouseName, getAdjustedByName,
  formatDate, totalQtyForAdjustment,
  getFirstItemName, getItemCount, signedQtyForAdjustment, valueImpactForAdjustment,
} from "../components/adjustmentHelpers.js";


const StatCard = ({ label, value, sub, subColor, icon, bg, loading }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
        <Icon d={icon} size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        {loading ? (
          <div className="h-6 w-12 bg-gray-100 rounded animate-pulse mt-0.5" />
        ) : (
          <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        )}
        {!loading && sub && <p className={`text-xs ${subColor} truncate`}>{sub}</p>}
      </div>
    </div>
  </div>
);

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
    ? `${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "Date Range";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 whitespace-nowrap"
      >
        <Icon d={icons.calendar} size={14} /> {label}
        <Icon d={icons.chevronDown} size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Start</label>
            <input type="date" value={localStart} onChange={(e) => setLocalStart(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">End</label>
            <input type="date" value={localEnd} onChange={(e) => setLocalEnd(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

function RowMenu({ adjustment, onSubmit, onApprove, onReject, onCancel, onDelete }) {
  const [open, setOpen] = useState(false);
  const status = getStatus(adjustment);

  const actions = [];
  if (status === "draft") {
    actions.push({ label: "Submit for approval", onClick: onSubmit });
    actions.push({ label: "Delete draft", onClick: onDelete, danger: true });
  } else if (status === "pending") {
    actions.push({ label: "Approve", onClick: onApprove });
    actions.push({ label: "Reject", onClick: onReject, danger: true });
    actions.push({ label: "Cancel", onClick: onCancel, danger: true });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
            {actions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">No actions available</p>
            ) : actions.map((a) => (
              <button
                key={a.label}
                onClick={() => { setOpen(false); a.onClick(); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${a.danger ? "text-red-600" : "text-gray-700"}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdjustmentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [toast, setToast] = useState(null);

  const {
    adjustments, loading, error, actionError, page, setPage, hasNextPage, reload,
    submitAdjustment, approveAdjustment, rejectAdjustment, cancelAdjustment, deleteAdjustment,
  } = useAdjustments();

  const formData = useAdjustmentFormData();

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAction(fn, ...args) {
    const result = await fn(...args);
    showToast(result.message, result.ok ? "success" : "error");
  }

  const handleReject = (id) => {
    const reason = window.prompt("Reason for rejecting this adjustment:");
    if (reason === null) return;
    handleAction(rejectAdjustment, id, reason || "No reason given");
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this draft adjustment? This can't be undone.")) return;
    handleAction(deleteAdjustment, id);
  };

  const handleCancel = (id) => {
    if (!window.confirm("Cancel this adjustment?")) return;
    handleAction(cancelAdjustment, id);
  };

  const handleApprove = (id) => {
    if (!window.confirm("Approve this adjustment? This will update stock balances.")) return;
    handleAction(approveAdjustment, id);
  };

  const setDateRange = (start, end) => { setDateStart(start); setDateEnd(end); };

  const filtered = useMemo(() => {
    return adjustments.filter((a) => {
      if (typeFilter && getAdjType(a) !== typeFilter) return false;
      if (statusFilter && getStatus(a) !== statusFilter) return false;
      if (dateStart && dateEnd) {
        const d = new Date(getDate(a) || 0);
        const s = new Date(dateStart); s.setHours(0, 0, 0, 0);
        const e = new Date(dateEnd); e.setHours(23, 59, 59, 999);
        if (d < s || d > e) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${getReference(a)} ${getReason(a)} ${getLocationName(a)}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [adjustments, typeFilter, statusFilter, dateStart, dateEnd, search]);

  const increases = adjustments.filter((a) => getAdjType(a) === "increase");
  const decreases = adjustments.filter((a) => getAdjType(a) === "decrease");
  const totalIncQty = increases.reduce((s, a) => s + totalQtyForAdjustment(a), 0);
  const totalDecQty = decreases.reduce((s, a) => s + totalQtyForAdjustment(a), 0);
  const totalValueImpact = adjustments.reduce((s, a) => s + Math.abs(valueImpactForAdjustment(a)), 0);

  const hasFilters = typeFilter || statusFilter || search || (dateStart && dateEnd);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Adjustments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record and manage inventory quantity adjustments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
            <Icon d={icons.download} size={15} /> Export
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
            <Icon d={icons.plus} size={15} /> New Adjustment
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          <AlertCircle size={15} /> {error}
          <button onClick={reload} className="ml-auto underline font-medium">Retry</button>
        </div>
      )}
      {actionError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          <AlertCircle size={15} /> {actionError}
        </div>
      )}

      {/* Stats — computed from the currently-loaded page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Adjustments" value={adjustments.length} sub="All time" subColor="text-gray-400" icon={icons.adjustment} bg="bg-blue-50 text-blue-500" loading={loading} />
        <StatCard label="Total Increases" value={increases.length} sub={`+${totalIncQty.toLocaleString()} units`} subColor="text-green-600" icon={icons.arrowUp} bg="bg-green-50 text-green-500" loading={loading} />
        <StatCard label="Total Decreases" value={decreases.length} sub={`-${totalDecQty.toLocaleString()} units`} subColor="text-red-500" icon={icons.arrowDown} bg="bg-red-50 text-red-500" loading={loading} />
        <StatCard label="Total Value Impact" value={`₦${totalValueImpact.toLocaleString()}`} sub="All time" subColor="text-gray-400" icon={icons.dollar} bg="bg-purple-50 text-purple-500" loading={loading} />
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl mb-4 p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] sm:max-w-xs">
          <Icon d={icons.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, reason, or location..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <DateRangeFilter start={dateStart} end={dateEnd} onChange={setDateRange} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
          <option value="set_stock">Set Stock</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="flex items-center gap-3 sm:ml-auto">
          {hasFilters && (
            <button onClick={() => { setTypeFilter(""); setStatusFilter(""); setSearch(""); setDateRange(null, null); }} className="text-sm text-red-500 hover:underline whitespace-nowrap">
              Clear filters
            </button>
          )}
          <button type="button" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
            <Icon d={icons.filter} size={14} /> More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Adjustment No.", "Date & Time", "Item", "Adjustment Type", "Location", "Quantity Change", "Value Impact (₦)", "Reason", "Adjusted By", "Status", ""].map((h) => (
                  <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={11} className="py-10 text-center text-sm text-gray-400">Loading adjustments…</td></tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-14 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Icon d={icons.inbox} size={18} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {adjustments.length === 0 ? "No adjustments yet" : "No adjustments match your filters"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {adjustments.length === 0 && "Create one to get started."}
                    </p>
                  </td>
                </tr>
              )}

              {!loading && filtered.map((a) => {
                const type = getAdjType(a);
                const status = getStatus(a);
                const qtyChange = signedQtyForAdjustment(a);
                const valueImpact = valueImpactForAdjustment(a);
                const count = getItemCount(a);
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-sm font-medium text-blue-600 whitespace-nowrap">{getReference(a)}</td>
                    <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(getDate(a))}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <Icon d={icons.box} size={14} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{getFirstItemName(a)}</p>
                          {count > 1 && <p className="text-xs text-gray-400">+{count - 1} more item{count - 1 > 1 ? "s" : ""}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${TYPE_BADGE_CLASS[type] || "bg-gray-100 text-gray-600"}`}>
                        {TYPE_LABELS[type] || type || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">
                      {getLocationName(a)}
                      <span className="block text-xs text-gray-400">{getWarehouseName(a)}</span>
                    </td>
                    <td className={`py-3 px-3 text-sm font-bold whitespace-nowrap ${qtyChange > 0 ? "text-green-600" : qtyChange < 0 ? "text-red-500" : "text-gray-700"}`}>
                      {qtyChange > 0 ? "+" : ""}{qtyChange.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {valueImpact > 0 ? "+" : valueImpact < 0 ? "-" : ""}₦{Math.abs(valueImpact).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 max-w-[160px]">
                      <span className="truncate block" title={getReason(a)}>{getReason(a)}</span>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{getAdjustedByName(a)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE_CLASS[status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RowMenu
                        adjustment={a}
                        onSubmit={() => handleAction(submitAdjustment, a.id)}
                        onApprove={() => handleApprove(a.id)}
                        onReject={() => handleReject(a.id)}
                        onCancel={() => handleCancel(a.id)}
                        onDelete={() => handleDelete(a.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500 text-center sm:text-left">Page {page}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <NewAdjustmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); reload(); showToast("Adjustment created as a draft"); }}
        allItems={formData.items}
        itemsLoading={formData.itemsLoading}
        itemsError={formData.itemsError}
        users={formData.users}
        usersLoading={formData.usersLoading}
        locations={formData.locations}
        locationsLoading={formData.locationsLoading}
        locationsError={formData.locationsError}
      />

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm shadow-lg z-50 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}