import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Icon, icons } from "./icons.jsx";
import { Spinner, StatusBadge } from "./ui.jsx";

const firstItemName = (t) => t.items?.[0]?.item?.name ?? t.items?.[0]?.item_name ?? "—";
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

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, "…", total];
  if (current >= total - 3) return [1, "…", total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

const MENU_WIDTH = 224; 
const MENU_MAX_HEIGHT = 260;

function RowActionsMenu({ anchorRef, onClose, children }) {
  const menuRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < MENU_MAX_HEIGHT && spaceAbove > spaceBelow;

    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8
    );

    setStyle({
      position: "fixed",
      left,
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
      width: MENU_WIDTH,
      maxHeight: MENU_MAX_HEIGHT,
      opacity: 1,
    });
  }, [anchorRef]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        style={style}
        className="z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 overflow-y-auto"
      >
        {children}
      </div>
    </>,
    document.body
  );
}

export default function TransferTable({
  visible, filteredCount, page, pages, perPage, setPage, setPerPage,
  loading,
  onSelectTransfer,
  onSubmit, onApprove, onReject, onComplete, onCancel, onDelete,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const buttonRefs = useRef({});

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
              {["Transfer ID", "Date & Time", "Item", "From Location", "To Location", "Quantity", "Requested By", "Status", "Actions"].map(h => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>{Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-28" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-14" /></td>
                    <td className="py-3 px-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                    <td className="py-3 px-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
                  </tr>
                ))}</>
            ) : visible.length === 0 ? (
              <tr><td colSpan={9} className="py-12 px-4 text-center text-sm text-gray-400">No transfers yet - create one to see it here.</td></tr>
            ) : visible.map(t => {
              const available = actionsFor(t.status);
              const count = itemCount(t);
              if (!buttonRefs.current[t.id]) buttonRefs.current[t.id] = { current: null };
              return (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectTransfer?.(t)}
                      className="text-blue-600 hover:underline"
                    >
                      {t.transfer_number ?? `TRF-${t.id}`}
                    </button>
                  </td>
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
                      <button
                        ref={buttonRefs.current[t.id]}
                        onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                      >
                        <Icon d={icons.dotsV} size={16} fill="currentColor" stroke="none" />
                      </button>
                    )}
                    {openMenuId === t.id && (
                      <RowActionsMenu anchorRef={buttonRefs.current[t.id]} onClose={() => setOpenMenuId(null)}>
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
                      </RowActionsMenu>
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
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">‹</button>
            {pageList(page, pages).map((n, i) => n === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">…</span>
            ) : (
              <button key={n} onClick={() => setPage(n)} className={`w-7 h-7 text-sm rounded ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40">›</button>
          </div>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
