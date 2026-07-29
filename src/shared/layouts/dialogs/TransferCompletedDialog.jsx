import React from "react";
import { RefreshCw, FileText, Printer, ArrowRight, CheckCircle2 } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, ItemCell, DialogButton } from "./primitives";
const TransferCompletedDialog = ({
  isOpen,
  onClose,
  transfer = {},
  items = [],
  totals = {},
  summary = {},
  notes,
  onViewDetails,
  onPrintSlip,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={RefreshCw}
      iconBg="bg-green-100"
      iconFg="text-green-600"
      titleColor="text-green-600"
      title="Transfer Completed"
      subtitle="The transfer has been completed successfully and inventory has been updated."
      maxWidth="max-w-[760px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewDetails}>View Transfer Details</DialogButton>
          <DialogButton icon={Printer} variant="primary" onClick={onPrintSlip}>Print Transfer Slip</DialogButton>
        </>
      }
    >
      
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Transfer Number" value={<span className="flex items-center gap-2">{transfer.number} <Pill tone="green">Completed</Pill></span>} />
          <InfoField label="From Location" value={<span className="flex items-center gap-2">{transfer.fromLocation} <Pill tone="indigo">{transfer.fromZone}</Pill></span>} />
          <InfoField label="Completed On" value={transfer.completedOn} />
          <InfoField label="To Location" value={<span className="flex items-center gap-2">{transfer.toLocation} <Pill tone="indigo">{transfer.toZone}</Pill></span>} />
          <InfoField label="Completed By" value={<>{transfer.completedBy}{transfer.completedByRole && <span className="text-gray-400 font-medium"> ({transfer.completedByRole})</span>}</>} />
          <InfoField label="Purpose" value={transfer.purpose} />
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Items Transferred ({items.length})</div>
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
                  <td className="px-4 py-3 font-semibold text-green-600">{it.qty} {it.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{it.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-4 bg-green-50 px-4 py-3 border-t border-gray-100">
            <InfoField label="Total Items" value={totals.items} valueClassName="text-green-700" />
            <InfoField label="Total Quantity" value={totals.qty} valueClassName="text-green-700" />
            <InfoField label="From Location" value={transfer.fromLocation} valueClassName="text-green-700" />
            <InfoField label="To Location" value={transfer.toLocation} valueClassName="text-green-700" />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Transfer Summary</div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-4 border border-gray-100 overflow-x-auto">
          <div className="flex-shrink-0">
            <Pill tone="blue">Previous Stock</Pill>
            <div className="text-[13.5px] font-bold text-[#1E2740] mt-1.5">{summary.previousLocation}</div>
            <div className="text-[12px] text-gray-500">{summary.previousStock}</div>
          </div>
          <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
          <div className="flex-shrink-0">
            <Pill tone="orange">Transferred Out</Pill>
            <div className="text-[13.5px] font-bold text-orange-600 mt-1.5">{summary.transferredOut}</div>
          </div>
          <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={15} />
          </div>
          <div className="flex-shrink-0">
            <Pill tone="green">Transferred In</Pill>
            <div className="text-[13.5px] font-bold text-green-600 mt-1.5">{summary.transferredIn}</div>
          </div>
          <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
          <div className="flex-shrink-0">
            <Pill tone="gray">New Stock</Pill>
            <div className="text-[13.5px] font-bold text-[#1E2740] mt-1.5">{summary.newLocation}</div>
            <div className="text-[12px] text-gray-500">{summary.newStock}</div>
          </div>
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

export default TransferCompletedDialog;