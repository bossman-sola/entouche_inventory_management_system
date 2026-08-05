import { useState } from "react";
import { Icon, icons } from "./icons.jsx";
import { Spinner } from "./ui.jsx";

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  in_transit: "In Transit",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-700 border-gray-200";
  const label = STATUS_LABELS[status] || status || "Unknown";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatQuantity(value) {
  const n = Number(value);
  if (isNaN(n)) return value ?? "—";
  return n % 1 === 0 ? String(n) : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default function TransferDetailsModal({
  open,
  onClose,
  transfer,
  currentUserCanApprove = true,
  onSubmit,
  onApprove,
  onReject,
  onComplete,
  onCancel,
  onDelete,
}) {
  const [actionLoading, setActionLoading] = useState(null); // e.g. "submit" | "approve" | ...
  const [error, setError] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!open || !transfer) return null;

  const items = transfer.items || [];
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const status = transfer.status;

  const runAction = async (key, fn, ...args) => {
    if (!fn) return;
    setError("");
    setActionLoading(key);
    try {
      await fn(transfer.id, ...args);
      if (key === "delete") onClose();
      if (key === "reject") setShowRejectInput(false);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {transfer.transfer_number ?? `TRF-${transfer.id}`}
              </h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Created {formatDateTime(transfer.created_at)}
              {transfer.created_by_user?.name ? ` by ${transfer.created_by_user.name}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <Icon d={icons.x ?? icons.close} size={16} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <Icon d={icons.alert} size={13} /> {error}
            </div>
          )}

          {/* Section 1: Details */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900">Transfer Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Transfer Date</div>
              <div className="text-sm text-gray-900">
                {formatDateTime(transfer.transfer_date || transfer.created_at)}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Reference Number</div>
              <div className="text-sm text-gray-900">{transfer.reference_number || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Requested By</div>
              <div className="text-sm text-gray-900">
                {transfer.requested_by_user?.name || transfer.requested_by?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">From Location</div>
              <div className="text-sm text-gray-900 flex items-center gap-1.5">
                <Icon d={icons?.mapPin ?? icons.location} size={13} className="text-gray-400" />
                {transfer.from_location?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">To Location</div>
              <div className="text-sm text-gray-900 flex items-center gap-1.5">
                <Icon d={icons.mapPin ?? icons.location} size={13} className="text-gray-400" />
                {transfer.to_location?.name || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Notes</div>
              <div className="text-sm text-gray-900">{transfer.notes || "—"}</div>
            </div>
          </div>

          {/* Section 2: Items */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900">Items</h3>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
                <tr>
                  <th className="text-left px-4 py-2.5 w-10">#</th>
                  <th className="text-left px-4 py-2.5">Item</th>
                  <th className="text-left px-4 py-2.5">SKU</th>
                  <th className="text-left px-4 py-2.5">Unit</th>
                  <th className="text-right px-4 py-2.5">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">
                      No items on this transfer.
                    </td>
                  </tr>
                )}
                {items.map((row, idx) => (
                  <tr key={row.id ?? idx}>
                    <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      {row.item?.name ?? row.item_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{row.item?.sku ?? row.sku ?? "—"}</td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {row.unit_of_measure?.abbreviation ?? row.unit ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                      {formatQuantity(row.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-6 text-sm text-gray-600 mb-2">
            <div>
              Total Items: <span className="font-bold text-gray-900">{totalItems}</span>
            </div>
            <div>
              Total Quantity: <span className="font-bold text-gray-900">{formatQuantity(totalQuantity)}</span>
            </div>
          </div>

          {showRejectInput && (
            <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-4">
              <label className="text-xs font-semibold text-red-700 mb-1.5 block">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                className="w-full text-sm rounded-lg border border-red-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Let the requester know why this transfer was rejected"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-white rounded-lg border border-transparent"
                >
                  Cancel
                </button>
                <button
                  disabled={actionLoading === "reject"}
                  onClick={() => runAction("reject", onReject, rejectReason)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60 flex items-center gap-1.5"
                >
                  {actionLoading === "reject" && <Spinner size={12} />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div>
            {status === "draft" && onDelete && (
              <button
                disabled={actionLoading === "delete"}
                onClick={() => runAction("delete", onDelete)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
              >
                {actionLoading === "delete" && <Spinner size={13} />}
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50"
            >
              Close
            </button>

            {status === "draft" && onSubmit && (
              <button
                disabled={actionLoading === "submit"}
                onClick={() => runAction("submit", onSubmit)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
              >
                {actionLoading === "submit" && <Spinner size={13} />}
                Submit for Approval
              </button>
            )}

            {status === "pending_approval" && currentUserCanApprove && (
              <>
                {onReject && !showRejectInput && (
                  <button
                    disabled={!!actionLoading}
                    onClick={() => setShowRejectInput(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                )}
                {onApprove && (
                  <button
                    disabled={actionLoading === "approve"}
                    onClick={() => runAction("approve", onApprove)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
                  >
                    {actionLoading === "approve" && <Spinner size={13} />}
                    Approve
                  </button>
                )}
              </>
            )}

            {status === "approved" && (
              <>
                {onCancel && (
                  <button
                    disabled={actionLoading === "cancel"}
                    onClick={() => runAction("cancel", onCancel)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
                  >
                    {actionLoading === "cancel" && <Spinner size={13} />}
                    Cancel Transfer
                  </button>
                )}
                {onComplete && (
                  <button
                    disabled={actionLoading === "complete"}
                    onClick={() => runAction("complete", onComplete)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-60"
                  >
                    {actionLoading === "complete" && <Spinner size={13} />}
                    Mark Completed
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}