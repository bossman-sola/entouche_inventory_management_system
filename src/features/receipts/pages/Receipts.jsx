import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import AddNewReceipt from "../components/AddNewReceipt";
import ReceiptDetails from "../components/ReceiptDetails";
import DateRangePicker from "../components/DateRangePicker";
import {
  listSuppliers,
  listReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  receiveReceipt,
  cancelReceipt,
  mapApiReceipt,
  packReceiptNotes,
} from "../../../lib/api.js";
import {
  Upload
} from 'lucide-react';

function parseNaira(str) {
  return Number(String(str).replace(/[₦,]/g, "")) || 0;
}
function fmtNaira(n) {
  return "₦" + Math.round(Number(n) || 0).toLocaleString("en-NG");
}

function fmtDateDisplay(iso) {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusStyle = {
  Received: { bg: "#e6faf3", color: "#16a369" },
  Draft: { bg: "#fff7ed", color: "#c27a0a" },
  Cancelled: { bg: "#fff1f0", color: "#c0392b" },
};

const SearchSm = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const CalIcon = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const FilterIcon = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
const ChevDown = ({ color = "#9aa1b4" }) => (<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><polyline points="6 9 12 15 18 9" /></svg>);
const SortIcon = () => (<svg style={{ verticalAlign: "-2px", display: "inline" }} width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}><polyline points="8 9 12 5 16 9" /><polyline points="16 15 12 19 8 15" /></svg>);
const DotsIcon = () => (<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth={2}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>);
const DownloadIcon = () => (<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const PlusIcon = () => (<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const ChevLeft = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>);
const ChevRight = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>);
const EyeIcon = () => (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);

const PagBtn = ({ children, active, muted }) => (
  <div style={{
    width: 30, height: 30,
    background: active ? "#4f6ef7" : "#fff",
    border: active ? "none" : "1px solid #e4e7ef",
    borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: active ? "#fff" : muted ? "#6b7591" : "#1e2740",
    fontSize: 12.5, fontWeight: active ? 600 : 400,
    cursor: "pointer", userSelect: "none",
  }}>{children}</div>
);

const MetricCard = ({ iconBg, icon, label, value, sub, subAccent, onClick }) => (
  <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 40, height: 40, background: iconBg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ color: "#6b7591", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: String(value).length > 8 ? 16 : 21, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div onClick={onClick} style={{ fontSize: 10.5, color: subAccent ? "#4f6ef7" : "#6b7591", marginTop: 2, fontWeight: subAccent ? 500 : 400, cursor: subAccent ? "pointer" : "default" }}>{sub}</div>
    </div>
  </div>
);



