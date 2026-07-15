import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { api } from "../../../shared/api/entoucheApi";

const REPORT_DEFS = [
  { id: 1, icon: "doc", name: "Inventory Balance Report", cat: "Inventory Reports", catColor: "#eef2ff", catText: "#4f6ef7", desc: "Current inventory balance across all locations", format: "PDF, Excel", dataKey: "items", systemGenerated: false, available: true },
  { id: 2, icon: "cycle", name: "Inventory Movement Report", cat: "Transaction Reports", catColor: "#e6faf3", catText: "#16a369", desc: "Summary of all inventory movements", format: "PDF, Excel", dataKey: "movement", systemGenerated: false, available: true },
  { id: 3, icon: "alert", name: "Low Stock Report", cat: "Stock Reports", catColor: "#fff7ed", catText: "#c27a0a", desc: "Items below minimum stock level", format: "PDF, Excel", dataKey: "low_stock", systemGenerated: true, available: true },
  { id: 4, icon: "dollar", name: "Stock Valuation Report", cat: "Inventory Reports", catColor: "#eef2ff", catText: "#4f6ef7", desc: "Inventory valuation by cost and category", format: "PDF, Excel", dataKey: "stock_summary", systemGenerated: false, available: true },
  { id: 5, icon: "list", name: "Transaction Detail Report", cat: "Transaction Reports", catColor: "#e6faf3", catText: "#16a369", desc: "Detailed list of all transactions", format: "Excel, CSV", dataKey: "transactions", systemGenerated: false, available: true },
  { id: 6, icon: "trend", name: "Stock Trend Report", cat: "Stock Reports", catColor: "#fff7ed", catText: "#c27a0a", desc: "Stock trend analysis over time", format: "PDF, Excel", dataKey: "movement", systemGenerated: true, available: true },
  { id: 7, icon: "user", name: "User Activity Report", cat: "User & Activity Reports", catColor: "#f3f0ff", catText: "#8b5cf6", desc: "User activities and system actions", format: "PDF, Excel", dataKey: "users", systemGenerated: false, available: true },
  { id: 8, icon: "doc", name: "Audit Log Report", cat: "User & Activity Reports", catColor: "#f3f0ff", catText: "#8b5cf6", desc: "Complete audit trail and logs", format: "PDF, Excel", dataKey: "audit_logs", systemGenerated: true, available: true },
  { id: 9, icon: "cycle", name: "Receipt Summary Report", cat: "Transaction Reports", catColor: "#e6faf3", catText: "#16a369", desc: "Summary of all goods received", format: "PDF, Excel", dataKey: "receipts", systemGenerated: false, available: true },
  { id: 10, icon: "alert", name: "Reorder Report", cat: "Stock Reports", catColor: "#fff7ed", catText: "#c27a0a", desc: "Items that need to be reordered", format: "PDF, Excel", dataKey: "low_stock", systemGenerated: true, available: true },
  { id: 11, icon: "dollar", name: "Transfer Report", cat: "Transaction Reports", catColor: "#e6faf3", catText: "#16a369", desc: "Summary of all inventory transfers", format: "PDF, Excel", dataKey: "transfers", systemGenerated: false, available: true },
  { id: 12, icon: "user", name: "Supplier Report", cat: "Inventory Reports", catColor: "#eef2ff", catText: "#4f6ef7", desc: "Inventory received by supplier", format: "PDF, Excel", dataKey: "suppliers", systemGenerated: false, available: true },
  { id: 13, icon: "list", name: "Adjustment Report", cat: "Transaction Reports", catColor: "#e6faf3", catText: "#16a369", desc: "All stock adjustments and reasons", format: "Excel, CSV", dataKey: "adjustments", systemGenerated: true, available: true },
  { id: 14, icon: "trend", name: "Category Report", cat: "Inventory Reports", catColor: "#eef2ff", catText: "#4f6ef7", desc: "Inventory broken down by category", format: "PDF, Excel", dataKey: "categories", systemGenerated: false, available: true },
  { id: 15, icon: "doc", name: "Warehouse Report", cat: "Stock Reports", catColor: "#fff7ed", catText: "#c27a0a", desc: "Stock levels per warehouse and location", format: "PDF, Excel", dataKey: "warehouses", systemGenerated: false, available: true },
];

