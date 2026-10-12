import React from "react";
import {
  Clock3,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import DialogShell from "./DialogShell";

import {
  InfoField,
  Pill,
  ItemCell,
  DialogButton,
} from "./primitives";

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

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

const formatQuantity = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 3,
    },
  );
};

const formatNaira = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₦0.00";
  }

  return `₦${number.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
};

const getRoleLabel = (user) => {
  const role =
    user?.roles?.[0]?.name ??
    user?.role ??
    "";

  if (!role) {
    return "";
  }

  return String(role)
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    );
};

const getLocationLabel = (
  warehouse,
  location,
) => {
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
};

const TransferPendingApprovalDialog = ({
  isOpen,
  onClose,

  transfer = {},

  loading = false,
  actionLoading = false,

  onViewDetails,
  onApprove,
  onReject,
}) => {
  if (!isOpen) {
    return null;
  }

  const items =
    Array.isArray(
      transfer.items,
    )
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

        const quantity =
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
          quantity *
            unitCost
        );
      },
      0,
    );

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Clock3}
      iconBg="bg-amber-100"
      iconFg="text-amber-600"
      titleColor="text-amber-600"
      title="Transfer Pending Approval"
      subtitle="This transfer has been submitted and is awaiting review and approval."
      maxWidth="max-w-[820px]"
      footerLeft={
        <DialogButton
          onClick={onClose}
          disabled={
            actionLoading
          }
        >
          Close
        </DialogButton>
      }
      footerRight={
        <>
          <DialogButton
            icon={FileText}
            variant="outline"
            onClick={
              onViewDetails
            }
            disabled={
              actionLoading
            }
          >
            View Transfer
          </DialogButton>

          <DialogButton
            icon={XCircle}
            variant="outline"
            onClick={onReject}
            disabled={
              actionLoading
            }
          >
            Reject
          </DialogButton>

          <DialogButton
            icon={CheckCircle2}
            variant="primary"
            onClick={onApprove}
            disabled={
              actionLoading
            }
          >
            {actionLoading
              ? "Processing..."
              : "Approve"}
          </DialogButton>
        </>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">
          Loading transfer
          details...
        </div>
      ) : (
        <>
          {/* =========================
              SUMMARY
          ========================== */}

          <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <FileText
                size={18}
                className="text-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 flex-1">
              <InfoField
                label="Transfer Number"
                value={
                  <span className="flex items-center gap-2">
                    {transfer.transfer_number ||
                      "—"}

                    <Pill tone="orange">
                      Pending Approval
                    </Pill>
                  </span>
                }
              />

              <InfoField
                label="Transfer Type"
                value="Stock Transfer"
              />

              <InfoField
                label="Requested By"
                value={
                  <>
                    {requester?.name ||
                      "—"}

                    {getRoleLabel(
                      requester,
                    ) && (
                      <span className="text-gray-400 font-medium">
                        {" "}
                        (
                        {getRoleLabel(
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
                  transfer.updated_at ||
                    transfer.created_at,
                )}
              />

              <InfoField
                label="From Location"
                value={getLocationLabel(
                  fromWarehouse,
                  fromLocation,
                )}
              />

              <InfoField
                label="To Location"
                value={getLocationLabel(
                  toWarehouse,
                  toLocation,
                )}
              />
            </div>
          </div>

          {/* =========================
              ROUTE
          ========================== */}

          <div className="mt-5">
            <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">
              Transfer Route
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">
                  From
                </div>

                <div className="mt-1 text-[13px] font-semibold text-[#1E2740]">
                  {getLocationLabel(
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
                  {getLocationLabel(
                    toWarehouse,
                    toLocation,
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              ITEMS
          ========================== */}

          <div className="mt-5">
            <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">
              Items to Transfer (
              {items.length})
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
                      Quantity
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Unit Cost
                    </th>

                    <th className="text-left px-4 py-2.5">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-gray-400 py-8"
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

                        const quantity =
                          Number(
                            row?.quantity ||
                              0,
                          );

                        const unitCost =
                          Number(
                            row?.unit_cost ??
                              item?.unit_cost ??
                              0,
                          );

                        const lineTotal =
                          quantity *
                          unitCost;

                        const unit =
                          item?.unit
                            ?.abbreviation ||
                          item?.unit
                            ?.name ||
                          "";

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
                                quantity,
                              )}

                              {unit
                                ? ` ${unit}`
                                : ""}
                            </td>

                            <td className="px-4 py-3 text-gray-500">
                              {formatNaira(
                                unitCost,
                              )}
                            </td>

                            <td className="px-4 py-3 font-semibold text-[#1E2740]">
                              {formatNaira(
                                lineTotal,
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>
              </table>

              <div className="grid grid-cols-3 bg-amber-50 px-4 py-3 border-t border-gray-100">
                <InfoField
                  label="Total Items"
                  value={
                    items.length
                  }
                  valueClassName="text-amber-700"
                />

                <InfoField
                  label="Total Quantity"
                  value={formatQuantity(
                    totalQuantity,
                  )}
                  valueClassName="text-amber-700"
                />

                <InfoField
                  label="Estimated Value"
                  value={formatNaira(
                    totalValue,
                  )}
                  valueClassName="text-amber-700"
                />
              </div>
            </div>
          </div>

          {/* =========================
              NOTES
          ========================== */}

          {transfer.notes && (
            <div className="mt-5">
              <div className="text-[13.5px] font-bold text-[#1E2740] mb-1">
                Notes
              </div>

              <p className="text-[13px] text-gray-500 leading-5">
                {
                  transfer.notes
                }
              </p>
            </div>
          )}

          {/* =========================
              APPROVAL NOTICE
          ========================== */}

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Clock3
                size={17}
                className="text-amber-600 mt-0.5"
              />

              <div>
                <div className="text-[12.5px] font-semibold text-amber-700">
                  Approval Required
                </div>

                <div className="text-[12px] text-amber-600 mt-0.5 leading-5">
                  No inventory will be
                  moved until this
                  transfer has been
                  approved and later
                  completed.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DialogShell>
  );
};

export default TransferPendingApprovalDialog;