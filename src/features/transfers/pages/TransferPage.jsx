import { useState } from "react";
import * as XLSX from "xlsx";
import { useWarehouseLocations } from "../hooks/useWarehouseLocations.js";
import { useItemsUsers } from "../hooks/useItemsUsers.js";
import { useTransfers } from "../hooks/useTransfers.js";
import { Icon, icons } from "../components/icons.jsx";
import NewTransferModal from "../components/NewTransferModal.jsx";
import TransferFiltersBar from "../components/TransferFiltersBar.jsx";
import TransferTable from "../components/TransferTable.jsx";
import TransferSidebar from "../components/TransferSidebar.jsx";
import TransferDetailsModal from "../components/TransferDetailsModal.jsx";

export default function TransfersPage() {
  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
  } = useWarehouseLocations();
  const {
    items: catalogItems,
    users,
    loading: itemsUsersLoading,
    error: itemsUsersError,
  } = useItemsUsers();
  const {
    transfers,
    loading: transfersLoading,
    error: transfersError,
    createTransfer,
    submitTransfer,
    approveTransfer,
    rejectTransfer,
    completeTransfer,
    cancelTransfer,
    removeTransfer,
  } = useTransfers();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const setDateRange = (start, end) => {
    setDateStart(start);
    setDateEnd(end);
    setPage(1);
  };

  // The list endpoint only returns from_location_id/to_location_id (raw FKs),
  // not the eager-loaded relation objects the UI was written against. We
  // already fetch the full location list separately, so resolve locally.
  const locationsById = new Map(locations.map((l) => [String(l.id), l]));
  // Same problem for items (item_id only) and users (requested_by/created_by/
  // approved_by as raw ids) — resolve those locally too.
  const itemsById = new Map(catalogItems.map((i) => [String(i.id), i]));
  const usersById = new Map(users.map((u) => [String(u.id), u]));

  const filtered = transfers.filter((t) => {
    if (fromFilter && String(t.from_location_id) !== fromFilter) return false;
    if (toFilter && String(t.to_location_id) !== toFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (itemFilter) {
      const matches = (t.items || []).some((r) => {
        const resolved = itemsById.get(String(r.item_id));
        return (r.item?.name ?? r.item_name ?? resolved?.name ?? "")
          .toLowerCase()
          .includes(itemFilter.toLowerCase());
      });
      if (!matches) return false;
    }
    if (dateStart && dateEnd) {
      const d = new Date(t.transfer_date || t.created_at || 0);
      const s = new Date(dateStart);
      s.setHours(0, 0, 0, 0);
      const e = new Date(dateEnd);
      e.setHours(23, 59, 59, 999);
      if (d < s || d > e) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const pendingCount = transfers.filter(
    (t) => t.status === "draft" || t.status === "pending_approval",
  ).length;
  const activeFilterCount = [
    fromFilter,
    toFilter,
    statusFilter,
    itemFilter,
    dateStart && dateEnd,
  ].filter(Boolean).length;

  const handleSave = async (payload, { submit }) => {
    const created = await createTransfer(payload);
    if (submit && created?.id) {
      await submitTransfer(created.id);
    }
  };

  const handleExport = () => {
    const exportRows = filtered.map((transfer) => ({
      "Transfer ID": transfer.transfer_number ?? `TRF-${transfer.id}`,
      Date: transfer.transfer_date || transfer.created_at || "",
      "From Location":
        locationsById.get(String(transfer.from_location_id))?.name ?? "",
      "To Location":
        locationsById.get(String(transfer.to_location_id))?.name ?? "",
      Quantity: (transfer.items || []).reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
      Status: transfer.status || "",
      Notes: transfer.notes || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");
    XLSX.writeFile(workbook, "transfers.xlsx");
  };

  // Keep the modal's transfer in sync with the underlying list (e.g. after
  // an action mutates status) by always looking it up fresh from `transfers`.
  const activeTransfer = selectedTransfer
    ? (transfers.find((t) => t.id === selectedTransfer.id) ?? selectedTransfer)
    : null;

  return (
    <div className=" bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-5">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-2 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Transfers
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Move inventory items between different locations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <Icon d={icons.download} size={15} /> Export
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="relative flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
            >
              <Icon d={icons.eye} size={15} /> Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Icon d={icons.plus} size={15} /> New Transfer
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 flex-wrap">
          {(locationsError || transfersError || itemsUsersError) && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-wrap">
              <Icon d={icons.alert} size={13} />{" "}
              {locationsError || transfersError || itemsUsersError}
            </div>
          )}
        </div>

        {/* <TransferStatsCards transfers={transfers} /> */}

        {showFilters && (
          <TransferFiltersBar
            locations={locations}
            fromFilter={fromFilter}
            setFromFilter={(v) => {
              setFromFilter(v);
              setPage(1);
            }}
            toFilter={toFilter}
            setToFilter={(v) => {
              setToFilter(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            itemFilter={itemFilter}
            setItemFilter={(v) => {
              setItemFilter(v);
              setPage(1);
            }}
            dateStart={dateStart}
            dateEnd={dateEnd}
            setDateRange={setDateRange}
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
          locationsById={locationsById}
          itemsById={itemsById}
          usersById={usersById}
          onSelectTransfer={setSelectedTransfer}
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
        locations={locations}
        locationsLoading={locationsLoading}
        locationsError={locationsError}
        items={catalogItems}
        itemsLoading={itemsUsersLoading}
      />

      <TransferDetailsModal
        open={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        transfer={activeTransfer}
        locationsById={locationsById}
        itemsById={itemsById}
        usersById={usersById}
        onSubmit={submitTransfer}
        onApprove={approveTransfer}
        onReject={rejectTransfer}
        onComplete={completeTransfer}
        onCancel={cancelTransfer}
        onDelete={removeTransfer}
      />
    </div>
  );
}