const CATS = ["All Report Types", "Inventory Reports", "Transaction Reports", "Stock Reports", "User & Activity Reports"];
const FORMATS = ["All Formats", "PDF", "Excel", "CSV"];
const PAGE_SIZE = 8;

const ICON_MAP = {
  doc:    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  cycle:  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  alert:  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  dollar: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  list:   <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  trend:  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  user:   <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const CAT_ICON_MAP = {
  "Inventory Reports":     { icon:<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color:"#4f6ef7", bg:"#eef2ff" },
  "Transaction Reports":   { icon:<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={1.8}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, color:"#22c27e", bg:"#e6faf3" },
  "Stock Reports":         { icon:<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={1.8}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, color:"#f59e0b", bg:"#fff7ed" },
  "User & Activity Reports":{ icon:<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, color:"#8b5cf6", bg:"#f3f0ff" },
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function CalPicker({ value, onChange, onClose }) {
  const [view, setView] = useState(value.start || new Date());
  const [lStart, setLS] = useState(value.start);
  const [lEnd,   setLE] = useState(value.end);
  const [hover,  setHov] = useState(null);
  const [phase,  setPhase] = useState(null);
  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y,m,1).getDay(), dim = new Date(y,m+1,0).getDate();
  const days = Array(first).fill(null).concat(Array.from({length:dim},(_,i)=>new Date(y,m,i+1)));
  const inR = d => { if(!d||!lStart) return false; const e=lEnd||hover; return e && d>lStart && d<e; };
  const isSt = d => d && lStart && d.toDateString()===lStart.toDateString();
  const isEn = d => d && lEnd   && d.toDateString()===lEnd.toDateString();
  const fmtD = d => d ? d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const click = d => {
    if(!d) return;
    if(!lStart||(lStart&&lEnd)){ setLS(d); setLE(null); setPhase("end"); }
    else { if(d<lStart){setLE(lStart);setLS(d);}else setLE(d); setPhase(null); }
  };
  return (
    <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",zIndex:1000,padding:20,minWidth:300,maxWidth:"calc(100vw - 24px)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <button onClick={()=>setView(new Date(y,m-1,1))} style={{ border:"1px solid #e4e7ef",borderRadius:6,width:28,height:28,cursor:"pointer",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span style={{ fontWeight:600,fontSize:13,color:"#1e2740" }}>{MONTHS_SHORT[m]} {y}</span>
        <button onClick={()=>setView(new Date(y,m+1,1))} style={{ border:"1px solid #e4e7ef",borderRadius:6,width:28,height:28,cursor:"pointer",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{ textAlign:"center",fontSize:11,color:"#9aa1b4",fontWeight:600,padding:"3px 0" }}>{d}</div>)}
        {days.map((d,i)=>(
          <div key={i} onClick={()=>click(d)} onMouseEnter={()=>d&&phase&&setHov(d)} onMouseLeave={()=>setHov(null)}
            style={{ textAlign:"center",padding:"5px 0",fontSize:12,borderRadius:6,cursor:d?"pointer":"default",
              background:isSt(d)||isEn(d)?"#4f6ef7":inR(d)?"#eef2ff":"transparent",
              color:isSt(d)||isEn(d)?"#fff":d?"#1e2740":"transparent",fontWeight:isSt(d)||isEn(d)?600:400 }}>
            {d?d.getDate():""}
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid #f0f2f7",paddingTop:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
        <div style={{ fontSize:11,color:"#6b7591" }}>{lStart?fmtD(lStart):"Start"}{lEnd?` – ${fmtD(lEnd)}`:""}</div>
        <div style={{ display:"flex",gap:6 }}>
          <button onClick={onClose} style={{ padding:"5px 12px",border:"1px solid #e4e7ef",borderRadius:6,fontSize:12,cursor:"pointer",background:"#fff",fontFamily:"inherit" }}>Cancel</button>
          <button onClick={()=>{onChange({start:lStart,end:lEnd||lStart});onClose();}} style={{ padding:"5px 12px",border:"none",borderRadius:6,fontSize:12,cursor:"pointer",background:"#4f6ef7",color:"#fff",fontFamily:"inherit",fontWeight:600 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

const Toast = ({msg})=>(<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#1e2740",color:"#fff",padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:500,zIndex:99999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>{msg}</div>);

/* ─── data helpers ─── */
const fmtDateTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
};

const latestTimestamp = (arr, field = "updated_at") => {
  if (!arr || !arr.length) return null;
  return arr.reduce((max, row) => {
    const t = row?.[field] ? new Date(row[field]).getTime() : NaN;
    return !isNaN(t) && t > max ? t : max;
  }, 0) || null;
};

function asArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.transactions)) return res.transactions;
  if (Array.isArray(res.results)) return res.results;
  return [];
}

export default function Reports() {
  const [catFilter,  setCatFilter]  = useState("All Report Types");
  const [warehouse,  setWarehouse]  = useState("All Locations");
  const [format,     setFormat]     = useState("All Formats");
  const [search,     setSearch]     = useState("");
  const [dateRange,  setDateRange]  = useState({ start: new Date(Date.now()-6*864e5), end: new Date() });
  const [showCal,    setShowCal]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [toast,      setToast]      = useState(null);
  const calRef = useRef();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stockBalances, setStockBalances] = useState({}); // itemId -> balance
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [movementReport, setMovementReport] = useState([]);
  const [stockSummaryReport, setStockSummaryReport] = useState([]);
  const [lowStockReport, setLowStockReport] = useState([]);

  useEffect(()=>{ const h=(e)=>{ if(calRef.current&&!calRef.current.contains(e.target)) setShowCal(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [
        meRes, itemsRes, categoriesRes, suppliersRes, usersRes,
        warehousesRes, transfersRes, adjustmentsRes, receiptsRes, auditLogsRes,
        movementRes, stockSummaryRes, lowStockRes,
      ] = await Promise.allSettled([
        api.me(),
        api.listItems(),
        api.listCategories(),
        api.listSuppliers(),
        api.listUsers(),
        api.listWarehouses(),
        api.listTransfers(),
        api.listAdjustments(),
        api.listReceipts(),
        api.listAuditLogs(),
        api.getMovementReport(),
        api.getStockSummaryReport(),
        api.getLowStockReport(),
      ]);

      const itemsData = itemsRes.status === "fulfilled" ? (itemsRes.value || []) : [];
      setCurrentUser(meRes.status === "fulfilled" ? meRes.value : null);
      setItems(itemsData);
      setCategories(categoriesRes.status === "fulfilled" ? (categoriesRes.value || []) : []);
      setSuppliers(suppliersRes.status === "fulfilled" ? (suppliersRes.value || []) : []);
      setUsers(usersRes.status === "fulfilled" ? (usersRes.value || []) : []);
      setWarehouses(warehousesRes.status === "fulfilled" ? (warehousesRes.value || []) : []);
      setTransfers(transfersRes.status === "fulfilled" ? (transfersRes.value || []) : []);
      setAdjustments(adjustmentsRes.status === "fulfilled" ? (adjustmentsRes.value || []) : []);
      setReceipts(receiptsRes.status === "fulfilled" ? (receiptsRes.value || []) : []);
      setAuditLogs(auditLogsRes.status === "fulfilled" ? (auditLogsRes.value || []) : []);
      setMovementReport(movementRes.status === "fulfilled" ? asArray(movementRes.value) : []);
      setStockSummaryReport(stockSummaryRes.status === "fulfilled" ? asArray(stockSummaryRes.value) : []);
      setLowStockReport(lowStockRes.status === "fulfilled" ? asArray(lowStockRes.value) : []);

      if (itemsRes.status === "rejected") {
        setLoadError(itemsRes.reason?.message || "Failed to load data");
      }

      if (itemsData.length) {
        const balanceEntries = await Promise.allSettled(itemsData.map(it => api.getItemStockBalance(it.id)));
        const balances = {};
        balanceEntries.forEach((r, i) => { if (r.status === "fulfilled") balances[itemsData[i].id] = r.value; });
        setStockBalances(balances);

        const txEntries = await Promise.allSettled(itemsData.map(it => api.getItemTransactions(it.id)));
        const allTx = [];
        txEntries.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) {
            const rows = Array.isArray(r.value) ? r.value : (r.value.data || []);
            rows.forEach(row => allTx.push({ ...row, itemName: itemsData[i].name, itemSku: itemsData[i].sku }));
          }
        });
        setTransactions(allTx);
      } else {
        setStockBalances({});
        setTransactions([]);
      }
    } catch (e) {
      setLoadError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const computedLowStock = useMemo(() => items.filter(it => {
    const b = stockBalances[it.id];
    const available = b ? Number(b.total_available ?? 0) : 0;
    return available < Number(it.reorder_level ?? 0);
  }), [items, stockBalances]);

  const effectiveLowStock = lowStockReport.length ? lowStockReport : computedLowStock;

  const warehouseOptions = useMemo(
    () => ["All Locations", ...warehouses.map(w => w.name).filter(Boolean)],
    [warehouses]
  );

  const sourceFor = (dataKey) => {
    switch (dataKey) {
      case "items": return items;
      case "categories": return categories;
      case "suppliers": return suppliers;
      case "users": return users;
      case "transactions": return transactions;
      case "low_stock": return effectiveLowStock;
      case "warehouses": return warehouses;
      case "transfers": return transfers;
      case "adjustments": return adjustments;
      case "receipts": return receipts;
      case "audit_logs": return auditLogs;
      case "movement": return movementReport;
      case "stock_summary": return stockSummaryReport;
      default: return null;
    }
  };

  const reports = useMemo(() => REPORT_DEFS.map(def => {
    const source = def.available ? sourceFor(def.dataKey) : null;
    const lastGenTs = source ? latestTimestamp(source) : null;
    const lastGen = lastGenTs ? fmtDateTime(lastGenTs) : (def.available ? "No data yet" : "Not available");
    const genBy = !def.available ? "-" : (def.systemGenerated ? "System" : (currentUser?.name || "-"));
    const recordCount = source ? source.length : 0;
    return { ...def, lastGen, genBy, recordCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items, categories, suppliers, users, transactions, stockBalances, currentUser, warehouses, transfers, adjustments, receipts, auditLogs, movementReport, stockSummaryReport, lowStockReport]);

  const filtered = useMemo(()=>{
    return reports.filter(r=>{
      const q = search.toLowerCase();
      const mQ = !q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q);
      const mC = catFilter==="All Report Types" || r.cat===catFilter;
      const mF = format==="All Formats" || r.format.includes(format);
      return mQ && mC && mF;
    });
  },[reports,search,catFilter,format]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const fmtDR = () => {
    const f = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    return `${f(dateRange.start)} – ${f(dateRange.end)}`;
  };

  const buildRows = (report) => {
    switch (report.dataKey) {
      case "items":
        return items.map(it => ({
          SKU: it.sku, Name: it.name, Category: it.category?.name ?? "",
          Supplier: it.supplier?.name ?? "", Unit: it.unit?.abbreviation ?? "",
          "Unit Cost": it.unit_cost, "Selling Price": it.selling_price,
          "Reorder Level": it.reorder_level, Status: it.status,
        }));
      case "stock_summary":
        if (stockSummaryReport.length) return stockSummaryReport.map(row => ({ ...row }));
        // Fallback: derive valuation from items + stock balances if the
        // dedicated endpoint isn't returning rows yet.
        return items.map(it => {
          const b = stockBalances[it.id];
          const onHand = b ? Number(b.total_on_hand ?? 0) : 0;
          return {
            SKU: it.sku, Name: it.name, Category: it.category?.name ?? "",
            "Unit Cost": it.unit_cost, "Qty On Hand": onHand,
            "Total Value": (Number(it.unit_cost || 0) * onHand).toFixed(2),
          };
        });
      case "low_stock":
        return effectiveLowStock.map(row => {
      
          const it = row.item ?? row;
          const b = stockBalances[it.id];
          return {
            SKU: it.sku ?? row.sku, Name: it.name ?? row.name,
            "Available": row.available ?? row.quantity_available ?? b?.total_available ?? 0,
            "Reorder Level": it.reorder_level ?? row.reorder_level,
            Supplier: it.supplier?.name ?? row.supplier_name ?? "",
          };
        });
      case "categories":
        return categories.map(c => ({ Name: c.name, Code: c.code, Status: c.status, "Last Updated": c.updated_at }));
      case "suppliers":
        return suppliers.map(s => ({ Name: s.name, Code: s.code, Email: s.email, Phone: s.phone, Address: s.address, Status: s.status }));
      case "users":
        return users.map(u => ({
          Name: u.name, Email: u.email, Phone: u.phone ?? "",
          Roles: (u.roles || []).map(r => r.name).join(", "), Status: u.status, "Last Updated": u.updated_at,
        }));
      case "transactions":
        return transactions.map(t => ({ Item: t.itemName, SKU: t.itemSku, ...t, itemName: undefined, itemSku: undefined }));
      case "movement":
        return movementReport.map(row => ({ ...row }));
      case "warehouses":
        return warehouses.map(w => ({
          Name: w.name, Code: w.code, Address: w.address ?? "", City: w.city ?? "",
          State: w.state ?? "", Country: w.country ?? "", Status: w.status, "Last Updated": w.updated_at,
        }));
      case "transfers":
        return transfers.map(t => ({
          "Transfer #": t.transfer_number, From: t.from_warehouse?.name ?? t.from_location?.name ?? "",
          To: t.to_warehouse?.name ?? t.to_location?.name ?? "", Status: t.status,
          Date: t.transfer_date, Notes: t.notes ?? "", "Last Updated": t.updated_at,
        }));
      case "adjustments":
        return adjustments.map(a => ({
          "Adjustment #": a.adjustment_number ?? a.reference ?? a.id, Reason: a.reason ?? "",
          Status: a.status, Date: a.adjustment_date ?? a.created_at, "Last Updated": a.updated_at,
        }));
      case "receipts":
        return receipts.map(r => ({
          "Receipt #": r.receipt_number, Supplier: r.supplier?.name ?? "", Warehouse: r.warehouse?.name ?? "",
          Status: r.status, Date: r.receipt_date ?? r.created_at, "Last Updated": r.updated_at,
        }));
      case "audit_logs":
        return auditLogs.map(l => ({
          Log: l.log_name ?? "", Description: l.description ?? "", User: l.causer?.name ?? "",
          Subject: l.subject_type ?? "", Date: l.created_at,
        }));
      default:
        return [];
    }
  };

  const handleDownload = (report, fmt) => {
    if (!report.available) {
      showToast(`${report.name} isn't available yet - no matching endpoint`);
      return;
    }
    const rows = buildRows(report);
    if (!rows.length) {
      showToast(`${report.name}: no data to export`);
      return;
    }
    if (fmt === "Excel" || fmt === "CSV") {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${report.name.replace(/\s+/g,"_")}.${fmt==="CSV"?"csv":"xlsx"}`);
      showToast(`${report.name} downloaded ✓`);
    } else {
      showToast(`${report.name} (${fmt}) downloaded ✓`);
    }
  };

  const catCounts = {};
  reports.forEach(r=>{ catCounts[r.cat]=(catCounts[r.cat]||0)+1; });

  const pageNums = () => {
    if(totalPages<=5) return Array.from({length:totalPages},(_,i)=>i+1);
    if(page<=2) return [1,2,null,totalPages];
    if(page>=totalPages-1) return [1,null,totalPages-1,totalPages];
    return [1,null,page-1,page,page+1,null,totalPages];
  };

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif", fontSize:13, color:"#1e2740", padding:"clamp(12px,3vw,24px)" }}>
      {toast && <Toast msg={toast}/>}
      <style>{`
        .rpt-row:hover { background:#f8f9fb; }
        .rpt-pagbtn { width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid #e4e7ef;border-radius:6px;cursor:pointer;background:#fff;font-size:12px;color:#1e2740;user-select:none; }
        .rpt-pagbtn:hover:not(.muted) { background:#f4f6fb; }
        .rpt-pagbtn.active { background:#4f6ef7;border-color:#4f6ef7;color:#fff;font-weight:600; }
        .rpt-pagbtn.muted  { cursor:default;color:#9aa1b4; }
        input::placeholder { color:#b0b8cc; }

        .rpt-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; gap:12px; flex-wrap:wrap; }
        .rpt-cats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
        .rpt-filters-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr auto auto; gap:12px; align-items:end; }
        .rpt-filters-actions { display:flex; gap:12px; }
        .rpt-table-wrap { overflow-x:auto; }
        .rpt-table { width:100%; min-width:920px; border-collapse:collapse; font-size:12.5px; }
        .rpt-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid #e4e7ef; flex-wrap:wrap; gap:10px; }

        @media (max-width: 1024px) {
          .rpt-cats { grid-template-columns:repeat(2,1fr); }
          .rpt-filters-grid { grid-template-columns:1fr 1fr; }
          .rpt-filters-actions { grid-column:1 / -1; justify-content:flex-end; }
        }
        @media (max-width: 640px) {
          .rpt-header { flex-direction:column; align-items:stretch; }
          .rpt-header > div:last-child button { width:100%; justify-content:center; }
          .rpt-cats { grid-template-columns:1fr; }
          .rpt-filters-grid { grid-template-columns:1fr; }
          .rpt-filters-actions { justify-content:stretch; }
          .rpt-filters-actions button { flex:1; }
          .rpt-pagination { justify-content:center; text-align:center; }
        }
      `}</style>

      {/* Header */}
      <div className="rpt-header">
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, lineHeight:1.2 }}>Reports</h1>
          <p style={{ color:"#6b7591", fontSize:12.5, margin:"4px 0 0" }}>Generate and download inventory reports and analytics</p>
        </div>
        {/* Date Range header button */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>setShowCal(o=>!o)} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 14px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#1e2740",fontFamily:"inherit",fontWeight:500,whiteSpace:"nowrap" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {fmtDR()}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showCal && <CalPicker value={dateRange} onChange={v=>{setDateRange(v);}} onClose={()=>setShowCal(false)}/>}
        </div>
      </div>

      {loadError && (
        <div style={{ background:"#fff5f5", border:"1px solid #fecaca", color:"#b91c1c", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <span>Couldn't load live data: {loadError}</span>
          <button onClick={loadAll} style={{ border:"1px solid #fecaca", background:"#fff", color:"#b91c1c", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Retry</button>
        </div>
      )}

      {/* Category Cards */}
      <div className="rpt-cats">
        {Object.entries(CAT_ICON_MAP).map(([cat,cfg])=>(
          <div key={cat} onClick={()=>{ setCatFilter(cat===catFilter?"All Report Types":cat); setPage(1); }}
            style={{ background:"#fff", border:`1px solid ${catFilter===cat?"#4f6ef7":"#e4e7ef"}`, borderRadius:12, padding:20, cursor:"pointer", transition:"all .15s", boxShadow: catFilter===cat?"0 0 0 2px rgba(79,110,247,0.15)":"none" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#4f6ef7"} onMouseLeave={e=>{ if(catFilter!==cat) e.currentTarget.style.borderColor="#e4e7ef"; }}>
            <div style={{ width:44, height:44, background:cfg.bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:cfg.color }}>{cfg.icon}</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#1e2740", marginBottom:6 }}>{cat}</div>
            <div style={{ fontSize:12, color:"#9aa1b4", marginBottom:10, lineHeight:1.4 }}>
              {cat==="Inventory Reports"   ?"View inventory balance, stock status and valuation reports":""}
              {cat==="Transaction Reports" ?"View all inventory transactions and movement history":""}
              {cat==="Stock Reports"       ?"Analyze stock levels, movement and performance":""}
              {cat==="User & Activity Reports"?"View user activities and audit trail reports":""}
            </div>
            <div style={{ fontSize:12.5, fontWeight:600, color:cfg.color }}>{catCounts[cat]||0} Reports</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:"14px 18px", marginBottom:2 }}>
        <div className="rpt-filters-grid">
          <div>
            <label style={{ fontSize:12, color:"#6b7591", display:"block", marginBottom:5 }}>Report Type</label>
            <div style={{ position:"relative" }}>
              <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1);}}
                style={{ width:"100%",padding:"8px 28px 8px 10px",border:"1px solid #e4e7ef",borderRadius:8,fontSize:12.5,fontFamily:"inherit",color:"#1e2740",outline:"none",appearance:"none",background:"#fff",cursor:"pointer" }}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <svg style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#6b7591", display:"block", marginBottom:5 }}>Date Range</label>
            <div style={{ position:"relative" }}>
              <button onClick={()=>setShowCal(o=>!o)} style={{ width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 10px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#1e2740",fontFamily:"inherit" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ flex:1, textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{fmtDR()}</span>
              </button>
              {showCal && <CalPicker value={dateRange} onChange={v=>{setDateRange(v);}} onClose={()=>setShowCal(false)}/>}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#6b7591", display:"block", marginBottom:5 }}>Warehouse / Location</label>
            <div style={{ position:"relative" }}>
              <select value={warehouse} onChange={e=>setWarehouse(e.target.value)} disabled={warehouseOptions.length<=1}
                title={warehouseOptions.length<=1 ? "No warehouses returned by the API yet" : undefined}
                style={{ width:"100%",padding:"8px 28px 8px 10px",border:"1px solid #e4e7ef",borderRadius:8,fontSize:12.5,fontFamily:"inherit",color:"#1e2740",outline:"none",appearance:"none",background:warehouseOptions.length<=1?"#f8f9fb":"#fff",cursor:warehouseOptions.length<=1?"default":"pointer" }}>
                {warehouseOptions.map(w=><option key={w}>{w}</option>)}
              </select>
              <svg style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#6b7591", display:"block", marginBottom:5 }}>Format</label>
            <div style={{ position:"relative" }}>
              <select value={format} onChange={e=>{setFormat(e.target.value);setPage(1);}}
                style={{ width:"100%",padding:"8px 28px 8px 10px",border:"1px solid #e4e7ef",borderRadius:8,fontSize:12.5,fontFamily:"inherit",color:"#1e2740",outline:"none",appearance:"none",background:"#fff",cursor:"pointer" }}>
                {FORMATS.map(f=><option key={f}>{f}</option>)}
              </select>
              <svg style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div className="rpt-filters-actions">
            <button onClick={()=>{ setCatFilter("All Report Types"); setFormat("All Formats"); setWarehouse("All Locations"); setSearch(""); setPage(1); }}
              style={{ padding:"8px 20px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#1e2740",fontFamily:"inherit",fontWeight:500,whiteSpace:"nowrap" }}>
              Reset
            </button>
            <button style={{ padding:"8px 20px",border:"none",borderRadius:8,background:"#4f6ef7",color:"#fff",fontSize:12.5,cursor:"pointer",fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap" }}
              onClick={()=>showToast("Filters applied ✓")}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:"12px 18px", background:"#fff", border:"1px solid #e4e7ef", borderTop:"0" }}>
        <div style={{ position:"relative", maxWidth:320, width:"100%" }}>
          <svg style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search reports..."
            style={{ width:"100%",padding:"7px 10px 7px 32px",border:"1px solid #e4e7ef",borderRadius:8,fontSize:12.5,fontFamily:"inherit",color:"#1e2740",outline:"none",boxSizing:"border-box" }}/>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, overflow:"hidden", marginTop:14 }}>
        <div className="rpt-table-wrap">
          <table className="rpt-table">
            <thead>
              <tr style={{ background:"#f8f9fb", borderBottom:"1px solid #e4e7ef" }}>
                <th style={{ textAlign:"left",padding:"12px 18px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Report Name</th>
                <th style={{ textAlign:"left",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Category</th>
                <th style={{ textAlign:"left",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Description</th>
                <th style={{ textAlign:"left",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Format</th>
                <th style={{ textAlign:"left",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Last Generated</th>
                <th style={{ textAlign:"left",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Generated By</th>
                <th style={{ textAlign:"center",padding:"12px 12px",color:"#6b7591",fontWeight:500,whiteSpace:"nowrap" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:"48px 20px",textAlign:"center",color:"#9aa1b4" }}>Loading reports…</td></tr>
              ) : paginated.length===0 ? (
                <tr><td colSpan={7} style={{ padding:"48px 20px",textAlign:"center",color:"#9aa1b4" }}>No reports match your search.</td></tr>
              ) : paginated.map((r,i)=>(
                <tr key={r.id} className="rpt-row" style={{ borderBottom:i===paginated.length-1?"none":"1px solid #f4f6fb", transition:"background .15s" }}>
                  <td style={{ padding:"14px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:"#f4f6fb", border:"1px solid #e4e7ef", display:"flex", alignItems:"center", justifyContent:"center", color:"#6b7591", flexShrink:0 }}>
                        {ICON_MAP[r.icon]}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:"#1e2740", fontSize:13, whiteSpace:"nowrap" }}>{r.name}</div>
                        {r.available && <div style={{ fontSize:11, color:"#9aa1b4" }}>{r.recordCount} record{r.recordCount===1?"":"s"}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"14px 12px" }}>
                    <span style={{ background:r.catColor, color:r.catText, padding:"3px 10px", borderRadius:5, fontSize:11.5, fontWeight:600, whiteSpace:"nowrap" }}>{r.cat}</span>
                  </td>
                  <td style={{ padding:"14px 12px", color:"#6b7591", maxWidth:240 }}>{r.desc}</td>
                  <td style={{ padding:"14px 12px", color:"#6b7591", whiteSpace:"nowrap" }}>{r.format}</td>
                  <td style={{ padding:"14px 12px", color:"#6b7591", whiteSpace:"nowrap", fontSize:12 }}>{r.lastGen}</td>
                  <td style={{ padding:"14px 12px", color:"#1e2740", fontWeight:500, whiteSpace:"nowrap" }}>{r.genBy}</td>
                  <td style={{ padding:"14px 12px", textAlign:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                      {/* Download */}
                      <button onClick={()=>handleDownload(r,"Excel")} disabled={!r.available}
                        style={{ width:30,height:30,border:"1px solid #e4e7ef",borderRadius:7,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:r.available?"pointer":"not-allowed",opacity:r.available?1:0.4,transition:"all .15s" }}
                        onMouseEnter={e=>{ if(!r.available) return; e.currentTarget.style.background="#eef2ff";e.currentTarget.style.borderColor="#4f6ef7";}} onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#e4e7ef";}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                      {/* More */}
                      <button style={{ width:30,height:30,border:"1px solid #e4e7ef",borderRadius:7,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f4f6fb"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="rpt-pagination">
          <span style={{ fontSize:12, color:"#6b7591" }}>Showing {filtered.length===0?0:(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} reports</span>
          <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", justifyContent:"center" }}>
            <div className="rpt-pagbtn" onClick={()=>setPage(p=>Math.max(1,p-1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </div>
            {pageNums().map((n,i)=>
              n===null
                ? <div key={"e"+i} className="rpt-pagbtn muted">...</div>
                : <div key={n} className={`rpt-pagbtn${n===page?" active":""}`} onClick={()=>setPage(n)}>{n}</div>
            )}
            <div className="rpt-pagbtn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}