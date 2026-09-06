import {
  Pencil,
  Copy,
  XCircle,
  Trash2,
  UserRound,
  RotateCcw,
  Ban,
} from "lucide-react";

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        flex items-center gap-2.5
        px-3.5 py-2.5
        text-left
        text-[12.5px]
        transition-colors
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : "text-slate-700 hover:bg-slate-50"
        }
      `}
    >
      <Icon size={15} />

      <span>{label}</span>
    </button>
  );
};

export function RowActionsMenu({
  row,
  onClose,

  onEdit,
  onDuplicate,
  onCancel,
  onDelete,
  onViewAssignment,
  onRequestRecount,
  onReject,
}) {
  if (!row) return null;

  const rawStatus = String(
    row.rawStatus ??
      row.status ??
      ""
  )
    .toLowerCase()
    .replace(/\s+/g, "_");

  const handleAction = (callback) => {
    onClose?.();

    callback?.(row);
  };

  return (
    <div
      className="
        absolute
        right-0
        top-full
        mt-1.5
        z-50
        w-[205px]
        overflow-hidden
        rounded-xl
        border border-gray-200
        bg-white
        py-1.5
        shadow-[0_10px_30px_rgba(15,23,42,0.12)]
      "
    >
      {/* Draft */}
      {rawStatus === "draft" && (
        <>
          <MenuItem
            icon={Pencil}
            label="Edit Stock Count"
            onClick={() =>
              handleAction(onEdit)
            }
          />

          <MenuItem
            icon={Copy}
            label="Duplicate"
            onClick={() =>
              handleAction(onDuplicate)
            }
          />

          <div className="my-1 border-t border-gray-100" />

          <MenuItem
            icon={XCircle}
            label="Cancel"
            danger
            onClick={() =>
              handleAction(onCancel)
            }
          />

          <MenuItem
            icon={Trash2}
            label="Delete Draft"
            danger
            onClick={() =>
              handleAction(onDelete)
            }
          />
        </>
      )}

      {/* Requested */}
      {rawStatus === "requested" && (
        <>
          <MenuItem
            icon={UserRound}
            label="View Assignment"
            onClick={() =>
              handleAction(onViewAssignment)
            }
          />

          <div className="my-1 border-t border-gray-100" />

          <MenuItem
            icon={XCircle}
            label="Cancel Stock Count"
            danger
            onClick={() =>
              handleAction(onCancel)
            }
          />
        </>
      )}

      {/* In Progress */}
      {rawStatus === "in_progress" && (
        <MenuItem
          icon={XCircle}
          label="Cancel Stock Count"
          danger
          onClick={() =>
            handleAction(onCancel)
          }
        />
      )}

      {/* Pending Review */}
      {rawStatus === "pending_review" && (
        <>
          <MenuItem
            icon={RotateCcw}
            label="Request Recount"
            onClick={() =>
              handleAction(onRequestRecount)
            }
          />

          <MenuItem
            icon={Ban}
            label="Reject Count"
            danger
            onClick={() =>
              handleAction(onReject)
            }
          />
        </>
      )}

      {/* Completed */}
      {rawStatus === "completed" && (
        <MenuItem
          icon={Copy}
          label="Duplicate Stock Count"
          onClick={() =>
            handleAction(onDuplicate)
          }
        />
      )}

      {/* Cancelled */}
      {rawStatus === "cancelled" && (
        <MenuItem
          icon={Copy}
          label="Duplicate Stock Count"
          onClick={() =>
            handleAction(onDuplicate)
          }
        />
      )}
    </div>
  );
}