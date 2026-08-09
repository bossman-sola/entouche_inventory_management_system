import React from "react";
import { AlertTriangle, FileText, CheckCircle2, RotateCcw, ClipboardCheck } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, StatBox, DialogButton, Banner } from "./primitives";

const LEVEL_TONE = { Critical: "red", High: "orange", Low: "amber", "Within Limit": "green" };
const StockCountVarianceDialog = ({
  isOpen,
  onClose,
  count = {},
  summary = {},
  varianceLevels = [],
  topVariances = [],
  onViewFull,
  onRequestRecount,
  onReviewApprove,
}) => {
  if (!isOpen) return null;
  const fmt = (n) => (n == null ? "—" : `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`);

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={AlertTriangle}
      iconBg="bg-orange-100"
      iconFg="text-orange-500"
      titleColor="text-orange-500"
      title="Stock Count Variance"
      subtitle="A variance has been detected in this stock count that exceeds the allowed threshold."
      maxWidth="max-w-[800px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={FileText} variant="outline" onClick={onViewFull}>View Full Count Details</DialogButton>
          <DialogButton icon={RotateCcw} variant="outline" onClick={onRequestRecount}>Request Recount</DialogButton>
          <DialogButton icon={CheckCircle2} variant="orange" onClick={onReviewApprove}>Review &amp; Approve</DialogButton>
        </>
      }
    >
      
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Stock Count Number" value={<span className="flex items-center gap-2">{count.number} <Pill tone="orange">Variance Detected</Pill></span>} />
          <InfoField label="Location" value={<span className="flex items-center gap-2">{count.location} <Pill tone="indigo">{count.zone}</Pill></span>} />
          <InfoField label="Counted On" value={count.countedOn} />
          <InfoField label="Count Type" value={count.countType} />
          <InfoField label="Counted By" value={<>{count.countedBy}{count.countedByRole && <span className="text-gray-400 font-medium"> ({count.countedByRole})</span>}</>} />
          <InfoField label="Approval Required From" value={<>{count.approvalFrom}{count.approvalFromRole && <span className="text-gray-400 font-medium"> ({count.approvalFromRole})</span>}</>} />
        </div>
      </div>

      
      <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded-xl px-4 py-4 border border-gray-100 mt-5">
        <InfoField label="Items Counted" value={summary.itemsCounted} />
        <InfoField label="Total Variance (Qty)" value={summary.totalVarianceQty} valueClassName="text-red-500" />
        <InfoField label="Total Variance Value" value={fmt(summary.totalVarianceValue)} valueClassName="text-red-500" />
        <InfoField label="Variance Percentage" value={summary.variancePct != null ? `${summary.variancePct}%` : "—"} valueClassName="text-red-500" />
      </div>

     
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Variance Summary</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Variance Level</th>
                <th className="text-left px-4 py-2.5">Items</th>
                <th className="text-left px-4 py-2.5">Total Quantity Variance</th>
                <th className="text-left px-4 py-2.5">Total Value Variance</th>
              </tr>
            </thead>
            <tbody>
              {varianceLevels.map((v, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      {v.level === "Within Limit"
                        ? <CheckCircle2 size={14} className="text-green-500" />
                        : <AlertTriangle size={14} className={LEVEL_TONE[v.level] === "red" ? "text-red-500" : LEVEL_TONE[v.level] === "orange" ? "text-orange-500" : "text-amber-500"} />}
                      <span className="font-semibold text-[#1E2740]">{v.level}</span>
                      {v.range && <span className="text-gray-400">({v.range})</span>}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{v.items}</td>
                  <td className="px-4 py-2.5 font-semibold">{v.qty}</td>
                  <td className="px-4 py-2.5 font-semibold">{fmt(v.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Top Variances</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Item</th>
                <th className="text-left px-4 py-2.5">SKU</th>
                <th className="text-left px-4 py-2.5">System Quantity</th>
                <th className="text-left px-4 py-2.5">Counted Quantity</th>
                <th className="text-left px-4 py-2.5">Variance</th>
                <th className="text-left px-4 py-2.5">Variance %</th>
              </tr>
            </thead>
            <tbody>
              {topVariances.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">No variance detail available.</td></tr>
              ) : topVariances.map((t, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1E2740]">{t.name}</div>
                    <div className="text-[11px] text-gray-400">{t.cat}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{t.sku}</td>
                  <td className="px-4 py-3">{t.systemQty}</td>
                  <td className="px-4 py-3">{t.countedQty}</td>
                  <td className="px-4 py-3 text-red-500 font-semibold">{t.variance}</td>
                  <td className="px-4 py-3 text-red-500 font-semibold">{t.variancePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Banner tone="amber" className="mt-5">
        Please review and approve the stock count to update inventory levels.
      </Banner>
    </DialogShell>
  );
};

export default StockCountVarianceDialog;