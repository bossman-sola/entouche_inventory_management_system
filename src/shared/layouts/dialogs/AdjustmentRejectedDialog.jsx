import React from "react";
import {
  XCircle,
  FileText,
} from "lucide-react";

import DialogShell from "./DialogShell";

import {
  InfoField,
  Pill,
  ItemCell,
  DialogButton,
} from "./primitives";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatQty = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
};

const roleLabel = (user) => {
  const role =
    user?.roles?.[0]?.name || "";

  if (!role) return "";

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );
};

const AdjustmentRejectedDialog = ({
  isOpen,
  onClose,
  adjustment = {},
  loading = false,
  rejectionReason,
  onViewDetails,
}) => {
  if (!isOpen) return null;

  const items =
    Array.isArray(adjustment.items)
      ? adjustment.items
      : [];

  const adjustedBy =
    adjustment.adjusted_by ||
    adjustment.adjustedBy ||
    null;

  const warehouse =
    adjustment.warehouse || null;

  const location =
    adjustment.location || null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={XCircle}
      iconBg="bg-red-100"
      iconFg="text-red-600"
      titleColor="text-red-600"
      title="Adjustment Rejected"
      subtitle="This inventory adjustment was reviewed and rejected."
      maxWidth="max-w-[760px]"
      footerLeft={
        <DialogButton onClick={onClose}>
          Close
        </DialogButton>
      }
      footerRight={
        <DialogButton
          icon={FileText}
          variant="outline"
          onClick={onViewDetails}
        >
          View Adjustment Details
        </DialogButton>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">
          Loading adjustment details...
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText
                size={18}
                className="text-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 flex-1">
              <InfoField
                label="Adjustment Number"
                value={
                  <span className="flex items-center gap-2">
                    {adjustment.adjustment_number ||
                      "—"}

                    <Pill tone="red">
                      Rejected
                    </Pill>
                  </span>
                }
              />

              <InfoField
                label="Adjustment Type"
                value={
                  adjustment.adjustment_type ===
                  "decrease"
                    ? "Decrease"
                    : adjustment.adjustment_type ===
                        "set_stock"
                      ? "Set Stock"
                      : "Increase"
                }
              />

              <InfoField
                label="Created On"
                value={formatDateTime(
                  adjustment.created_at
                )}
              />

              <InfoField
                label="Reason"
                value={
                  adjustment.reason || "—"
                }
              />

              <InfoField
                label="Submitted By"
                value={
                  <>
                    {adjustedBy?.name ||
                      "—"}

                    {roleLabel(
                      adjustedBy
                    ) && (
                      <span className="text-gray-400 font-medium">
                        {" "}
                        (
                        {roleLabel(
                          adjustedBy
                        )}
                        )
                      </span>
                    )}
                  </>
                }
              />

              <InfoField
                label="Warehouse"
                value={
                  warehouse?.name || "—"
                }
              />

              <InfoField
                label="Location"
                value={
                  location?.name || "—"
                }
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">
              Items ({items.length})
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                    <th className="text-left px-4 py-2.5">
                      Item
                    </th>

                    <th className="text-left px-4 py-2.5">
                      SKU
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Previous
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Proposed Change
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Expected
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-gray-400 py-8"
                      >
                        No items found on this adjustment.
                      </td>
                    </tr>
                  ) : (
                    items.map(
                      (row, index) => {
                        const item =
                          row.item || {};

                        const before =
                          Number(
                            row.quantity_before ||
                              0
                          );

                        const after =
                          Number(
                            row.quantity_after ||
                              0
                          );

                        const change =
                          after - before;

                        return (
                          <tr
                            key={
                              row.id ??
                              index
                            }
                            className="border-t border-gray-100"
                          >
                            <td className="px-4 py-3">
                              <ItemCell
                                image={
                                  item.image_path
                                }
                                name={
                                  item.name ||
                                  `Item #${row.item_id}`
                                }
                                sub={
                                  item.category?.name ||
                                  ""
                                }
                              />
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {item.sku ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {formatQty(
                                before
                              )}
                            </td>

                            <td
                              className={`px-4 py-3 font-bold ${
                                change < 0
                                  ? "text-red-500"
                                  : change > 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {change > 0
                                ? "+"
                                : ""}
                              {formatQty(
                                change
                              )}
                            </td>

                            <td className="px-4 py-3 font-bold text-[#1E2740]">
                              {formatQty(
                                after
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-4">
            <div className="text-[12.5px] font-semibold text-red-700 mb-1">
              Reason for Rejection
            </div>

            <div className="text-[13px] text-red-600">
              {rejectionReason ||
                adjustment.rejection_reason ||
                "No rejection reason provided."}
            </div>
          </div>

          <div className="mt-5 text-[12px] text-gray-500">
            This adjustment was not applied to inventory.
          </div>
        </>
      )}
    </DialogShell>
  );
};

export default AdjustmentRejectedDialog;