import React from "react";
import {
    CheckCircle2,
    FileText,
    PackageCheck,
} from "lucide-react";

import DialogShell from "./DialogShell";
import {
    InfoField,
    Pill,
    ItemCell,
    DialogButton,
} from "./primitives";
import { formatDateOnly } from "../../../lib/dateUtils";


const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "₦0.00";
    }

    return `₦${number.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
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

const ReceiptApprovedDialog = ({
    isOpen,
    onClose,
    receipt = {},
    loading = false,
    onViewDetails,
    onReceive,
}) => {
    if (!isOpen) return null;

    const items =
        Array.isArray(receipt.items)
            ? receipt.items
            : [];

    const supplier =
        receipt.supplier || null;

    const warehouse =
        receipt.warehouse || null;

    const receivingLocation =
        receipt.receiving_location ||
        receipt.receivingLocation ||
        null;

    const creator =
        receipt.creator || null;

    const totalQuantity =
        items.reduce(
            (sum, row) =>
                sum +
                Number(row.quantity || 0),
            0
        );

    const totalAmount =
        items.reduce(
            (sum, row) =>
                sum +
                Number(
                    row.total_cost ??
                    Number(row.quantity || 0) *
                    Number(row.unit_cost || 0)
                ),
            0
        );

    return (
        <DialogShell
            isOpen={isOpen}
            onClose={onClose}
            icon={CheckCircle2}
            iconBg="bg-green-100"
            iconFg="text-green-600"
            titleColor="text-green-600"
            title="Receipt Approved"
            subtitle="This receipt has been approved and is ready to be received into inventory."
            maxWidth="max-w-[760px]"
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
                        View Receipt Details
                    </DialogButton>

                    <DialogButton
                        icon={PackageCheck}
                        variant="primary"
                        onClick={onReceive}
                    >
                        Receive Stock
                    </DialogButton>
                </>
            }
        >
            {loading ? (
                <div className="py-16 text-center text-sm text-gray-400">
                    Loading receipt details...
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
                                label="Receipt Number"
                                value={
                                    <span className="flex items-center gap-2">
                                        {receipt.receipt_number ||
                                            "—"}

                                        <Pill tone="green">
                                            Approved
                                        </Pill>
                                    </span>
                                }
                            />

                            <InfoField
                                label="Supplier"
                                value={
                                    supplier?.name || "—"
                                }
                            />

                         <InfoField
  label="Receipt Date"
  value={formatDateOnly(
    receipt.receipt_date
  )}
/>

                            <InfoField
                                label="Warehouse"
                                value={
                                    warehouse?.name || "—"
                                }
                            />

                            <InfoField
                                label="Receiving Location"
                                value={
                                    receivingLocation?.name ||
                                    "—"
                                }
                            />

                            <InfoField
                                label="Created By"
                                value={
                                    <>
                                        {creator?.name || "—"}

                                        {roleLabel(creator) && (
                                            <span className="text-gray-400 font-medium">
                                                {" "}
                                                (
                                                {roleLabel(
                                                    creator
                                                )}
                                                )
                                            </span>
                                        )}
                                    </>
                                }
                            />

                            <InfoField
                                label="Vendor PO Number"
                                value={
                                    receipt.vendor_po_number ||
                                    "—"
                                }
                            />

                            <InfoField
                                label="API PO Number"
                                value={
                                    receipt.api_po_number ||
                                    "—"
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
                                            Quantity
                                        </th>

                                        <th className="text-left px-4 py-2.5">
                                            Unit Cost
                                        </th>

                                        <th className="text-left px-4 py-2.5">
                                            Total Cost
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
                                                No items found on this receipt.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map(
                                            (row, index) => {
                                                const item =
                                                    row.item || {};

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

                                                        <td className="px-4 py-3 font-semibold text-[#1E2740]">
                                                            {Number(
                                                                row.quantity ||
                                                                0
                                                            ).toLocaleString()}
                                                            {" "}
                                                            {item.unit
                                                                ?.abbreviation ||
                                                                ""}
                                                        </td>

                                                        <td className="px-4 py-3 text-gray-500">
                                                            {formatMoney(
                                                                row.unit_cost
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3 font-bold text-[#1E2740]">
                                                            {formatMoney(
                                                                row.total_cost
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
                                    label="Total Items"
                                    value={items.length}
                                    valueClassName="text-green-700"
                                />

                                <InfoField
                                    label="Total Quantity"
                                    value={totalQuantity}
                                    valueClassName="text-green-700"
                                />

                                <InfoField
                                    label="Receipt Value"
                                    value={formatMoney(
                                        totalAmount
                                    )}
                                    valueClassName="text-green-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle2
                                size={17}
                                className="text-green-600 mt-0.5"
                            />

                            <div>
                                <div className="text-[12.5px] font-semibold text-green-700">
                                    Receipt Approved
                                </div>

                                <div className="text-[12px] text-green-600 mt-0.5">
                                    The receipt is ready for stock receiving.
                                    Inventory has not yet been updated.
                                </div>
                            </div>
                        </div>
                    </div>

                    {receipt.notes && (
                        <div className="mt-5">
                            <div className="text-[13.5px] font-bold text-[#1E2740] mb-1">
                                Notes
                            </div>

                            <p className="text-[13px] text-gray-500">
                                {receipt.notes}
                            </p>
                        </div>
                    )}
                </>
            )}
        </DialogShell>
    );
};

export default ReceiptApprovedDialog;