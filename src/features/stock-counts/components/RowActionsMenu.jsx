import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Pencil,
  Copy,
  XCircle,
  Trash2,
  UserRound,
  RotateCcw,
  Ban,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
   ACTION CONFIG
========================================================= */

const STATUS_ACTIONS = {
  draft: [
    {
      key: "edit",
      label: "Edit Stock Count",
      icon: Pencil,
    },
    {
      key: "duplicate",
      label: "Duplicate",
      icon: Copy,
    },
    {
      key: "cancel",
      label: "Cancel",
      icon: XCircle,
      danger: true,
      divider: true,
    },
    {
      key: "delete",
      label: "Delete Draft",
      icon: Trash2,
      danger: true,
    },
  ],

  requested: [
    {
      key: "view_assignment",
      label: "View Assignment",
      icon: UserRound,
    },
    {
      key: "cancel",
      label: "Cancel Stock Count",
      icon: XCircle,
      danger: true,
      divider: true,
    },
  ],

  "in progress": [
    {
      key: "cancel",
      label: "Cancel Stock Count",
      icon: XCircle,
      danger: true,
    },
  ],

  submitted: [
    {
      key: "request_recount",
      label: "Request Recount",
      icon: RotateCcw,
    },
    {
      key: "reject",
      label: "Reject Count",
      icon: Ban,
      danger: true,
    },
  ],

  "pending review": [
    {
      key: "approve",
      label: "Approve Count",
      icon: CheckCircle2,
      className: "text-green-600",
    },
    {
      key: "request_recount",
      label: "Request Recount",
      icon: RotateCcw,
    },
    {
      key: "reject",
      label: "Reject Count",
      icon: Ban,
      danger: true,
    },
  ],

  completed: [
    {
      key: "duplicate",
      label: "Duplicate Stock Count",
      icon: Copy,
    },
  ],

  cancelled: [
    {
      key: "duplicate",
      label: "Duplicate Stock Count",
      icon: Copy,
    },
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
  className = "",
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-2.5
        px-3.5
        py-2.5
        text-left
        text-[12.5px]
        font-medium
        transition-colors
        ${
          danger
            ? "text-red-600 hover:bg-red-50"
            : "text-slate-700 hover:bg-slate-50"
        }
        ${className}
      `}
    >
      <Icon size={15} strokeWidth={1.8} />

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   ROW ACTIONS MENU
========================================================= */

export function RowActionsMenu({
  row,
  anchorRect,
  onClose,

  // Generic table action handler
  onAction,

  // Details-page handlers
  onView,
  onEdit,
  onContinue,
  onDelete,
  onPrint,
  onDuplicate,
  onSubmit,
  onCancel,
  onApprove,
  onReject,
  onRequestRecount,
  onExportPdf,
}) {
  const menuRef = useRef(null);

  const normalizedStatus = normalizeStatus(
    row?.rawStatus ?? row?.status ?? "",
  );

  const actions =
    STATUS_ACTIONS[normalizedStatus] ?? [];

  /* =======================================================
     CLICK OUTSIDE / ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose]);

  if (!row || actions.length === 0) {
    return null;
  }

  /* =======================================================
     ACTION ROUTER
  ======================================================= */

  const runAction = (actionKey) => {
    /*
     * Table implementation
     */
    if (onAction) {
      onClose?.();
      onAction(actionKey, row);
      return;
    }

    /*
     * StockCountDetails implementation
     */
    switch (actionKey) {
      case "view":
        onView?.(row);
        break;

      case "edit":
        onEdit?.(row);
        break;

      case "continue":
        onContinue?.(row);
        break;

      case "duplicate":
        onDuplicate?.(row);
        break;

      case "submit":
        onSubmit?.(row);
        break;

      case "cancel":
        onCancel?.(row);
        break;

      case "delete":
        onDelete?.(row);
        break;

      case "approve":
        onApprove?.(row);
        break;

      case "view_assignment":
        if (onView) {
          onView(row);
        } else {
          onContinue?.(row);
        }
        break;

      case "request_recount":
        onRequestRecount?.(row);
        break;

      case "reject":
        onReject?.(row);
        break;

      case "print":
        onPrint?.(row);
        break;

      case "export_pdf":
        onExportPdf?.(row);
        break;

      default:
        console.warn(
          "Unhandled stock count menu action:",
          actionKey,
        );
    }

    onClose?.();
  };

  /* =======================================================
     MENU CONTENT
  ======================================================= */

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      className="
        w-[220px]
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        py-1.5
        shadow-[0_12px_35px_rgba(15,23,42,0.16)]
      "
    >
      {actions.map((action) => (
        <div key={action.key}>
          {action.divider && (
            <div className="my-1 border-t border-slate-100" />
          )}

          <MenuItem
            icon={action.icon}
            label={action.label}
            danger={action.danger}
            className={action.className}
            onClick={() =>
              runAction(action.key)
            }
          />
        </div>
      ))}
    </div>
  );

  /* =======================================================
     TABLE MODE
     Uses portal + anchorRect
  ======================================================= */

  if (anchorRect) {
    const menuWidth = 220;
    const viewportPadding = 12;

    const left = Math.min(
      Math.max(
        anchorRect.right - menuWidth,
        viewportPadding,
      ),
      window.innerWidth -
        menuWidth -
        viewportPadding,
    );

    const estimatedHeight =
      actions.length * 42 + 16;

    const spaceBelow =
      window.innerHeight -
      anchorRect.bottom -
      viewportPadding;

    const openAbove =
      spaceBelow < estimatedHeight;

    const top = openAbove
      ? Math.max(
          viewportPadding,
          anchorRect.top -
            estimatedHeight -
            6,
        )
      : anchorRect.bottom + 6;

    return createPortal(
      <div
        className="fixed z-[100]"
        style={{
          left,
          top,
        }}
      >
        {menu}
      </div>,
      document.body,
    );
  }

  /* =======================================================
     DETAILS MODE
     Dropdown under "More Actions"
  ======================================================= */

  return (
    <div
      className="
        absolute
        right-0
        top-full
        z-50
        mt-2
      "
    >
      {menu}
    </div>
  );
}