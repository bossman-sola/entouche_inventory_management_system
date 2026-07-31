import React, { useState, useEffect, useCallback } from "react";

import { apiRequest, fetchAllPages } from "../api/TransactionApi.js";
import { normalizeTransaction } from "../utils/normalize.js";
import {
  iconPaths,
  AUTO_LOGIN_EMAIL,
  AUTO_LOGIN_PASSWORD,
  PER_PAGE,
  txTypes,
} from "../constants.js";
import { Upload } from "lucide-react";
import { Icon } from "../components/icons/Icon.jsx";
import { PlusIcon } from "../components/icons/SmallIcons.jsx";
import { MetricsRow } from "../components/MetricsRow.jsx";
import { FiltersBar } from "../components/FiltersBar.jsx";
import { TransactionsTable } from "../components/TransactionsTable.jsx";
import { NewTransactionModal } from "../components/NewTransactionModal.jsx";
import { TransactionDetailsModal } from "../components/Transactiondetailsmodal .jsx";

// /api/v1/transactions is now a live, global, read-only ledger endpoint
// (filterable by item_id, warehouse_id, transaction_type, direction,
// date_from, date_to). This replaces the old per-item aggregation
// workaround that hit /items/{id}/transactions once per item.
const TRANSACTIONS_MAX_PAGES = 50;