export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);

  const [supplierOptions, setSupplierOptions] = useState([]); 
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [detailsReceipt, setDetailsReceipt] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null); 

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null); 
  const dateBtnRef = useRef(null);

  const [receiptsError, setReceiptsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null); 

  const refreshReceipts = () => {
    setLoadingReceipts(true);
    setReceiptsError("");
    return listReceipts()
      .then((rows) => setReceipts((rows || []).map(mapApiReceipt)))
      .catch((err) => setReceiptsError(err.message || "Failed to load receipts."))
      .finally(() => setLoadingReceipts(false));
  };

  
  useEffect(() => {
    refreshReceipts();
    
  }, []);

  
  useEffect(() => {
    let cancelled = false;
    setLoadingSuppliers(true);
    listSuppliers()
      .then((rows) => { if (!cancelled) setSupplierOptions(rows || []); })
      .catch(() => { if (!cancelled) setSupplierOptions([]); })
      .finally(() => { if (!cancelled) setLoadingSuppliers(false); });
    return () => { cancelled = true; };
  }, []);

  
  useEffect(() => {
    const close = () => { setOpenMenuId(null); setMenuPos(null); };
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  
  const toApiReceiptPayload = (form) => ({
    supplier_id: Number(form.supplierId),
    warehouse_id: Number(form.warehouseId),
    receiving_location_id: Number(form.receivingLocationId),
    receipt_date: form.date,
    notes: packReceiptNotes(form.poNumber, form.notes),
    items: form.items.map((it) => ({
      item_id: it.id,
      quantity: Number(it.qty) || 0,
      unit_cost: Number(it.cost) || 0,
    })),
  });

 
  const handleSaveReceipt = async (form) => {
    setActionError("");
    try {
      if (form.id) {
        await updateReceipt(form.id, toApiReceiptPayload(form));
      } else {
        await createReceipt(toApiReceiptPayload(form));
      }
      await refreshReceipts();
      setEditingReceipt(null);
    } catch (err) {
      setActionError(err.message || "Failed to save receipt.");
    }
  };

  
  const handleReceive = async (receipt) => {
    setActioningId(receipt.id);
    setActionError("");
    try {
      await receiveReceipt(receipt.id);
      await refreshReceipts();
    } catch (err) {
      setActionError(err.message || "Failed to receive this receipt.");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelReceipt = async (receipt) => {
    setActioningId(receipt.id);
    setActionError("");
    try {
      await cancelReceipt(receipt.id);
      await refreshReceipts();
    } catch (err) {
      setActionError(err.message || "Failed to cancel this receipt.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteReceipt = async (receipt) => {
    if (!window.confirm(`Delete draft receipt ${receipt.no}? This can't be undone.`)) return;
    setActioningId(receipt.id);
    setActionError("");
    try {
      await deleteReceipt(receipt.id);
      setReceipts(prev => prev.filter(r => r.id !== receipt.id));
    } catch (err) {
      setActionError(err.message || "Failed to delete this receipt.");
    } finally {
      setActioningId(null);
    }
  };

  const openNewReceiptModal = () => { setEditingReceipt(null); setIsAddModalOpen(true); };
  const openEditReceiptModal = (receipt) => { setDetailsReceipt(null); setEditingReceipt(receipt); setIsAddModalOpen(true); };

  
  const suppliers = ["All Suppliers", ...supplierOptions.map(s => s.name)];

  const filtered = receipts.filter(r => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const hit = r.no.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q) || (r.ref || "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (supplierFilter !== "All Suppliers" && r.supplier !== supplierFilter) return false;
    if (statusFilter !== "All Statuses" && r.status !== statusFilter) return false;
    if (dateRange) {
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return true;
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (day < dateRange.start || day > dateRange.end) return false;
    }
    return true;
  });

  const dateLabel = dateRange
    ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "All dates";

  /* ── derived metrics ── */
  const now = new Date();
  const thisMonthCount = receipts.filter(r => {
    const d = new Date(r.date);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  /* ── export ── */
  const handleExport = () => {
    const exportRows = filtered.map(r => ({
      "Receipt No.": r.no,
      "Receipt Date": r.date,
      Supplier: r.supplier,
      "Reference / PO No.": r.ref,
      "Received By": r.by,
      Items: r.items.length,
      Quantity: r.qty,
      "Total Value": r.val,
      Status: r.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipts");
    XLSX.writeFile(workbook, "Inventory_Receipts_Report.xlsx");
  };

  return (
    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontSize: 13, color: "#1e2740", position: "relative", minHeight: "100%" }}>

      <AddNewReceipt
        isOpen={isAddModalOpen}
        editData={editingReceipt}
        receiptNumber="Auto-generated on save"
        onClose={() => { setIsAddModalOpen(false); setEditingReceipt(null); }}
        onSave={handleSaveReceipt}
      />

      <ReceiptDetails
        isOpen={!!detailsReceipt}
        receipt={detailsReceipt}
        onClose={() => setDetailsReceipt(null)}
        onEdit={openEditReceiptModal}
      />

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Receipts</h1>
          <p style={{ color: "#6b7591", fontSize: 12.5, marginTop: 3, margin: "3px 0 0" }}>View and manage all goods received into the warehouse</p>
          {actionError && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff1f0", border: "1px solid #ffd0ce", borderRadius: 7, fontSize: 12, color: "#c0392b", display: "flex", alignItems: "center", gap: 8 }}>
              {actionError}
              <span style={{ marginLeft: "auto", cursor: "pointer", fontWeight: 600 }} onClick={() => setActionError("")}>×</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, cursor: filtered.length === 0 ? "not-allowed" : "pointer", color: filtered.length === 0 ? "#b0b8cc" : "#1e2740", fontWeight: 500 }}
          >
            <Upload size={16} /> Export
          </button>

          <button
            onClick={openNewReceiptModal}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#4f6ef7", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12.5, color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            <PlusIcon /> New Receipt
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        <MetricCard iconBg="#eef2ff" icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>} label="Total Receipts" value={receipts.length} sub="All time" />
        <MetricCard iconBg="#e6faf3" icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>} label="Total Qty Received" value={receipts.reduce((a, r) => a + r.qty, 0).toLocaleString()} sub="All time" />
        <MetricCard iconBg="#f3f0ff" icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} label="Total Value" value={fmtNaira(receipts.reduce((a, r) => a + parseNaira(r.val), 0))} sub="All time" />
        <MetricCard iconBg="#fff7ed" icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} label="This Month" value={thisMonthCount} sub={thisMonthLabel} />
        <MetricCard iconBg="#fff1f0" icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f25c54" strokeWidth={2}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8l5 3-5 3V8z" /></svg>} label="Draft Receipts" value={receipts.filter(r => r.status === "Draft").length} sub="View drafts" subAccent onClick={() => setStatusFilter("Draft")} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: "14px 16px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 280 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><SearchSm /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search receipts by reference, supplier..."
            style={{ width: "100%", padding: "7px 10px 7px 30px", background: "#f4f6fb", border: "1px solid #e4e7ef", borderRadius: 7, color: "#1e2740", fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Date Range filter */}
        <div style={{ position: "relative" }} ref={dateBtnRef}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Date Range</span>
            <div
              onClick={(e) => { e.stopPropagation(); setIsDatePickerOpen(o => !o); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              <CalIcon /> {dateLabel} <ChevDown />
            </div>
          </div>
          {isDatePickerOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 400 }} onClick={() => setIsDatePickerOpen(false)} />
              <DateRangePicker
                isOpen={isDatePickerOpen}
                initialStart={dateRange?.start}
                initialEnd={dateRange?.end}
                onClose={() => setIsDatePickerOpen(false)}
                onApply={(start, end) => { setDateRange({ start, end }); setIsDatePickerOpen(false); }}
              />
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Supplier</span>
          <div style={{ position: "relative" }}>
            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              disabled={loadingSuppliers}
              style={{ appearance: "none", padding: "7px 28px 7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: loadingSuppliers ? "not-allowed" : "pointer", minWidth: 130, color: "#1e2740", fontFamily: "inherit" }}
            >
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 12, color: "#6b7591", whiteSpace: "nowrap" }}>Status</span>
          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ appearance: "none", padding: "7px 28px 7px 10px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", minWidth: 120, color: "#1e2740", fontFamily: "inherit" }}
            >
              {["All Statuses", "Draft", "Received", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
          </div>
        </div>

        <div
          onClick={() => { setSearch(""); setSupplierFilter("All Suppliers"); setStatusFilter("All Statuses"); setDateRange(null); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#fff", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12, cursor: "pointer", marginLeft: "auto", whiteSpace: "nowrap" }}
        >
          <FilterIcon /> Clear Filters
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e4e7ef", background: "#f8f9fb" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Receipt No. <SortIcon /></th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Receipt Date <SortIcon /></th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Supplier <SortIcon /></th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Reference / PO No. <SortIcon /></th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Received By <SortIcon /></th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#6b7591", fontWeight: 500 }}>Items</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#6b7591", fontWeight: 500 }}>Quantity</th>
                <th style={{ textAlign: "right", padding: "12px 8px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap" }}>Total Value <SortIcon /></th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#6b7591", fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: "center", padding: "12px 8px", color: "#6b7591", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingReceipts ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>
                    Loading receipts…
                  </td>
                </tr>
              ) : receiptsError ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px 20px", textAlign: "center", color: "#c0392b", fontSize: 12.5 }}>
                    {receiptsError}{" "}
                    <span style={{ color: "#4f6ef7", cursor: "pointer", fontWeight: 500 }} onClick={refreshReceipts}>Retry</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>
                    {receipts.length === 0
                      ? 'No receipts yet. Click "New Receipt" to record your first one.'
                      : "No receipts match your filters."}
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const s = statusStyle[r.status] || statusStyle.Draft;
                const busy = actioningId === r.id;
                return (
                  <tr key={r.id}
                    style={{ borderBottom: "1px solid #f4f6fb", transition: "background .15s", opacity: busy ? 0.6 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "#4f6ef7", whiteSpace: "nowrap", cursor: "pointer" }} onClick={() => setDetailsReceipt(r)}>{r.no}</td>
                    <td style={{ padding: "12px 8px", color: "#6b7591", whiteSpace: "nowrap" }}>{fmtDateDisplay(r.date)}</td>
                    <td style={{ padding: "12px 8px", fontWeight: 500, whiteSpace: "nowrap" }}>{r.supplier}</td>
                    <td style={{ padding: "12px 8px", color: "#6b7591", whiteSpace: "nowrap" }}>{r.ref}</td>
                    <td style={{ padding: "12px 8px", color: "#6b7591", whiteSpace: "nowrap" }}>{r.by}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 500 }}>{r.items.length}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 500 }}>{r.qty}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{r.val}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500 }}>{r.status}</span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", position: "relative" }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openMenuId === r.id) {
                            setOpenMenuId(null);
                            setMenuPos(null);
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPos({ top: rect.bottom + 4, left: rect.right - 170 });
                          setOpenMenuId(r.id);
                        }}
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: busy ? "not-allowed" : "pointer", borderRadius: 6, margin: "0 auto", transition: "background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <DotsIcon />
                      </div>

                      {openMenuId === r.id && menuPos && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 1000,
                            background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8,
                            boxShadow: "0 8px 24px rgba(20,25,50,0.14)", minWidth: 170, padding: 4,
                            textAlign: "left",
                          }}
                        >
                          <div
                            onClick={() => { setDetailsReceipt(r); setOpenMenuId(null); }}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#1e2740", fontWeight: 500 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <EyeIcon /> View Details
                          </div>

                          {r.canEdit && (
                            <div
                              onClick={() => { openEditReceiptModal(r); setOpenMenuId(null); }}
                              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#1e2740", fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              Edit Receipt
                            </div>
                          )}

                          {r.canReceive && (
                            <div
                              onClick={() => { setOpenMenuId(null); handleReceive(r); }}
                              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#16a369", fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              Receive Stock
                            </div>
                          )}

                          {r.canCancel && (
                            <div
                              onClick={() => { setOpenMenuId(null); handleCancelReceipt(r); }}
                              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#c27a0a", fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              Cancel Receipt
                            </div>
                          )}

                          {r.canDelete && (
                            <div
                              onClick={() => { setOpenMenuId(null); handleDeleteReceipt(r); }}
                              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#f25c54", fontWeight: 500 }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              Delete Receipt
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e4e7ef", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#6b7591" }}>Showing {filtered.length} of {receipts.length} receipts</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <PagBtn><ChevLeft /></PagBtn>
            <PagBtn active>1</PagBtn>
            <PagBtn><ChevRight /></PagBtn>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, cursor: "pointer", marginLeft: 8 }}>
              10 / page <ChevDown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}