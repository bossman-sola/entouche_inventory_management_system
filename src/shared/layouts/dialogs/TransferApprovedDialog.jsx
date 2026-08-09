import React from "react";
import { ShoppingCart, FileText, Printer, RefreshCw } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, ItemCell, DialogButton, Banner } from "./primitives";
const TransferApprovedDialog = ({
  isOpen,
  onClose,
  transfer = {},
  items = [],
  totals = {},
  details = {},
  onComplete,
  onViewDetails,
  onPrintSlip,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={ShoppingCart}
      iconBg="bg-blue-100"
      iconFg="text-blue-500"
      titleColor="text-blue-500"
      title="Transfer Approved"
      subtitle="This transfer has been approved and is ready for completion."
      maxWidth="max-w-[760px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewDetails}>View Transfer Details</DialogButton>
          <DialogButton icon={Printer} variant="outline" onClick={onPrintSlip}>Print Transfer Slip</DialogButton>
        </>
      }
    >
      
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Transfer Number" value={<span className="flex items-center gap-2">{transfer.number} <Pill tone="blue">Approved</Pill></span>} />
          <InfoField label="From Location" value={<span className="flex items-center gap-2">{transfer.fromLocation} <Pill tone="indigo">{transfer.fromZone}</Pill></span>} />
          <InfoField label="Approved On" value={transfer.approvedOn} />
          <InfoField label="To Location" value={<span className="flex items-center gap-2">{transfer.toLocation} <Pill tone="indigo">{transfer.toZone}</Pill></span>} />
          <InfoField label="Approved By" value={<>{transfer.approvedBy}{transfer.approvedByRole && <span className="text-gray-400 font-medium"> ({transfer.approvedByRole})</span>}</>} />
          <InfoField label="Purpose" value={transfer.purpose} />
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Items to be Transferred ({items.length})</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Item</th>
                <th className="text-left px-4 py-2.5">SKU</th>
                <th className="text-left px-4 py-2.5">Quantity</th>
                <th className="text-left px-4 py-2.5">Unit</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-8">No items on this transfer.</td></tr>
              ) : items.map((it, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3"><ItemCell image={it.image} name={it.name} sub={it.cat} /></td>
                  <td className="px-4 py-3 text-gray-500">{it.sku}</td>
                  <td className="px-4 py-3 font-semibold text-[#1E2740]">{it.qty} {it.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{it.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-3 bg-blue-50 px-4 py-3 border-t border-gray-100">
            <InfoField label="Total Items" value={totals.items} valueClassName="text-blue-700" />
            <InfoField label="Total Quantity" value={totals.qty} valueClassName="text-blue-700" />
            <InfoField label="Transfer Type" value={totals.type} valueClassName="text-blue-700" />
          </div>
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Transfer Details</div>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <InfoField label="Requested On" value={details.requestedOn} />
          <InfoField label="Requested By" value={<>{details.requestedBy}{details.requestedByRole && <div className="text-[11px] text-gray-400 font-medium">{details.requestedByRole}</div>}</>} />
          <InfoField label="Reference" value={details.reference} />
          <InfoField label="Status" value={<Pill tone="green">{details.status || "Approved"}</Pill>} />
        </div>
      </div>

      <Banner tone="blue" className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        <span>This transfer is approved. You can now complete the transfer.</span>
        <DialogButton icon={RefreshCw} variant="primary" onClick={onComplete}>Complete Transfer</DialogButton>
      </Banner>
    </DialogShell>
  );
};

export default TransferApprovedDialog;