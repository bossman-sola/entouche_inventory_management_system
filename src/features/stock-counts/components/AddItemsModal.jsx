import React, { useState, useEffect } from "react";
import { Search, X, Plus, Check } from "lucide-react";
import { cx } from "./utils.js";

export function AddItemsModal({ open, onClose, onSearch, results, onAdd, addedIds }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setQ("");
      onSearch("");
    }
    
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-24"
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Add Items
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="relative mt-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search catalog items by name or SKU..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {(results || []).map((r) => {
            const already = addedIds?.has(r.id);
            return (
              <button
                key={r.id}
                disabled={already}
                onClick={() => onAdd(r)}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                  already
                    ? "cursor-default text-gray-300"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <span>
                  {r.name}{" "}
                  <span className="text-gray-400">({r.sku})</span>
                </span>
                {already ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <Plus size={14} className="text-gray-400" />
                )}
              </button>
            );
          })}
          {q && (!results || results.length === 0) && (
            <p className="px-3 py-2 text-sm text-gray-400">No matches.</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
