import React, { useRef, useState, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Eye,
  Pencil,
  PlayCircle,
  Check,
  Trash2,
  XCircle,
  Copy,
  FileDown,
  Printer,
  RotateCcw,
} from "lucide-react";
import { cx } from "./utils.js";

const MENU_WIDTH = 208; // matches w-52
const VIEWPORT_MARGIN = 8;

export function RowActionsMenu({
  row,
  anchorEl,
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
  onClose,
}) {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, ready: false });

  const place = useCallback(() => {
    if (!anchorEl) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 260;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = anchorRect.right - MENU_WIDTH;
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, viewportW - MENU_WIDTH - VIEWPORT_MARGIN),
    );

    let top = anchorRect.bottom + 4;
    if (top + menuHeight > viewportH - VIEWPORT_MARGIN) {
      const above = anchorRect.top - menuHeight - 4;
      top =
        above > VIEWPORT_MARGIN
          ? above
          : Math.max(VIEWPORT_MARGIN, viewportH - menuHeight - VIEWPORT_MARGIN);
    }

    setCoords({ top, left, ready: true });
  }, [anchorEl]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useLayoutEffect(() => {
    if (!anchorEl) return;
    const handleReposition = () => place();
    const handleScroll = () => onClose();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const handlePointerDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (anchorEl.contains(e.target)) return;
      onClose();
    };

    window.addEventListener("resize", handleReposition);
    // Any ancestor scrolling (table container, page, etc.) closes the menu
    // rather than letting it drift out of sync with its anchor.
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [anchorEl, onClose, place]);

  if (!anchorEl) return null;

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
  switch (row.rawStatus) {
    case "draft":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Pencil, "Edit", onEdit)}
          {item(PlayCircle, "Continue Count", onContinue)}
          {item(Check, "Submit for Review", onSubmit)}
          {item(Trash2, "Delete", onDelete, true)}
        </>
      );
      break;
    case "in_progress":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(PlayCircle, "Continue Count", onContinue)}
          {item(Check, "Submit for Review", onSubmit)}
          {item(XCircle, "Cancel", onCancel, true)}
        </>
      );
      break;
    case "completed":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Check, "Approve", onApprove)}
          {item(XCircle, "Reject", onReject, true)}
          {item(RotateCcw, "Request Recount", onRequestRecount)}
          {item(Printer, "Print Count Sheet", onPrint)}
          {item(XCircle, "Cancel", onCancel, true)}
        </>
      );
      break;
    case "approved":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Printer, "Print", onPrint)}
          {item(Copy, "Duplicate", onDuplicate)}
          {item(FileDown, "Export (xlsx)", onExportPdf)}
        </>
      );
      break;
    case "cancelled":
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Copy, "Duplicate", onDuplicate)}
        </>
      );
      break;
    default:
      content = (
        <>
          {item(Eye, "View", onView)}
          {item(Printer, "Print", onPrint)}
          {item(Copy, "Duplicate", onDuplicate)}
        </>
      );
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: MENU_WIDTH,
        visibility: coords.ready ? "visible" : "hidden",
      }}
      className="z-50 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
    >
      {content}
    </div>,
    document.body,
  );
}
