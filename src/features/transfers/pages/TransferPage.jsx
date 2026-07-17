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

export default function TransfersPage() {
  const { token, user, status: authStatus, error: authError, retry: retryLogin } = useAccessToken();
  const { locations, loading: locationsLoading, error: locationsError } = useWarehouseLocations(token);
  const {
    transfers, loading: transfersLoading, error: transfersError,
    createTransfer, submitTransfer, approveTransfer, rejectTransfer,
    completeTransfer, cancelTransfer, removeTransfer,
  } = useTransfers(token);

  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const setDateRange = (start, end) => { setDateStart(start); setDateEnd(end); setPage(1); };

  const filtered = transfers.filter(t => {
    if (fromFilter && String(t.from_location?.id) !== fromFilter) return false;
    if (toFilter && String(t.to_location?.id) !== toFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (itemFilter) {
      const matches = (t.items || []).some(r => (r.item?.name ?? r.item_name ?? "").toLowerCase().includes(itemFilter.toLowerCase()));
      if (!matches) return false;
    }
    if (dateStart && dateEnd) {
      const d = new Date(t.transfer_date || t.created_at || 0);
      const s = new Date(dateStart); s.setHours(0, 0, 0, 0);
      const e = new Date(dateEnd); e.setHours(23, 59, 59, 999);
      if (d < s || d > e) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const pendingCount = transfers.filter(t => t.status === "draft" || t.status === "pending_approval").length;
  const activeFilterCount = [fromFilter, toFilter, statusFilter, itemFilter, dateStart && dateEnd].filter(Boolean).length;

  const handleSave = async (payload, { submit }) => {
    const created = await createTransfer(payload);
    if (submit && created?.id) {
      await submitTransfer(created.id);
    }
  };

  return (
    <div className=" bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-5">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-2 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transfers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Move inventory items between different locations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
              <Icon d={icons.download} size={15} /> Export
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="relative flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <Icon d={icons.filter} size={15} /> Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button onClick={() => setModalOpen(true)} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
              <Icon d={icons.plus} size={15} /> New Transfer
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {authStatus === "connecting" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Spinner size={13} /> Connecting to API…
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

        {showFilters && (
          <TransferFiltersBar
            locations={locations}
            fromFilter={fromFilter} setFromFilter={v => { setFromFilter(v); setPage(1); }}
            toFilter={toFilter} setToFilter={v => { setToFilter(v); setPage(1); }}
            statusFilter={statusFilter} setStatusFilter={v => { setStatusFilter(v); setPage(1); }}
            itemFilter={itemFilter} setItemFilter={v => { setItemFilter(v); setPage(1); }}
            dateStart={dateStart} dateEnd={dateEnd} setDateRange={setDateRange}
          />
        )}

        <TransferTable
          visible={visible}
          filteredCount={filtered.length}
          page={page}
          pages={pages}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
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