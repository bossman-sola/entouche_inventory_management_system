import React, { useRef } from "react";
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
import useClickOutside from "../../../lib/useClickOutside.js";
import { cx } from "./utils.js";

export function RowActionsMenu({
  row,
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

  return (
    <div
      ref={ref}
      className="absolute right-8 top-0 z-20 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
    >
      {content}
    </div>
  );
}
