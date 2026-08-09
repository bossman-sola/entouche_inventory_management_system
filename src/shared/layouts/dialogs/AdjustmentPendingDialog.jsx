import React from "react";
import { AlertCircle, FileText, CheckCircle2, Paperclip } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, ItemCell, DialogButton, Banner, WorkflowStepper } from "./primitives";

const AdjustmentPendingDialog = ({
  isOpen,
  onClose,
  adjustment = {},
  items = [],
  stockSummary = {},
  details = {},
  workflowSteps = [],
  onViewDetails,
  onApprove,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertCircle}
      iconBg="bg-amber-100"
      iconFg="text-amber-600"
      titleColor="text-amber-600"
      title="Adjustment Pending"
      subtitle="This inventory adjustment has been submitted and is awaiting approval."
      maxWidth="max-w-[760px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewDetails}>View Adjustment Details</DialogButton>
          <DialogButton icon={CheckCircle2} variant="orange" onClick={onApprove}>Approve Adjustment</DialogButton>
        </>
      }
    >
      
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Adjustment Number" value={<span className="flex items-center gap-2">{adjustment.number} <Pill tone="amber">Pending Approval</Pill></span>} />
          <InfoField label="Adjustment Type" value={adjustment.type} />
          <InfoField label="Submitted On" value={adjustment.submittedOn} />
          <InfoField label="Reason" value={adjustment.reason} />
          <InfoField label="Submitted By" value={<>{adjustment.submittedBy}{adjustment.submittedByRole && <span className="text-gray-400 font-medium"> ({adjustment.submittedByRole})</span>}</>} />
          <InfoField label="Approval Required From" value={<>{adjustment.approvalFrom}{adjustment.approvalFromRole && <span className="text-gray-400 font-medium"> ({adjustment.approvalFromRole})</span>}</>} />
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Items Affected ({items.length})</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Item</th>
                <th className="text-left px-4 py-2.5">SKU</th>
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-left px-4 py-2.5">Quantity Change</th>
                <th className="text-left px-4 py-2.5">Unit</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No items on this adjustment.</td></tr>
              ) : items.map((it, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3"><ItemCell image={it.image} name={it.name} sub={it.cat} /></td>
                  <td className="px-4 py-3 text-gray-500">{it.sku}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1E2740]">{it.location}</div>
                    <div className="text-[11px] text-gray-400">{it.zone}</div>
                  </td>
                  <td className={`px-4 py-3 font-bold ${String(it.qtyChange).startsWith("-") ? "text-red-500" : "text-green-600"}`}>{it.qtyChange} {it.unit}</td>
                  <td className="px-4 py-3 text-gray-500">{it.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid grid-cols-4 bg-amber-50 px-4 py-3 border-t border-gray-100">
            <InfoField label="Previous Stock" value={stockSummary.previous} valueClassName="text-amber-700" />
            <InfoField label="Adjustment" value={stockSummary.adjustment} valueClassName="text-red-500" />
            <InfoField label="Expected Stock" value={stockSummary.expected} valueClassName="text-amber-700" />
            <InfoField label="After Approval" value={<Pill tone="amber">{`Will be ${stockSummary.expected ?? "—"}`}</Pill>} />
          </div>
        </div>
      </div>

     
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Adjustment Details</div>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <InfoField label="Reason Details" value={details.reasonDetails} />
          <InfoField label="Reference" value={details.reference} />
          <InfoField label="Affected By" value={details.affectedBy} />
          <InfoField
            label="Attachment"
            value={details.attachment ? (
              <a href={details.attachmentUrl || "#"} className="text-indigo-600 flex items-center gap-1 hover:underline"><Paperclip size={12} />{details.attachment}</a>
            ) : "—"}
          />
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-3">Approval Workflow</div>
        <WorkflowStepper steps={workflowSteps} />
      </div>

      <Banner tone="amber" className="mt-5">
        This adjustment is awaiting approval. Inventory will be updated once approved.
      </Banner>
    </DialogShell>
  );
};

export default AdjustmentPendingDialog;