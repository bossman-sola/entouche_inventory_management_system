import { Icon, icons } from "../../../lib/icons";
import { CREATABLE_TYPES } from "../../../lib/validation";
import { FileDropzone } from "./FileDropzone";
import { ValidationSummary } from "./ValidationSummary";
import { ImportErrorsTable } from "./ImportErrorsTable";
import { DataPreviewTable } from "./DataPreviewTable";
import { ImportConfiguration } from "./ImportConfiguration";

export function NewImportPanel({
  isAuthed, importType, setImportType,
  warehouses, selectedWarehouseId, setSelectedWarehouseId,
  selectedLocationId, setSelectedLocationId,
  fileFormat, setFileFormat, encoding, setEncoding,
  flow,
}) {
  const {
    file, validated, validating, importing, importProgress, importDone,
    parsedData, errors, parseError, fileRef,
    handleFile, handleValidate, handleImport, handleCancel,
  } = flow;

  const notCreatable = !CREATABLE_TYPES.includes(importType);
  const inventoryNeedsDestination =
    importType === "Inventory" && !selectedWarehouseId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      <h2 className="font-semibold text-gray-800 mb-1">New Import</h2>
      <p className="text-xs text-gray-500 mb-4">Upload your file and configure import settings.</p>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <FileDropzone file={file} validated={validated} fileRef={fileRef} onFile={handleFile} onCancel={handleCancel} />

          {notCreatable && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <Icon d={icons.info} size={16} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700">
                Users import isn't wired up yet — the API only supports listing users, not creating them.
              </p>
            </div>
          )}

          {inventoryNeedsDestination && file && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <Icon d={icons.info} size={16} className="text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                Select a warehouse (right panel) to import inventory.
              </p>
            </div>
          )}

          {parseError && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <Icon d={icons.alert} size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">{parseError}</p>
            </div>
          )}

          {validated && parsedData && <ValidationSummary parsedData={parsedData} />}
          {validated && <ImportErrorsTable errors={errors} />}
          {validated && <DataPreviewTable parsedData={parsedData} />}

          {file && parsedData && (
            <div className="flex gap-2 mt-3">
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">Cancel</button>
              {!validated ? (
                <button onClick={handleValidate} disabled={validating || !isAuthed} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors">
                  {validating ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" /></svg> Validating...</>
                  ) : "Validate File"}
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  disabled={importing || notCreatable || inventoryNeedsDestination || errors.length >= (parsedData?.total || 0)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {importing ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40 20" /></svg> Importing {importProgress ? `${importProgress.current}/${importProgress.total}` : "..."}</>
                  ) : "Import Valid Data"}
                </button>
              )}
            </div>
          )}

          {importDone && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} className="text-green-600 shrink-0" />
              <p className="text-sm text-green-700 font-medium">Import finished - records were written to the live API.</p>
            </div>
          )}
        </div>

        <ImportConfiguration
          importType={importType} setImportType={setImportType}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId} setSelectedWarehouseId={setSelectedWarehouseId}
          selectedLocationId={selectedLocationId} setSelectedLocationId={setSelectedLocationId}
          fileFormat={fileFormat} setFileFormat={setFileFormat}
          encoding={encoding} setEncoding={setEncoding}
          onFieldChange={handleCancel}
        />
      </div>
    </div>
  );
}