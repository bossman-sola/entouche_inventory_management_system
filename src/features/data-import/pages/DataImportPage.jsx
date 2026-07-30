import { useState } from "react";
import { Icon, icons } from "../../../lib/icons";
import { useInventoryApi, DEFAULT_EMAIL, DEFAULT_PASSWORD } from "../../../lib/useInventoryApi";
import { useImportFlow } from "../../../lib/useImportFlow";
import { ConnectionStatus, LoginForm } from "../components/ConnectionStatus";
import { StatsGrid } from "../components/StatsGrid";
import { ImportTemplates } from "../components/ImportTemplates";
import { NewImportPanel } from "../components/NewImportPanel";
import { ImportCategories } from "../components/ImportCategories";
import { ImportHistoryTable } from "../components/ImportHistoryTable";
import { GuidelinesModal } from "../components/GuidelinesModal";

export default function DataImportPage() {
  const {
    currentUser, authStatus, authError, login, refData,
    warehouses, itemsTotal, usersTotal, refLoading, loadReferenceData,
  } = useInventoryApi();

  const [importType, setImportType] = useState("Items");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [fileFormat, setFileFormat] = useState("CSV");
  const [encoding, setEncoding] = useState("UTF-8");
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const flow = useImportFlow({
    currentUser, refData, importType, loadReferenceData,
    selectedWarehouseId, selectedLocationId,
  });
  const { history, fileRef } = flow;

  const isAuthed = authStatus === "ok" && !!currentUser;
  const successCount = history.filter(h => h.status === "Completed").length;
  const failedCount = history.filter(h => h.status === "Failed").length;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-2 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Data Import</h1>
          <p className="text-sm text-gray-500 mt-0.5">Import initial data into the system. Download templates, upload your files and validate before importing.</p>
        </div>
        <button onClick={() => setGuidelinesOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
          <Icon d={icons.book} size={14} /> Import Guidelines
        </button>
      </div>

      <ConnectionStatus
        authStatus={authStatus}
        authError={authError}
        currentUser={currentUser}
        refLoading={refLoading}
        onRetry={() => login(DEFAULT_EMAIL, DEFAULT_PASSWORD)}
      />

      {!isAuthed && authStatus === "error" && <LoginForm onLogin={login} />}

      <StatsGrid history={history} successCount={successCount} failedCount={failedCount} itemsTotal={itemsTotal} usersTotal={usersTotal} />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left column */}
        <div className="w-full lg:w-[560px] shrink-0 space-y-4">
          <ImportTemplates />
          <NewImportPanel
            isAuthed={isAuthed}
            importType={importType} setImportType={setImportType}
            warehouses={warehouses}
            selectedWarehouseId={selectedWarehouseId} setSelectedWarehouseId={setSelectedWarehouseId}
            selectedLocationId={selectedLocationId} setSelectedLocationId={setSelectedLocationId}
            fileFormat={fileFormat} setFileFormat={setFileFormat}
            encoding={encoding} setEncoding={setEncoding}
            flow={flow}
          />
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 space-y-4">
          <ImportCategories
            itemsTotal={itemsTotal}
            usersTotal={usersTotal}
            history={history}
            onNewImportClick={() => fileRef.current?.click()}
          />
          <ImportHistoryTable history={history} />
        </div>
      </div>

      {guidelinesOpen && <GuidelinesModal onClose={() => setGuidelinesOpen(false)} />}
    </div>
  );
}