export default function TransactionsPage() {
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [transactionsRaw, setTransactionsRaw] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [partialWarning, setPartialWarning] = useState("");

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await apiRequest("/auth/login", {
          method: "POST",
          body: { email: AUTO_LOGIN_EMAIL, password: AUTO_LOGIN_PASSWORD },
        });
        if (cancelled) return;
        setToken(json.data.access_token);
        setCurrentUserName(json.data.user?.name || AUTO_LOGIN_EMAIL);
      } catch (e) {
        if (cancelled) return;
        setAuthError(
          e.message ||
            "Could not connect to the API. Check your network access to the staging server.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError("");
    setPartialWarning("");
    try {
      const [itemsRaw, suppliersRaw, unitsRaw, warehousesRaw, transactionsRaw] =
        await Promise.all([
          fetchAllPages("/items", token),
          fetchAllPages("/suppliers", token),
          fetchAllPages("/units", token),
          fetchAllPages("/warehouses", token),
          // Global ledger - filters (item_id, warehouse_id, transaction_type,
          // direction, date_from, date_to) are supported server-side if we
          // later want to push filtering down instead of doing it client-side.
          fetchAllPages("/transactions", token, {
            maxPages: TRANSACTIONS_MAX_PAGES,
          }),
        ]);

      setTransactionsRaw(transactionsRaw)
      setCatalogItems(itemsRaw);
      setSuppliers(suppliersRaw);
      setUnits(unitsRaw);
      setWarehouses(warehousesRaw);

      // Transactions come back from the API with their related item
      // (assumed eager-loaded as `item`). Fall back to the catalog lookup
      // by item_id in case a given record doesn't have it embedded.
      const itemsById = new Map(itemsRaw.map((it) => [it.id, it]));
      const flat = transactionsRaw
        .map((raw) =>
          normalizeTransaction(raw, raw.item || itemsById.get(raw.item_id)),
        )
        .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

      setTransactions(flat);

      if (transactionsRaw.length >= TRANSACTIONS_MAX_PAGES * PER_PAGE) {
        setPartialWarning(
          `Showing the most recent ${transactionsRaw.length.toLocaleString()} transactions - there may be more in the ledger than this page can display.`,
        );
      }
    } catch (e) {
      setDataError(
        e.message ||
          "Could not reach the API. Check your connection or CORS access to the staging server.",
      );
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* date-aware filtering */
  const filtered = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = `${t.item} ${t.id} ${t.sku}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateRange && t.date) {
      if (t.date < dateRange.start || t.date > dateRange.end) return false;
    }
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Passed down to the modal so each location dropdown can load the
  // right options once a warehouse is picked.
  const fetchLocationsForWarehouse = useCallback(
    async (warehouseId) => {
      const json = await apiRequest(`/warehouses/${warehouseId}/locations`, {
        token,
      });
      return Array.isArray(json.data) ? json.data : [];
    },
    [token],
  );

  // Builds the exact request body each endpoint documents - the four
  // transaction types don't share a shape, so this branches per type
  // rather than trying to force one generic payload.
  const buildBody = (form) => {
    switch (form.type) {
      case "Receipt":
        return {
          supplier_id: form.supplier || undefined,
          warehouse_id: form.receivingWarehouseId || undefined,
          receiving_location_id: form.receivingLocationId || undefined,
          receipt_date: form.date,
          notes: form.notes || undefined,
          items: form.items
            .filter((r) => r.itemId && r.qty)
            .map((r) => ({
              item_id: r.itemId,
              quantity: +r.qty,
              unit_cost: r.unitCost ? +r.unitCost : undefined,
            })),
        };
      case "Transfer":
        return {
          from_warehouse_id: form.fromWarehouseId || undefined,
          from_location_id: form.fromLocationId || undefined,
          to_warehouse_id: form.toWarehouseId || undefined,
          to_location_id: form.toLocationId || undefined,
          transfer_date: form.date,
          notes: form.notes || undefined,
          items: form.items
            .filter((r) => r.itemId && r.qty)
            .map((r) => ({ item_id: r.itemId, quantity: +r.qty })),
        };
      case "Adjustment":
        return {
          warehouse_id: form.generalWarehouseId || undefined,
          warehouse_location_id: form.generalLocationId || undefined,
          adjustment_type: form.adjustType || undefined,
          reason: form.reason || undefined,
          adjustment_date: form.date,
          items: form.items
            .filter((r) => r.itemId && r.qty)
            .map((r) => ({ item_id: r.itemId, adjustment_quantity: +r.qty })),
        };
      case "Stock Count":
        return {
          warehouse_id: form.generalWarehouseId || undefined,
          warehouse_location_id: form.generalLocationId || undefined,
          count_date: form.date,
          notes: form.notes || undefined,
          items: form.items
            .filter((r) => r.itemId && r.qty)
            .map((r) => ({ item_id: r.itemId, counted_quantity: +r.qty })),
        };
      default:
        return {};
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    setSaveError("");

    const typeConfig = txTypes.find((t) => t.id === form.type);
    const endpointMap = {
      receipt: "/receipts",
      transfer: "/transfers",
      adjustment: "/adjustments",
      stock_count: "/stock-counts",
    };
    const endpoint = endpointMap[typeConfig.apiType];
    const body = buildBody(form);

    try {
      await apiRequest(endpoint, { method: "POST", token, body });
      setModalOpen(false);
      await loadData();
    } catch (e) {
      setSaveError(
        e.status === 422 && e.errors
          ? Object.values(e.errors).flat().join(" ")
          : e.message || "Could not save this transaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  const totalTxns = transactions.length;
  const totalReceipts = transactions.filter((t) => t.type === "Receipt").length;
  const totalTransfers = transactions.filter(
    (t) => t.type === "Transfer",
  ).length;
  const totalAdj = transactions.filter((t) => t.type === "Adjustment").length;
  const pendingCount = transactions.filter(
    (t) => t.status === "Pending",
  ).length;

  if (!token) {
    return (
      <div
        style={{
          fontFamily: "Inter,system-ui,sans-serif",
          fontSize: 13,
          color: "#1e2740",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Transactions
          </h1>
          <p
            style={{
              color: "#6b7591",
              fontSize: 12.5,
              marginTop: 3,
              margin: "3px 0 0",
            }}
          >
            View and track all inventory transactions across your organization.
          </p>
        </div>
        {authError ? (
          <div
            style={{
              padding: "12px 14px",
              background: "#fff1f0",
              border: "1px solid #ffd3ce",
              borderRadius: 10,
              fontSize: 12.5,
              color: "#c0392b",
            }}
          >
            {authError}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#9aa1b4",
              fontSize: 12.5,
              background: "#fff",
              border: "1px solid #e4e7ef",
              borderRadius: 10,
            }}
          >
            Connecting to the inventory system…
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 13,
        color: "#1e2740",
      }}
    >
      <NewTransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSaveError("");
        }}
        onSave={handleSave}
        catalogItems={catalogItems}
        units={units}
        suppliers={suppliers}
        warehouses={warehouses}
        fetchLocationsForWarehouse={fetchLocationsForWarehouse}
        saving={saving}
        saveError={saveError}
      />

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Transactions
          </h1>
          <p
            style={{
              color: "#6b7591",
              fontSize: 12.5,
              marginTop: 3,
              margin: "3px 0 0",
            }}
          >
            View and track all inventory transactions across your organization.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={loadData}
            disabled={dataLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #e4e7ef",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12.5,
              cursor: dataLoading ? "default" : "pointer",
              color: "#1e2740",
              fontWeight: 500,
            }}
          >
            <Icon d={iconPaths.refresh} size={13} stroke="#5c657a" />{" "}
            {dataLoading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #e4e7ef",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12.5,
              cursor: "pointer",
              color: "#1e2740",
              fontWeight: 500,
            }}
          >
            <Upload size={16} /> Export
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#4f6ef7",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12.5,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <PlusIcon /> New Transaction
          </button>
        </div>
      </div>

      {dataError && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            background: "#fff1f0",
            border: "1px solid #ffd3ce",
            borderRadius: 10,
            fontSize: 12.5,
            color: "#c0392b",
          }}
        >
          {dataError}
        </div>
      )}
      {!dataError && partialWarning && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            background: "#fff7ed",
            border: "1px solid #fbdba0",
            borderRadius: 10,
            fontSize: 12,
            color: "#946200",
          }}
        >
          {partialWarning}
        </div>
      )}

      <MetricsRow
        loading={dataLoading}
        totalTxns={totalTxns}
        totalReceipts={totalReceipts}
        totalTransfers={totalTransfers}
        totalAdj={totalAdj}
        pendingCount={pendingCount}
        onPendingClick={() => {
          setFilterStatus("Pending");
          setPage(1);
        }}
      />

      <FiltersBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(range) => {
          setDateRange(range);
          setIsDatePickerOpen(false);
          setPage(1);
        }}
        isDatePickerOpen={isDatePickerOpen}
        onToggleDatePicker={() => setIsDatePickerOpen((o) => !o)}
        onCloseDatePicker={() => setIsDatePickerOpen(false)}
        filterType={filterType}
        onFilterTypeChange={(v) => {
          setFilterType(v);
          setPage(1);
        }}
        filterStatus={filterStatus}
        onFilterStatusChange={(v) => {
          setFilterStatus(v);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setFilterType("");
          setFilterStatus("");
          setDateRange(null);
          setPage(1);
        }}
      />

      <TransactionsTable
        loading={dataLoading}
        visible={visible}
        totalCount={filtered.length}
        page={page}
        pages={pages}
        perPage={PER_PAGE}
        onPageChange={setPage}
        openMenuId={openMenuId}
        onToggleMenu={(id) => {
          setOpenMenuId((prev) => (prev === id ? null : id));
          setTransactionDetails(
            id ? transactionsRaw.find((t) => t.id === id) : null,
          );
        }}
        emptyMessage={
          transactions.length === 0
            ? "No transactions found for this organization yet."
            : "No transactions match your filters."
        }
      />

      {transactionDetails && (
        <TransactionDetailsModal
          transaction={transactionDetails}
          onClose={() => setTransactionDetails(null)}
        />
      )}
    </div>
  );
}
