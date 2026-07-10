import React, { useState, useEffect, useCallback } from "react";

import { apiRequest, fetchAllPages } from "../api/TransactionApi.js";
import { normalizeTransaction } from "../utils/normalize.js";
import { iconPaths, AUTO_LOGIN_EMAIL, AUTO_LOGIN_PASSWORD, PER_PAGE, txTypes } from "../constants.js";
import {
  Upload
} from 'lucide-react';
import { Icon } from "../components/icons/Icon.jsx";
import { PlusIcon } from "../components/icons/SmallIcons.jsx";
import { MetricsRow } from "../components/MetricsRow.jsx";
import { FiltersBar } from "../components/FiltersBar.jsx";
import { TransactionsTable } from "../components/TransactionsTable.jsx";
import { NewTransactionModal } from "../components/NewTransactionModal.jsx";

export default function TransactionsPage() {
  const [token, setToken]                 = useState(null);
  const [authError, setAuthError]         = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  const [modalOpen, setModalOpen]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");

  const [transactions, setTransactions]   = useState([]);
  const [catalogItems, setCatalogItems]   = useState([]);
  const [suppliers, setSuppliers]         = useState([]);
  const [units, setUnits]                 = useState([]);
  const [users, setUsers]                 = useState([]);

  const [dataLoading, setDataLoading]     = useState(false);
  const [dataError, setDataError]         = useState("");
  const [partialWarning, setPartialWarning] = useState("");

  const [filterType, setFilterType]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [openMenuId, setOpenMenuId]       = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange]         = useState(null);

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
        setAuthError(e.message || "Could not connect to the API. Check your network access to the staging server.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError("");
    setPartialWarning("");
    try {
      const [itemsRaw, suppliersRaw, unitsRaw, usersRaw] = await Promise.all([
        fetchAllPages("/items", token),
        fetchAllPages("/suppliers", token),
        fetchAllPages("/units", token),
        fetchAllPages("/users", token),
      ]);

      setCatalogItems(itemsRaw);
      setSuppliers(suppliersRaw);
      setUnits(unitsRaw);
      setUsers(usersRaw);

      // No global "list all transactions" endpoint exists in the API — aggregate
      // from each item's transaction history instead.
      const ITEM_CAP = 40;
      const itemsToFetch = itemsRaw.slice(0, ITEM_CAP);
      let warned = itemsRaw.length > ITEM_CAP;

      const results = await Promise.all(itemsToFetch.map(async (it) => {
        try {
          const json = await apiRequest(`/items/${it.id}/transactions`, { token });
          const list = Array.isArray(json.data?.data) ? json.data.data
                     : Array.isArray(json.data) ? json.data
                     : [];
          return list.map(raw => normalizeTransaction(raw, it));
        } catch (e) {
          warned = true;
          return [];
        }
      }));

      const flat = results.flat().sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
      setTransactions(flat);
      if (warned) {
        setPartialWarning(itemsRaw.length > ITEM_CAP
          ? `Showing transaction history for the first ${ITEM_CAP} of ${itemsRaw.length} items.`
          : "Some items' transaction history could not be loaded.");
      }
    } catch (e) {
      setDataError(e.message || "Could not reach the API. Check your connection or CORS access to the staging server.");
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const knownLocations = Array.from(new Set(
    transactions.flatMap(t => [t.from, t.to]).filter(l => l && l !== "—")
  )).sort();

  /* date-aware filtering */
  const filtered = transactions.filter(t => {
    if (filterType   && t.type   !== filterType)   return false;
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

  const pages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = async (form) => {
    setSaving(true);
    setSaveError("");

    const typeConfig = txTypes.find(t => t.id === form.type);
    const endpointMap = {
      receipt: "/receipts",
      transfer: "/transfers",
      adjustment: "/adjustments",
      stock_count: "/stock-counts",
    };
    const endpoint = endpointMap[typeConfig.apiType];

    const payloadItems = form.items
      .filter(r => r.itemId && r.qty)
      .map(r => ({
        item_id: r.itemId,
        quantity: r.qty,
        unit_cost: r.unitCost || undefined,
      }));

    const body = {
      date: form.date,
      reference_number: form.refNum || undefined,
      notes: form.notes || undefined,
      supplier_id: form.supplier || undefined,
      location: form.receivingLoc || form.location || undefined,
      from_location: form.fromLoc || undefined,
      to_location: form.toLoc || undefined,
      requested_by: form.requestedBy || undefined,
      reason: form.reason || undefined,
      adjustment_type: form.adjustType || undefined,
      items: payloadItems,
    };

    try {
      await apiRequest(endpoint, { method: "POST", token, body });
      setModalOpen(false);
      await loadData();
    } catch (e) {
      // The tested API reference doesn't document a create endpoint for this
      // transaction type, so the write may not be supported server-side yet.
      setSaveError(
        e.status === 404
          ? `The API has no ${endpoint} endpoint yet — this transaction type can't be saved until that's added server-side.`
          : (e.message || "Could not save this transaction.")
      );
    } finally {
      setSaving(false);
    }
  };

  const totalTxns     = transactions.length;
  const totalReceipts = transactions.filter(t => t.type === "Receipt").length;
  const totalTransfers= transactions.filter(t => t.type === "Transfer").length;
  const totalAdj      = transactions.filter(t => t.type === "Adjustment").length;
  const pendingCount  = transactions.filter(t => t.status === "Pending").length;

  if (!token) {
    return (
      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>View and track all inventory transactions across your organization.</p>
        </div>
        {authError ? (
          <div style={{ padding: "12px 14px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 10, fontSize: 12.5, color: "#c0392b" }}>
            {authError}
          </div>
        ) : (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10 }}>
            Connecting to the inventory system…
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>

      <NewTransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSaveError(""); }}
        onSave={handleSave}
        catalogItems={catalogItems}
        units={units}
        suppliers={suppliers}
        users={users}
        knownLocations={knownLocations}
        saving={saving}
        saveError={saveError}
      />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>
            View and track all inventory transactions across your organization.
            {currentUserName && <span style={{ color: "#9aa1b4" }}> · Signed in as {currentUserName}</span>}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={loadData}
            disabled={dataLoading}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: dataLoading ? "default" : "pointer", color: "#1e2740", fontWeight: 500 }}
          >
            <Icon d={iconPaths.refresh} size={13} stroke="#5c657a" /> {dataLoading ? "Refreshing…" : "Refresh"}
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: "pointer", color: "#1e2740", fontWeight: 500 }}>
            <Upload size={16}/> Export
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#4f6ef7", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            <PlusIcon /> New Transaction
          </button>
        </div>
      </div>

      {dataError && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 10, fontSize: 12.5, color: "#c0392b" }}>
          {dataError}
        </div>
      )}
      {!dataError && partialWarning && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff7ed", border: "1px solid #fbdba0", borderRadius: 10, fontSize: 12, color: "#946200" }}>
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
        onPendingClick={() => { setFilterStatus("Pending"); setPage(1); }}
      />

      <FiltersBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={(range) => { setDateRange(range); setIsDatePickerOpen(false); setPage(1); }}
        isDatePickerOpen={isDatePickerOpen}
        onToggleDatePicker={() => setIsDatePickerOpen(o => !o)}
        onCloseDatePicker={() => setIsDatePickerOpen(false)}
        filterType={filterType}
        onFilterTypeChange={(v) => { setFilterType(v); setPage(1); }}
        filterStatus={filterStatus}
        onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
        onClear={() => { setSearch(""); setFilterType(""); setFilterStatus(""); setDateRange(null); setPage(1); }}
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
        onToggleMenu={(id) => setOpenMenuId(prev => prev === id ? null : id)}
        emptyMessage={transactions.length === 0 ? "No transactions found for this organization yet." : "No transactions match your filters."}
      />
    </div>
  );
}
