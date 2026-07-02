import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { PlusIcon } from "../components/icons.jsx";
import { MetricCardsRow } from "../components/MetricCardsRow.jsx";
import { FiltersBar } from "../components/FiltersBar.jsx";
import { TransactionsTable } from "../components/TransactionsTable.jsx";
import { NewTransactionModal } from "../components/NewTransactionModal.jsx";
import { SHORT_MONTHS } from "../constants/transactionsData.js";
import { useSuppliers } from "../../suppliers/hooks/useSuppliers.js";
import { useUsers } from "../../users/hooks/useUsers.js";

/**
 * NOTE: there is no global transactions-list endpoint on the backend yet, and no
 * create-receipt/transfer/adjustment/stock-count endpoints either. `transactions`
 * therefore starts empty and "Save" only updates local state — nothing is persisted.
 * Swap `useState([])` below for a real fetch (and `handleSave` for a real POST) once
 * those endpoints exist.
 */
export default function TransactionsPage() {
  const [modalOpen, setModalOpen]         = useState(false);
  const [transactions, setTransactions]   = useState([]);
  const [filterType, setFilterType]       = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [openMenuId, setOpenMenuId]       = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange]         = useState(null);
  const PER_PAGE = 10;

  // Real data for the New Transaction modal's dropdowns
  const { suppliers } = useSuppliers();
  const { users } = useUsers();

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* date-aware filtering */
  const filtered = transactions.filter(t => {
    if (filterType   && t.type   !== filterType)   return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.item.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
    }
    if (dateRange) {
      const parts = t.date.match(/([A-Za-z]+)\s+(\d+),\s+(\d+)/);
      if (parts) {
        const mIdx = SHORT_MONTHS.indexOf(parts[1].slice(0,3));
        const d = new Date(+parts[3], mIdx !== -1 ? mIdx : 0, +parts[2]);
        if (d < dateRange.start || d > dateRange.end) return false;
      }
    }
    return true;
  });

  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data) => {
    const newTx = {
      id: `TXN-${String(Math.floor(Math.random() * 99999)).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: data.type,
      item: data.items[0]?.item || "New Item",
      sku: "NEW-001",
      from: "—", to: "Receiving Area",
      qty: data.items.reduce((s, r) => s + +r.qty, 0),
      unitCost: 0, total: 0,
      user: "System Administrator",
      status: "Pending",
    };
    setTransactions(p => [newTx, ...p]);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
    setDateRange(null);
    setPage(1);
  };

  const totalTxns     = transactions.length;
  const totalReceipts = transactions.filter(t => t.type === "Receipt").length;
  const totalTransfers= transactions.filter(t => t.type === "Transfer").length;
  const totalAdj      = transactions.filter(t => t.type === "Adjustment").length;
  const pendingCount  = transactions.filter(t => t.status === "Pending").length;

  return (
    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740" }}>

      <NewTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        suppliers={suppliers}
        users={users}
      />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Transactions</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>View and track all inventory transactions across your organization.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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

      <MetricCardsRow
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
        filterType={filterType}
        onFilterTypeChange={(v) => { setFilterType(v); setPage(1); }}
        filterStatus={filterStatus}
        onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={(range) => { setDateRange(range); setIsDatePickerOpen(false); setPage(1); }}
        isDatePickerOpen={isDatePickerOpen}
        onToggleDatePicker={() => setIsDatePickerOpen(o => !o)}
        onCloseDatePicker={() => setIsDatePickerOpen(false)}
        onClearFilters={clearFilters}
      />

      <TransactionsTable
        transactions={visible}
        page={page}
        perPage={PER_PAGE}
        totalFiltered={filtered.length}
        onPageChange={setPage}
        openMenuId={openMenuId}
        onToggleMenu={(id) => setOpenMenuId(prev => prev === id ? null : id)}
      />
    </div>
  );
}