import { useState, useEffect, useMemo, useRef } from "react";
import { Icon, icons } from "./icons.jsx";
import { Select, Spinner } from "./ui.jsx";

function emptyLine() {
  return {
    key: Math.random().toString(36).slice(2),
    item_id: "",
    quantity: "",
  };
}

function ItemPicker({ items, loading, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = items.find((i) => String(i.id) === String(value));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? items.filter(
          (i) =>
            (i.name || "").toLowerCase().includes(q) ||
            (i.sku || "").toLowerCase().includes(q),
        )
      : items;
    return pool.slice(0, 50);
  }, [items, query]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected
            ? `${selected.name}${selected.sku ? ` (${selected.sku})` : ""}`
            : loading
              ? "Loading items..."
              : "Select item"}
        </span>
        <Icon
          d={icons.chevronDown}
          size={13}
          className="text-gray-400 shrink-0"
        />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="relative border-b border-gray-100">
            <Icon
              d={icons.search}
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-sm text-gray-400 flex items-center gap-2">
                <Spinner size={13} /> Loading catalog...
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">No items match.</p>
            ) : (
              results.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => {
                    onChange(i.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  <span className="text-gray-800">{i.name}</span>
                  <span className="text-gray-400 text-xs">{i.sku ?? ""}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewTransferModal({
  open,
  onClose,
  onSave,
  locations,
  locationsLoading,
  locationsError,
  items = [],
  itemsLoading = false,
}) {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null); // "draft" | "submit" | null

  useEffect(() => {
    if (open) {
      setFromLocation("");
      setToLocation("");
      setTransferDate("");
      setNotes("");
      setLines([emptyLine()]);
      setError("");
      setSaving(null);
    }
  }, [open]);

  if (!open) return null;

  const locationOptions = locations.map((l) => ({
    value: String(l.id),
    label: `${l.warehouseName ?? ""}${l.warehouseName ? " - " : ""}${l.name}`,
  }));

  const updateLine = (key, patch) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key) =>
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls));
  const addLine = () => setLines((ls) => [...ls, emptyLine()]);

  const selectedItemIds = new Set(
    lines
      .map((l) => l.item_id)
      .filter(Boolean)
      .map(String),
  );

  const buildPayload = () => {
    if (!fromLocation || !toLocation) {
      return { error: "Select both a from and to location." };
    }
    if (fromLocation === toLocation) {
      return { error: "From and to locations must be different." };
    }
    const validLines = lines.filter((l) => l.item_id && Number(l.quantity) > 0);
    if (validLines.length === 0) {
      return { error: "Add at least one item with a quantity greater than 0." };
    }

    const fromLoc = locations.find((l) => String(l.id) === fromLocation);
    const toLoc = locations.find((l) => String(l.id) === toLocation);

    return {
      payload: {
        from_location_id: Number(fromLocation),
        to_location_id: Number(toLocation),
        from_warehouse_id: fromLoc?.warehouseId,
        to_warehouse_id: toLoc?.warehouseId,
        transfer_date: transferDate || undefined,
        notes: notes || undefined,
        items: validLines.map((l) => ({
          item_id: Number(l.item_id),
          quantity: Number(l.quantity),
        })),
      },
    };
  };

  const handleSubmit = async (submit) => {
    const { payload, error: validationError } = buildPayload();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(submit ? "submit" : "draft");
    try {
      await onSave(payload, { submit });
      onClose();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Transfer</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Move inventory items between two locations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <Icon d={icons.x} size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {(error || locationsError) && (
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <Icon d={icons.alert} size={13} /> {error || locationsError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Location <span className="text-red-500 ml-0.5">*</span>
              </label>
              <Select
                value={fromLocation}
                onChange={setFromLocation}
                options={locationOptions}
                placeholder={
                  locationsLoading ? "Loading locations..." : "Select location"
                }
                disabled={locationsLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Location <span className="text-red-500 ml-0.5">*</span>
              </label>
              <Select
                value={toLocation}
                onChange={setToLocation}
                options={locationOptions}
                placeholder={
                  locationsLoading ? "Loading locations..." : "Select location"
                }
                disabled={locationsLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Optional notes about this transfer..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Icon d={icons.plus} size={13} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line) => {
                const itemsForThisRow = items.filter(
                  (i) =>
                    String(i.id) === String(line.item_id) ||
                    !selectedItemIds.has(String(i.id)),
                );
                return (
                  <div key={line.key} className="flex items-start gap-2">
                    <div className="flex-1">
                      <ItemPicker
                        items={itemsForThisRow}
                        loading={itemsLoading}
                        value={line.item_id}
                        onChange={(id) => updateLine(line.key, { item_id: id })}
                      />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, { quantity: e.target.value })
                      }
                      placeholder="Qty"
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length === 1}
                      className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    >
                      <Icon d={icons.trash} size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!!saving}
            onClick={() => handleSubmit(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            {saving === "draft" && <Spinner size={13} />}
            Save as Draft
          </button>
          <button
            disabled={!!saving}
            onClick={() => handleSubmit(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
          >
            {saving === "submit" && <Spinner size={13} />}
            <Icon d={icons.send} size={13} />
            Save &amp; Submit
          </button>
        </div>
      </div>
    </div>
  );
}
