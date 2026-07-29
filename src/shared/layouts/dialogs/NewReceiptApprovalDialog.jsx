import React from "react";
import { Package, FileText, Printer, CheckCircle2 } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, ItemCell, DialogButton, WorkflowStepper } from "./primitives";

const NewReceiptApprovalDialog = ({
  isOpen,
  onClose,
  receipt = {},
  items = [],
  totals = {},
  reference = {},
  notes,
  workflowSteps = [],
  onViewDetails,
  onPrint,
  onApprove,
}) => {
  if (!isOpen) return null;
  const fmt = (n) => (n == null ? "—" : `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`);

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Package}
      iconBg="bg-amber-100"
      iconFg="text-amber-600"
      titleColor="text-amber-600"
      title="New Receipt Awaiting Approval"
      subtitle="A new receipt has been submitted and is awaiting your approval."
      maxWidth="max-w-[800px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewDetails}>View Receipt Details</DialogButton>
          <DialogButton icon={Printer} variant="outline" onClick={onPrint}>Print Receipt</DialogButton>
          <DialogButton icon={CheckCircle2} variant="orange" onClick={onApprove}>Approve Receipt</DialogButton>
        </>
      }
    >
      
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Receipt Number" value={<span className="flex items-center gap-2">{receipt.number} <Pill tone="amber">Pending Approval</Pill></span>} />
          <InfoField label="Supplier" value={receipt.supplier} />
          <InfoField label="Submitted On" value={receipt.submittedOn} />
          <InfoField label="Warehouse" value={receipt.warehouse} />
          <InfoField label="Submitted By" value={<>{receipt.submittedBy}{receipt.submittedByRole && <span className="text-gray-400 font-medium"> ({receipt.submittedByRole})</span>}</>} />
          <InfoField label="Receipt Type" value={receipt.type} />
          <InfoField label="Expected Delivery Date" value={receipt.expectedDeliveryDate} />
        </div>
      </div>

      
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
          <div className="grid grid-cols-4 bg-amber-50 px-4 py-3 border-t border-gray-100">
            <InfoField label="Total Items" value={totals.items} valueClassName="text-amber-700" />
            <InfoField label="Total Quantity" value={totals.qty} valueClassName="text-amber-700" />
            <InfoField label="Total Amount" value={fmt(totals.amount)} valueClassName="text-amber-700" />
            <InfoField label={`Total Tax (${totals.taxPct ?? 0}%)`} value={fmt(totals.taxAmount)} valueClassName="text-amber-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <div className="text-[12.5px] font-bold text-[#1E2740] mb-2.5">Reference</div>
          <div className="grid grid-cols-2 gap-y-3">
            <InfoField label="PO Number" value={reference.poNumber} />
            <InfoField label="Invoice Number" value={reference.invoiceNumber} />
            <InfoField label="Delivery Note" value={reference.deliveryNote} />
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <div className="text-[12.5px] font-bold text-[#1E2740] mb-2.5">Notes</div>
          <p className="text-[13px] text-gray-500 leading-relaxed">{notes || "No notes provided."}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-3">Approval Workflow</div>
        <WorkflowStepper steps={workflowSteps} />
      </div>
    </DialogShell>
  );
};

export default NewReceiptApprovalDialog;