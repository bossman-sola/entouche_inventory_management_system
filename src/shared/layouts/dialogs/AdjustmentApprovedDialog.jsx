import React from "react";
import {
  CheckCircle2,
  FileText,
  Boxes,
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

const AdjustmentApprovedDialog = ({
  isOpen,
  onClose,
  adjustment = {},
  loading = false,
  onViewDetails,
  onViewInventory,
}) => {
  if (!isOpen) return null;

  const items = Array.isArray(
    adjustment.items
  )
    ? adjustment.items
    : [];

  const approvedBy =
    adjustment.approved_by ||
    adjustment.approvedBy ||
    null;

  const adjustedBy =
    adjustment.adjusted_by ||
    adjustment.adjustedBy ||
    null;

  const warehouse =
    adjustment.warehouse || null;

  const location =
    adjustment.location || null;

  const isDecrease =
    adjustment.adjustment_type ===
    "decrease";

  const isSetStock =
    adjustment.adjustment_type ===
    "set_stock";

  const totalChange =
    items.reduce((sum, row) => {
      const qty = Number(
        row.adjustment_quantity || 0
      );

      if (isSetStock) {
        const before = Number(
          row.quantity_before || 0
        );

        const after = Number(
          row.quantity_after || 0
        );

        return sum + (after - before);
      }

      if (isDecrease) {
        return sum - Math.abs(qty);
      }

      return sum + Math.abs(qty);
    }, 0);

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={CheckCircle2}
      iconBg="bg-green-100"
      iconFg="text-green-600"
      titleColor="text-green-600"
      title="Adjustment Approved"
      subtitle="The adjustment has been approved and inventory has been updated."
      maxWidth="max-w-[780px]"
      footerLeft={
        <DialogButton onClick={onClose}>
          Close
        </DialogButton>
      }
      footerRight={
        <>
          <DialogButton
            icon={FileText}
            variant="outline"
            onClick={onViewDetails}
          >
            View Adjustment Details
          </DialogButton>

          <DialogButton
            icon={Boxes}
            variant="primary"
            onClick={onViewInventory}
          >
            View Inventory
          </DialogButton>
        </>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">
          Loading adjustment details...
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <FileText
                size={18}
                className="text-green-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 flex-1">
              <InfoField
                label="Adjustment Number"
                value={
                  <span className="flex items-center gap-2">
                    {adjustment.adjustment_number ||
                      "—"}

                    <Pill tone="green">
                      Approved
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
                label="Approved On"
                value={formatDateTime(
                  adjustment.approved_at
                )}
              />

              <InfoField
                label="Reason"
                value={
                  adjustment.reason || "—"
                }
              />

              <InfoField
                label="Approved By"
                value={
                  <>
                    {approvedBy?.name ||
                      "—"}

                    {roleLabel(
                      approvedBy
                    ) && (
                      <span className="text-gray-400 font-medium">
                        {" "}
                        (
                        {roleLabel(
                          approvedBy
                        )}
                        )
                      </span>
                    )}
                  </>
                }
              />

              <InfoField
                label="Adjusted By"
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
              Items Adjusted ({items.length})
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
                      Change
                    </th>

                    <th className="text-left px-4 py-2.5">
                      New Stock
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
                        No items found on
                        this adjustment.
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
                                  item.category
                                    ?.name || ""
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

              <div className="grid grid-cols-3 bg-green-50 px-4 py-3 border-t border-gray-100">
                <InfoField
                  label="Items Adjusted"
                  value={items.length}
                  valueClassName="text-green-700"
                />

                <InfoField
                  label="Total Change"
                  value={`${
                    totalChange > 0
                      ? "+"
                      : ""
                  }${formatQty(
                    totalChange
                  )}`}
                  valueClassName={
                    totalChange < 0
                      ? "text-red-500"
                      : "text-green-700"
                  }
                />

                <InfoField
                  label="Inventory Status"
                  value={
                    <Pill tone="green">
                      Updated
                    </Pill>
                  }
                />
              </div>
            </div>
          </div>

          {adjustment.notes && (
            <div className="mt-5">
              <div className="text-[13.5px] font-bold text-[#1E2740] mb-1">
                Notes
              </div>

              <p className="text-[13px] text-gray-500">
                {adjustment.notes}
              </p>
            </div>
          )}
        </>
      )}
    </DialogShell>
  );
};

export default AdjustmentApprovedDialog;