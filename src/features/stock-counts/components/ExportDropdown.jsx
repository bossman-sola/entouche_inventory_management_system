import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Filter as FilterIcon,
} from "lucide-react";
import useClickOutside from "../../../lib/useClickOutside.js";

export function ExportDropdown({ onExport }) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("xlsx");
  const [selectedScope, setSelectedScope] = useState("current");
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
              type="button"
              onClick={() => setSelectedFormat(f.id)}
              className={
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 " +
                (selectedFormat === f.id
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-700")
              }
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
              type="button"
              onClick={() => {
                setSelectedScope(s.id);
                onExport({ format: selectedFormat, scope: s.id });
                setOpen(false);
              }}
              className={
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 " +
                (selectedScope === s.id
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-700")
              }
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
