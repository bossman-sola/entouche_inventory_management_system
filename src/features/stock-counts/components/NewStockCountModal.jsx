import React, { useState, useEffect } from "react";
import { FileText, X, Check, Plus, Info } from "lucide-react";
import { COUNT_TYPES } from "./constants.js";
import { LabeledSelect } from "./LabeledSelect.jsx";

export function NewStockCountModal({
  open,
  onClose,
  lookups,
  initialForm,
  onSave,
  isEditing,
}) {
  const [form, setForm] = useState({
    warehouse: "",
    location: "",
    countType: "",
    priority: "Medium",
    scheduledDate: "",
    startTime: "",
    assignedCounter: "",
    notes: "",
  });

  useEffect(() => {
    if (open)
      setForm({
        warehouse: initialForm?.warehouse || "",
        location: initialForm?.location || "",
        countType: initialForm?.countType || "",
        priority: initialForm?.priority || "Medium",
        scheduledDate: initialForm?.scheduledDate || "",
        startTime: initialForm?.startTime || "",
        assignedCounter: initialForm?.assignedCounter || "",
        notes: initialForm?.notes || "",
      });
  }, [open, initialForm]);

  if (!open) return null;
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const warehouses = lookups?.warehouses || [];
  const locations = (lookups?.locations || []).filter(
    (option) =>
      !form.warehouse || String(option.warehouseId) === String(form.warehouse),
  );
  const users = lookups?.users || [];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-[640px] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={19} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                {isEditing ? "Edit Stock Count" : "New Stock Count"}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Update the details for this stock count."
                  : "Create a new stock count to record physical inventory."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-sm font-semibold text-gray-900">
            Count Information
          </p>

          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect
              label="Warehouse"
              required
              placeholder="Select warehouse"
              value={form.warehouse}
              onChange={set("warehouse")}
              options={warehouses}
            />
            <LabeledSelect
              label="Location"
              placeholder="Select location"
              hint="Specific area or zone for this count (optional)."
              value={form.location}
              onChange={set("location")}
              options={locations}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LabeledSelect
              label="Count Type"
              required
              placeholder="Select count type"
              hint="Choose the type of stock count you want to perform."
              value={form.countType}
              onChange={set("countType")}
              options={COUNT_TYPES}
            />
            <LabeledSelect
              label="Priority"
              placeholder="Select priority"
              hint="Set the priority level for this count."
              value={form.priority}
              onChange={set("priority")}
              options={["Low", "Medium", "High"]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => set("scheduledDate")(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime")(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <LabeledSelect
            label="Assigned Counter"
            required
            placeholder="Select user"
            hint="Person responsible for conducting this count."
            value={form.assignedCounter}
            onChange={set("assignedCounter")}
            options={users}
          />

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-gray-900">Notes</p>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              maxLength={500}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Add any additional notes or instructions for this stock count..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {form.notes.length} / 500
            </p>
          </div>

          {!isEditing && (
            <div className="flex gap-3 rounded-lg bg-blue-50 px-4 py-3">
              <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-sm text-blue-700">
                <span className="font-semibold">What happens next?</span>
                <br />
                After creating the stock count, you can add items and begin
                the counting process.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isEditing ? (
              <>
                <Check size={15} /> Save Changes
              </>
            ) : (
              <>
                <Plus size={15} /> Create Stock Count
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
