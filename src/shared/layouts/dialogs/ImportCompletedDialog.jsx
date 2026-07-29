import React from "react";
import {
  Download,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  RefreshCw,
  SkipForward,
  XCircle,
  FileText,
  DownloadCloud,
} from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, DialogButton } from "./primitives";

const SUMMARY_ROW_META = {
  imported: { icon: CheckCircle2, iconFg: "text-green-500" },
  updated: { icon: RefreshCw, iconFg: "text-blue-500" },
  skipped: { icon: SkipForward, iconFg: "text-orange-500" },
  failed: { icon: XCircle, iconFg: "text-red-500" },
};

const SummaryStat = ({ tone, label, value, pct }) => {
  const tones = {
    green: "text-green-600",
    blue: "text-blue-600",
    orange: "text-orange-500",
    red: "text-red-500",
  };
  return (
    <div className="border border-gray-100 rounded-xl px-4 py-3.5 bg-gray-50">
      <div className="text-[11.5px] text-gray-400 font-medium mb-1">{label}</div>
      <div className={`text-[22px] font-bold ${tones[tone] || "text-[#1E2740]"}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{pct != null ? `(${pct}%)` : ""}</div>
    </div>
  );
};

const ChecklistItem = ({ children }) => (
  <div className="flex items-start gap-2">
    <CheckCircle2 size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
    <span className="text-[12.5px] text-[#1E2740] leading-relaxed">{children}</span>
  </div>
);

const ImportCompletedDialog = ({
  isOpen,
  onClose,
  importInfo = {},
  stats = {},
  summaryRows = [],
  fileSummary = {},
  nextSteps = [],
  onDownloadErrorReport,
  onViewImportLog,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Download}
      iconBg="bg-green-100"
      iconFg="text-green-600"
      titleColor="text-green-600"
      title="Import Completed"
      subtitle="Your data has been imported successfully."
      maxWidth="max-w-[820px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <DialogButton icon={FileText} variant="primary" onClick={onViewImportLog}>
          View Import Log
        </DialogButton>
      }
    >
      {/* Summary */}
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField label="Import ID" value={<span className="flex items-center gap-2">{importInfo.id} <Pill tone="green">Completed</Pill></span>} />
          <InfoField label="Import Type" value={importInfo.type} />
          <InfoField
            label="File Name"
            value={
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet size={13} className="text-green-500" />
                {importInfo.fileName}
              </span>
            }
          />
          <InfoField label="Import Source" value={importInfo.source} />
          <InfoField label="Imported By" value={<>{importInfo.importedBy}{importInfo.importedByRole && <span className="text-gray-400 font-medium"> ({importInfo.importedByRole})</span>}</>} />
          <InfoField label="Warehouse" value={importInfo.warehouse} />
          <InfoField label="Completed On" value={importInfo.completedOn} />
          <InfoField label="Total Rows Found" value={importInfo.totalRows} />
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
          <Clock size={12} />
          {`Duration: ${importInfo.durationLabel || "—"}`}
        </span>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <SummaryStat tone="green" label="Successfully Imported" value={stats.imported ?? "—"} pct={stats.importedPct} />
        <SummaryStat tone="blue" label="Updated" value={stats.updated ?? "—"} pct={stats.updatedPct} />
        <SummaryStat tone="orange" label="Skipped" value={stats.skipped ?? "—"} pct={stats.skippedPct} />
        <SummaryStat tone="red" label="Failed" value={stats.failed ?? "—"} pct={stats.failedPct} />
      </div>

      {/* Import summary table */}
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Import Summary</div>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Description</th>
                <th className="text-left px-4 py-2.5">Count</th>
                <th className="text-left px-4 py-2.5">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-8">No import summary available.</td></tr>
              ) : summaryRows.map((row, i) => {
                const meta = SUMMARY_ROW_META[row.kind] || SUMMARY_ROW_META.imported;
                const Icon = meta.icon;
                return (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-semibold text-[#1E2740]">
                        <Icon size={14} className={meta.iconFg} />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.description}</td>
                    <td className="px-4 py-3 font-semibold text-[#1E2740]">{row.count}</td>
                    <td className="px-4 py-3 text-gray-500">{row.pct != null ? `${row.pct}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* File summary + next steps */}
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <div className="text-[12.5px] font-bold text-[#1E2740] mb-2.5">File Summary</div>
          <div className="grid grid-cols-2 gap-y-3">
            <InfoField label="File Size" value={fileSummary.fileSize} />
            <InfoField label="File Type" value={fileSummary.fileType} />
            <InfoField label="Sheets Processed" value={fileSummary.sheetsProcessed} />
            <InfoField label="Items per Sheet" value={fileSummary.itemsPerSheet} />
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-100">
          <div className="text-[12.5px] font-bold text-[#1E2740] mb-2.5">Next Steps</div>
          <div className="space-y-2">
            {nextSteps.length === 0 ? (
              <div className="text-gray-400 text-[12.5px]">No further action needed.</div>
            ) : (
              nextSteps.map((step, i) => <ChecklistItem key={i}>{step}</ChecklistItem>)
            )}
          </div>
          {stats.failed > 0 && (
            <div className="mt-3">
              <DialogButton icon={DownloadCloud} variant="outline" onClick={onDownloadErrorReport} disabled={!onDownloadErrorReport}>
                Download Error Report
              </DialogButton>
            </div>
          )}
        </div>
      </div>
    </DialogShell>
  );
};

export default ImportCompletedDialog;
