import React from "react";
import {
  XCircle,
  FileText,
  User,
  Calendar,
  Warehouse,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

import DialogShell from "./DialogShell";
import {
  InfoField,
  Pill,
  DialogButton,
  Banner,
} from "./primitives";

const ImportFailedDialog = ({
  isOpen,
  onClose,

  importData = {},
  errorTypes = [],

  onViewImportLog,
  onDownloadErrorReport,
}) => {
  if (!isOpen) return null;

  const {
    id,
    importType,
    uploadedBy,
    uploadedByRole,
    warehouse,
    failedOn,
    fileName,
    fileSize,

    totalRows = 0,
    importedRows = 0,
    failedRows = 0,
    skippedRows = 0,

    failureReason,
    primaryIssue,
    expectedColumns = [],
  } = importData;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={XCircle}
      iconBg="bg-red-100"
      iconFg="text-red-600"
      titleColor="text-red-600"
      title="Import Failed"
      subtitle="We couldn’t complete the import process. Please review the details below and fix the issues before trying again."
      maxWidth="max-w-[820px]"
      footerLeft={
        <DialogButton onClick={onClose}>
          Close
        </DialogButton>
      }
      footerRight={
        <>
          <DialogButton
            icon={Eye}
            variant="outline"
            onClick={onViewImportLog}
            disabled={!id}
          >
            View Import Log
          </DialogButton>

          <DialogButton
            icon={Download}
            variant="danger"
            onClick={onDownloadErrorReport}
            disabled={!id || failedRows === 0}
          >
            Download Error Report
          </DialogButton>
        </>
      }
    >
      {/* Import metadata */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-4 pb-5 border-b border-gray-100">
        <InfoField
          label="Import ID"
          value={
            <span className="flex items-center gap-2 flex-wrap">
              {id || "—"}
              <Pill tone="red">Failed</Pill>
            </span>
          }
        />

        <InfoField
          label="Import Type"
          value={importType || "—"}
        />

        <InfoField
          label="Uploaded By"
          value={
            <>
              {uploadedBy || "—"}
              {uploadedByRole && (
                <span className="text-gray-400 font-medium">
                  {" "}
                  ({uploadedByRole})
                </span>
              )}
            </>
          }
        />

        <InfoField
          label="Failed On"
          value={failedOn || "—"}
        />

        <InfoField
          label="Warehouse"
          value={warehouse || "—"}
        />

        <InfoField
          label="File Name"
          value={
            <div>
              <div className="font-semibold text-[#1E2740]">
                {fileName || "—"}
              </div>

              {fileSize && (
                <div className="text-[11.5px] text-gray-400 mt-0.5">
                  {fileSize}
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Error summary */}
      <div className="mt-5 border border-red-100 bg-red-50/40 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle
            size={17}
            className="text-red-500"
          />

          <div className="text-[13.5px] font-bold text-red-700">
            Error Summary
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <InfoField
            label="Total Rows"
            value={totalRows}
          />

          <InfoField
            label="Successfully Imported"
            value={importedRows}
            valueClassName="text-green-600"
          />

          <InfoField
            label="Failed Rows"
            value={failedRows}
            valueClassName="text-red-600"
          />

          <InfoField
            label="Skipped Rows"
            value={skippedRows}
            valueClassName="text-amber-600"
          />
        </div>

        <div className="border-t border-red-100 mt-4 pt-4 space-y-3">
          <div>
            <div className="text-[11.5px] font-bold text-red-600 mb-1">
              Failure Reason
            </div>

            <div className="text-[13px] text-[#1E2740]">
              {failureReason ||
                "The import could not be completed."}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-bold text-red-600 mb-1">
              Primary Issue
            </div>

            <div className="text-[13px] text-[#1E2740]">
              {primaryIssue ||
                "One or more validation errors were detected."}
            </div>
          </div>

          {expectedColumns.length > 0 && (
            <div>
              <div className="text-[11.5px] font-bold text-gray-500 mb-1">
                Expected Columns
              </div>

              <div className="text-[12.5px] text-gray-500 leading-relaxed">
                {expectedColumns.join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error type breakdown */}
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">
          Top Error Types
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {errorTypes.length === 0 ? (
            <div className="text-center text-gray-400 text-[12.5px] py-7">
              No error breakdown is available for this import.
            </div>
          ) : (
            errorTypes.map((error, index) => (
              <div
                key={`${error.label}-${index}`}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  index !== 0
                    ? "border-t border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />

                  <span className="text-[12.5px] text-[#1E2740] truncate">
                    {error.label}
                  </span>
                </div>

                <span className="text-[12.5px] font-bold text-red-600">
                  {error.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recovery message */}
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="border border-red-100 bg-red-50 rounded-xl p-4">
          <div className="text-[13px] font-bold text-red-700 mb-2">
            Fix and try again
          </div>

          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            Download the error report, correct the listed
            issues in your file, and upload it again.
          </p>
        </div>

        <div className="border border-gray-100 bg-gray-50 rounded-xl p-4">
          <div className="text-[13px] font-bold text-[#1E2740] mb-2">
            Import Record
          </div>

          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            Open the import history entry to review the
            full import log and processing details.
          </p>
        </div>
      </div>

      {/* Safety notice */}
      <Banner
        tone="blue"
        className="mt-5 flex items-start gap-2.5"
      >
        <AlertCircle
          size={15}
          className="flex-shrink-0 mt-0.5"
        />

        <span>
          No successfully rejected rows were applied to
          inventory. Existing inventory records remain
          unchanged unless this import reports successfully
          imported rows above.
        </span>
      </Banner>
    </DialogShell>
  );
};

export default ImportFailedDialog;