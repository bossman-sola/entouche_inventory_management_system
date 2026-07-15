import { useState } from "react";
import { Icon, icons } from "./icons.jsx";
import { Spinner, StatusBadge } from "./ui.jsx";

// Field lookups are defensive (see the comment in hooks/useTransfers.js) -
// adjust the `t.foo ?? t.bar ?? "-"` chains below once you can confirm the
// real GET /transfers response shape.
const firstItemName = (t) => t.items?.[0]?.item?.name ?? t.items?.[0]?.item_name ?? "-";
const itemCount = (t) => t.items?.length ?? 0;
const totalQty = (t) => (t.items || []).reduce((s, r) => s + (Number(r.quantity) || 0), 0);
const locationLabel = (loc) => loc ? `${loc.warehouse?.name ?? ""}${loc.warehouse?.name ? " - " : ""}${loc.name ?? ""}` : "-";
const requestedByLabel = (t) => t.creator?.name ?? t.created_by_user?.name ?? t.requested_by_name ?? "-";
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
const formatTime = (d) => d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

function actionsFor(status) {
  switch (status) {
    case "draft": return ["submit", "cancel", "delete"];
    case "pending_approval": return ["approve", "reject", "cancel"];
    case "approved": return ["complete", "cancel"];
    default: return [];
  }
}

const ACTION_META = {
  submit: { label: "Submit for Approval", icon: icons.send, className: "text-blue-600 hover:bg-blue-50" },
  approve: { label: "Approve", icon: icons.check, className: "text-green-600 hover:bg-green-50" },
  reject: { label: "Reject", icon: icons.ban, className: "text-red-500 hover:bg-red-50" },
  complete: { label: "Complete (moves stock)", icon: icons.check, className: "text-green-600 hover:bg-green-50" },
  cancel: { label: "Cancel", icon: icons.x, className: "text-red-500 hover:bg-red-50" },
  delete: { label: "Delete Draft", icon: icons.trash, className: "text-red-500 hover:bg-red-50" },
};

export default function TransferTable({
  visible, filteredCount, page, pages, perPage, setPage,
  loading,
  onSubmit, onApprove, onReject, onComplete, onCancel, onDelete,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const runAction = async (action, transfer) => {
    setOpenMenuId(null);
    setBusyId(transfer.id);
    try {
      if (action === "submit") await onSubmit(transfer.id);
      else if (action === "approve") await onApprove(transfer.id);
      else if (action === "complete") await onComplete(transfer.id);
      else if (action === "cancel") await onCancel(transfer.id);
      else if (action === "delete") await onDelete(transfer.id);
      else if (action === "reject") {
        const reason = window.prompt("Reason for rejecting this transfer?");
        if (reason === null) return;
        await onReject(transfer.id, reason);
      }
    } catch (err) {
      window.alert(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Transfer ID", "Date", "Item", "From Location", "To Location", "Quantity", "Requested By", "Status", "Actions"].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="py-12 px-4 text-center text-sm text-gray-400"><Spinner size={16} className="inline mr-2" /> Loading transfers…</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={9} className="py-12 px-4 text-center text-sm text-gray-400">No transfers yet - create one to see it here.</td></tr>
            ) : visible.map(t => {
              const available = actionsFor(t.status);
              const count = itemCount(t);
              return (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline whitespace-nowrap">{t.transfer_number ?? `TRF-${t.id}`}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-sm text-gray-800">{formatDate(t.transfer_date)}</p>
                    {t.created_at && <p className="text-xs text-gray-400">{formatTime(t.created_at)}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon d={icons.box} size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{firstItemName(t)}</p>
                        {count > 1 && <p className="text-xs text-gray-400">+{count - 1} more item{count - 1 > 1 ? "s" : ""}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{locationLabel(t.from_location)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{locationLabel(t.to_location)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{totalQty(t)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{requestedByLabel(t)}</td>
                  <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-4 relative">
                    {busyId === t.id ? (
                      <Spinner size={15} className="text-gray-400" />
                    ) : (
                      <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
                        <Icon d={icons.dotsV} size={16} fill="currentColor" stroke="none" />
                      </button>
                    )}
                    {openMenuId === t.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-56">
                          {available.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-gray-400">No actions available</p>
                          ) : available.map(action => {
                            const meta = ACTION_META[action];
                            return (
                              <button
                                key={action}
                                onClick={() => runAction(action, t)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${meta.className}`}
                              >
                                <Icon d={meta.icon} size={14} /> {meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-500 text-center sm:text-left">
          Showing {filteredCount === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filteredCount)} of {filteredCount} transfers
        </p>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
          {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">›</button>
        </div>
      </div>
    </div>
  );
}