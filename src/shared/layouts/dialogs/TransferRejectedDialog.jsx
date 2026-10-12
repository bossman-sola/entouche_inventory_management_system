import React from "react";
import {
  AlertCircle,
  FileText,
  Eye,
  ArrowRight,
  Package,
} from "lucide-react";

import DialogShell from "./DialogShell";
import {
  InfoField,
  Pill,
  DialogButton,
  ItemCell,
} from "./primitives";

function formatDateTime(value) {
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
}

function formatQuantity(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
}

function formatMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₦0.00";
  }

  return `₦${number.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function roleLabel(user) {
  const role =
    user?.roles?.[0]?.name ??
    user?.role ??
    "";

  if (!role) {
    return "";
  }

  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase(),
    );
}

function locationLabel(
  warehouse,
  location,
) {
  const warehouseName =
    warehouse?.name || "";

  const locationName =
    location?.name || "";

  if (
    warehouseName &&
    locationName
  ) {
    return `${warehouseName} - ${locationName}`;
  }

  return (
    locationName ||
    warehouseName ||
    "—"
  );
}

const TransferRejectedDialog = ({
  isOpen,
  onClose,
  transfer = {},
  loading = false,
  onViewDetails,
}) => {
  if (!isOpen) {
    return null;
  }

  const items =
    Array.isArray(transfer.items)
      ? transfer.items
      : [];

  const requester =
    transfer.requester ||
    transfer.creator ||
    null;

  const fromWarehouse =
    transfer.from_warehouse ||
    transfer.fromWarehouse ||
    null;

  const fromLocation =
    transfer.from_location ||
    transfer.fromLocation ||
    null;

  const toWarehouse =
    transfer.to_warehouse ||
    transfer.toWarehouse ||
    null;

  const toLocation =
    transfer.to_location ||
    transfer.toLocation ||
    null;

  const totalQuantity =
    items.reduce(
      (sum, row) =>
        sum +
        Number(
          row?.quantity || 0,
        ),
      0,
    );

  const totalValue =
    items.reduce(
      (sum, row) => {
        const item =
          row?.item || {};

        const qty =
          Number(
            row?.quantity || 0,
          );

        const unitCost =
          Number(
            row?.unit_cost ??
              item?.unit_cost ??
              0,
          );

        return (
          sum +
          qty * unitCost
        );
      },
      0,
    );

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertCircle}
      iconBg="bg-red-100"
      iconFg="text-red-600"
      titleColor="text-red-600"
      title="Transfer Rejected"
      subtitle="This transfer request was rejected and will not be processed."
      maxWidth="max-w-[800px]"
      footerLeft={
        <DialogButton
          onClick={onClose}
        >
          Close
        </DialogButton>
      }
      footerRight={
        <DialogButton
          icon={Eye}
          variant="outline"
          onClick={
            onViewDetails
          }
        >
          View Transfer
        </DialogButton>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">
          Loading transfer details...
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText
                size={18}
                className="text-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 flex-1">
              <InfoField
                label="Transfer Number"
                value={
                  <span className="flex items-center gap-2">
                    {transfer.transfer_number ||
                      "—"}

                    <Pill tone="red">
                      Rejected
                    </Pill>
                  </span>
                }
              />

              <InfoField
                label="Transfer Type"
                value="Stock Transfer"
              />

              <InfoField
                label="Submitted By"
                value={
                  <>
                    {requester?.name ||
                      "—"}

                    {roleLabel(
                      requester,
                    ) && (
                      <span className="text-gray-400 font-medium">
                        {" "}
                        (
                        {roleLabel(
                          requester,
                        )}
                        )
                      </span>
                    )}
                  </>
                }
              />

              <InfoField
                label="Submitted On"
                value={formatDateTime(
                  transfer.created_at,
                )}
              />

              <InfoField
                label="From Location"
                value={locationLabel(
                  fromWarehouse,
                  fromLocation,
                )}
              />

              <InfoField
                label="To Location"
                value={locationLabel(
                  toWarehouse,
                  toLocation,
                )}
              />
            </div>
          </div>

          {/* Transfer Details */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <Package
                size={17}
                className="text-indigo-500"
              />

              <div className="text-[13.5px] font-bold text-[#1E2740]">
                Transfer Details
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                <InfoField
                  label="Total Items"
                  value={
                    items.length
                  }
                />

                <InfoField
                  label="Total Quantity"
                  value={formatQuantity(
                    totalQuantity,
                  )}
                />

                <InfoField
                  label="Total Value (Est.)"
                  value={formatMoney(
                    totalValue,
                  )}
                />
              </div>

              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-gray-400 text-[11.5px] font-semibold">
                    <th className="text-left px-4 py-2.5">
                      Item
                    </th>

                    <th className="text-left px-4 py-2.5">
                      SKU
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Quantity
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Unit Cost
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-400 py-7"
                      >
                        No items found on
                        this transfer.
                      </td>
                    </tr>
                  ) : (
                    items.map(
                      (
                        row,
                        index,
                      ) => {
                        const item =
                          row?.item ||
                          {};

                        const unit =
                          item?.unit
                            ?.abbreviation ||
                          item?.unit
                            ?.name ||
                          "";

                        const unitCost =
                          Number(
                            row?.unit_cost ??
                              item?.unit_cost ??
                              0,
                          );

                        return (
                          <tr
                            key={
                              row?.id ??
                              index
                            }
                            className="border-t border-gray-100"
                          >
                            <td className="px-4 py-3">
                              <ItemCell
                                image={
                                  item?.image_path
                                }
                                name={
                                  item?.name ||
                                  `Item #${
                                    row?.item_id ??
                                    "—"
                                  }`
                                }
                                sub={
                                  item
                                    ?.category
                                    ?.name ||
                                  ""
                                }
                              />
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {item?.sku ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 font-semibold text-[#1E2740]">
                              {formatQuantity(
                                row?.quantity,
                              )}

                              {unit
                                ? ` ${unit}`
                                : ""}
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {formatMoney(
                                unitCost,
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejection Details */}
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle
                  size={18}
                  className="text-red-600"
                />
              </div>

              <div className="flex-1">
                <div className="text-[13.5px] font-bold text-red-700 mb-2">
                  Rejection Details
                </div>

                <div className="text-[11.5px] font-semibold text-red-600 mb-1">
                  Reason for Rejection
                </div>

                <div className="text-[13px] leading-5 text-[#1E2740]">
                  {transfer.rejection_reason ||
                    "No rejection reason was provided."}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory note */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12.5px] text-blue-700">
            No inventory movement was
            made because this transfer
            request was rejected.
          </div>

          {/* Route */}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                From
              </div>

              <div className="mt-1 text-[13px] font-semibold text-[#1E2740]">
                {locationLabel(
                  fromWarehouse,
                  fromLocation,
                )}
              </div>
            </div>

            <ArrowRight
              size={18}
              className="text-gray-300 flex-shrink-0"
            />

            <div className="min-w-0 text-right">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                To
              </div>

              <div className="mt-1 text-[13px] font-semibold text-[#1E2740]">
                {locationLabel(
                  toWarehouse,
                  toLocation,
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DialogShell>
  );
};

export default TransferRejectedDialog;
