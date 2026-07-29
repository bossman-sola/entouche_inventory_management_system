import React from "react";
import { CheckCircle2, FileText, Eye, Boxes } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, ItemCell, DialogButton } from "./primitives";
const ReceiptCompletedDialog = ({
  isOpen,
  onClose,
  receipt = {},
  items = [],
  totals = {},
  inventoryUpdates = [],
  notes,
  onViewReceiptDetails,
  onViewInventory,
}) => {
  if (!isOpen) return null;
  const fmt = (n) => (n == null ? "—" : `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`);

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={CheckCircle2}
      iconBg="bg-green-100"
      iconFg="text-green-600"
      titleColor="text-green-600"
      title="Receipt Completed"
      subtitle="This receipt has been completed and inventory has been updated."
      maxWidth="max-w-[760px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewReceiptDetails}>View Receipt Details</DialogButton>
          <DialogButton icon={Boxes} variant="primary" onClick={onViewInventory}>View Inventory</DialogButton>
        </>
      }
    >
      {/* Summary */}
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Receipt Number" value={<span className="flex items-center gap-2">{receipt.number} <Pill tone="green">Completed</Pill></span>} />
          <InfoField label="Supplier" value={receipt.supplier} />
          <InfoField label="Completed on" value={receipt.completedOn} />
          <InfoField label="Warehouse" value={receipt.warehouse} />
          <InfoField label="Received by" value={receipt.receivedBy} />
          <InfoField label="Receipt Type" value={receipt.type} />
        </div>
      </div>

      {/* Items */}
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Items Received ({items.length})</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Item</th>
                <th className="text-left px-4 py-2.5">SKU</th>
                <th className="text-left px-4 py-2.5">Quantity</th>
                <th className="text-left px-4 py-2.5">Unit Cost</th>
                <th className="text-left px-4 py-2.5">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No items on this receipt.</td></tr>
              ) : items.map((it, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3"><ItemCell image={it.image} name={it.name} sub={it.cat} /></td>
                  <td className="px-4 py-3 text-gray-500">{it.sku}</td>
                  <td className="px-4 py-3 font-semibold text-[#1E2740]">{it.qty} {it.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(it.unitCost)}</td>
                  <td className="px-4 py-3 font-bold text-[#1E2740]">{fmt(it.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-3 bg-green-50 px-4 py-3 border-t border-gray-100">
            <InfoField label="Total Items" value={totals.items} valueClassName="text-green-700" />
            <InfoField label="Total Quantity" value={totals.qty} valueClassName="text-green-700" />
            <InfoField label="Total Amount" value={fmt(totals.amount)} valueClassName="text-green-700" />
          </div>
        </div>
      </div>

      {/* Inventory update */}
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-1">Inventory Update</div>
        <p className="text-[12.5px] text-gray-500 mb-2">The following locations have been updated with the received stock.</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-left px-4 py-2.5">Previous Stock</th>
                <th className="text-left px-4 py-2.5">Received</th>
                <th className="text-left px-4 py-2.5">New Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventoryUpdates.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-6">No location updates recorded.</td></tr>
              ) : inventoryUpdates.map((u, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1E2740]">{u.location}</div>
                    <div className="text-[11px] text-gray-400">{u.zone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.previous}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">+{u.received}</td>
                  <td className="px-4 py-3 font-bold text-[#1E2740]">{u.newStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {notes && (
        <div className="mt-5">
          <div className="text-[13.5px] font-bold text-[#1E2740] mb-1">Notes</div>
          <p className="text-[13px] text-gray-500">{notes}</p>
        </div>
      )}
    </DialogShell>
  );
};

export default ReceiptCompletedDialog;