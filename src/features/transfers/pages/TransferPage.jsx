import { useState } from "react";
import { useAccessToken } from "../api/client.js";
import { useWarehouseLocations } from "../hooks/useWarehouseLocations.js";
import { useTransfers } from "../hooks/useTransfers.js";
import { Icon, icons } from "../components/icons.jsx";
import { Spinner } from "../components/ui.jsx";
import NewTransferModal from "../components/NewTransferModal.jsx";
import TransferStatsCards from "../components/TransferStatsCards.jsx";
import TransferFiltersBar from "../components/TransferFiltersBar.jsx";
import TransferTable from "../components/TransferTable.jsx";
import TransferSidebar from "../components/TransferSidebar.jsx";

const PER_PAGE = 10;

export default function TransfersPage() {
  const { token, user, status: authStatus, error: authError, retry: retryLogin } = useAccessToken();
  const { locations, loading: locationsLoading, error: locationsError } = useWarehouseLocations(token);
  const {
    transfers, loading: transfersLoading, error: transfersError,
    createTransfer, submitTransfer, approveTransfer, rejectTransfer,
    completeTransfer, cancelTransfer, removeTransfer,
  } = useTransfers(token);

  const [modalOpen, setModalOpen] = useState(false);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = transfers.filter(t =>
    (!fromFilter || String(t.from_location?.id) === fromFilter) &&
    (!toFilter || String(t.to_location?.id) === toFilter) &&
    (!statusFilter || t.status === statusFilter)
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pendingCount = transfers.filter(t => t.status === "draft" || t.status === "pending_approval").length;
  const totalQtyTransferred = transfers.reduce((sum, t) => sum + (t.items || []).reduce((s, r) => s + (Number(r.quantity) || 0), 0), 0);

  const handleSave = async (payload, { submit }) => {
    const created = await createTransfer(payload);
    if (submit && created?.id) {
      await submitTransfer(created.id);
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-5">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-2 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transfers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Move inventory items between different locations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Icon d={icons.download} size={15} /> Export
            </button>
            <button onClick={() => setModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              <Icon d={icons.plus} size={15} /> New Transfer
            </button>
          </div>
        </div>

        {/* Connection status */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {authStatus === "connecting" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Spinner size={13} /> Connecting to API…
            </span>
          )}
          {authStatus === "ok" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected as {user?.name}
            </span>
          )}
          {authStatus === "error" && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-wrap">
              <Icon d={icons.lock} size={13} /> {authError || "Could not connect to the API."}
              <button onClick={() => retryLogin()} className="ml-1 underline">Retry</button>
            </div>
          )}
          {authStatus === "ok" && (locationsError || transfersError) && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-wrap">
              <Icon d={icons.alert} size={13} /> {locationsError || transfersError}
            </div>
          )}
        </div>

        <TransferStatsCards transfers={transfers} />

        <TransferFiltersBar
          locations={locations}
          fromFilter={fromFilter} setFromFilter={v => { setFromFilter(v); setPage(1); }}
          toFilter={toFilter} setToFilter={v => { setToFilter(v); setPage(1); }}
          statusFilter={statusFilter} setStatusFilter={v => { setStatusFilter(v); setPage(1); }}
        />

        <TransferTable
          visible={visible}
          filteredCount={filtered.length}
          page={page}
          pages={pages}
          perPage={PER_PAGE}
          setPage={setPage}
          loading={transfersLoading && transfers.length === 0}
          onSubmit={submitTransfer}
          onApprove={approveTransfer}
          onReject={rejectTransfer}
          onComplete={completeTransfer}
          onCancel={cancelTransfer}
          onDelete={removeTransfer}
        />
      </div>

      <TransferSidebar
        transfers={transfers}
        pendingCount={pendingCount}
        totalQty={totalQtyTransferred}
        onNewTransfer={() => setModalOpen(true)}
      />

      <NewTransferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        token={token}
        locations={locations}
        locationsLoading={locationsLoading}
        locationsError={locationsError}
      />
    </div>
  );
}