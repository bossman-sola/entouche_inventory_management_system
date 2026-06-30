import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";


const SEED_LOGS = [
  { id:1,  date:"May 27, 2025", time:"11:45:32 AM", user:"Ayomide Ajayi",    role:"System Administrator", initials:"AM", color:"#4f6ef7", action:"CREATE", module:"Items",        record:"ITEM-1250", details:'Created item "Dell Latitud..."',    ip:"197.210.45.12", status:"Success",  fullDetails:'Created item "Dell Latitude 5440 Laptop" with SKU "LAP-5440", category "Laptops" and unit "Piece".', changes:"" },
  { id:2,  date:"May 27, 2025", time:"11:32:18 AM", user:"Ibrahim Okafor",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"UPDATE", module:"Inventory",    record:"INV-4587", details:"Updated quantity from 10...",           ip:"197.210.45.18", status:"Success",  fullDetails:"Updated inventory quantity from 100 to 85 units for item Dell Latitude 5440.", changes:"Qty: 100 → 85" },
  { id:3,  date:"May 27, 2025", time:"10:15:07 AM", user:"Bola David",       role:"Warehouse Manager",     initials:"BW", color:"#8b5cf6", action:"APPROVE",module:"Transfers",    record:"TRF-1123", details:"Approved transfer from S...",           ip:"197.210.45.11", status:"Success",  fullDetails:"Approved transfer TRF-1123 from Storage Area to Receiving Area.", changes:"Status: Pending → Approved" },
  { id:4,  date:"May 27, 2025", time:"09:50:21 AM", user:"Chinedu Samuel",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"DELETE", module:"Items",        record:"ITEM-1231",details:'Deleted item "HP LaserJe..."',           ip:"197.210.45.18", status:"Success",  fullDetails:'Deleted item "HP LaserJet Pro M428" from the system.', changes:"" },
  { id:5,  date:"May 27, 2025", time:"09:12:44 AM", user:"Ayomide Ajayi",    role:"System Administrator", initials:"AM", color:"#4f6ef7", action:"UPDATE", module:"Users",        record:"USER-0017",details:"Updated user role from I...",             ip:"197.210.45.12", status:"Success",  fullDetails:"Updated user role from Inventory Officer to Warehouse Manager.", changes:"Role: Inv. Officer → Warehouse Mgr" },
  { id:6,  date:"May 27, 2025", time:"08:30:10 AM", user:"Esther Obi",       role:"Management Viewer",     initials:"EO", color:"#f59e0b", action:"LOGIN",  module:"System",       record:"—",        details:"User login to the system",                ip:"197.210.45.25", status:"Success",  fullDetails:"User Esther Obi logged into the system from 197.210.45.25.", changes:"" },
  { id:7,  date:"May 27, 2025", time:"08:05:33 AM", user:"Ibrahim Okafor",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"ADJUST", module:"Adjustments",  record:"ADJ-0098", details:"Quantity adjusted by -15...",             ip:"197.210.45.18", status:"Warning",  fullDetails:"Stock adjustment of -15 units applied to item Wireless Mouse (ACC-005).", changes:"Stock: 315 → 300" },
  { id:8,  date:"May 27, 2025", time:"07:55:11 AM", user:"Chinedu Samuel",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"DELETE", module:"Inventory",    record:"INV-4521", details:"Failed to delete inventory...",           ip:"197.210.45.18", status:"Failed",   fullDetails:"Attempted to delete INV-4521 but failed due to existing dependencies.", changes:"" },
  { id:9,  date:"May 26, 2025", time:"06:40:22 PM", user:"Bola David",       role:"Warehouse Manager",     initials:"BW", color:"#8b5cf6", action:"CREATE", module:"Stock Counts", record:"SC-0067",  details:"Created stock count for S...",            ip:"197.210.45.11", status:"Success",  fullDetails:"Created stock count SC-0067 for Storage Area warehouse.", changes:"" },
  { id:10, date:"May 26, 2025", time:"05:18:09 PM", user:"Ayomide Ajayi",    role:"System Administrator", initials:"AM", color:"#4f6ef7", action:"UPDATE", module:"Settings",     record:"SET-0003", details:"Updated company settings",                ip:"197.210.45.12", status:"Success",  fullDetails:"Updated company settings: currency changed to NGN, timezone set to WAT.", changes:"Currency: USD → NGN" },
  { id:11, date:"May 26, 2025", time:"03:22:45 PM", user:"Ibrahim Okafor",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"CREATE", module:"Items",        record:"ITEM-1249", details:'Created item "Ergonomic..."',             ip:"197.210.45.18", status:"Success",  fullDetails:'Created item "Ergonomic Office Chair" with SKU "CHR-002".', changes:"" },
  { id:12, date:"May 26, 2025", time:"01:10:30 PM", user:"Bola David",       role:"Warehouse Manager",     initials:"BW", color:"#8b5cf6", action:"APPROVE",module:"Receipts",     record:"RCPT-155", details:"Approved receipt from Sm...",             ip:"197.210.45.11", status:"Success",  fullDetails:"Approved receipt RCPT-155 from Smart Solutions NG.", changes:"Status: Pending → Completed" },
  { id:13, date:"May 25, 2025", time:"04:05:18 PM", user:"Chinedu Samuel",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"UPDATE", module:"Inventory",    record:"INV-4510", details:"Updated reorder level...",                ip:"197.210.45.18", status:"Success",  fullDetails:"Updated reorder level for item USB-C Hub from 20 to 50 units.", changes:"Reorder: 20 → 50" },
  { id:14, date:"May 25, 2025", time:"11:45:02 AM", user:"Esther Obi",       role:"Management Viewer",     initials:"EO", color:"#f59e0b", action:"LOGIN",  module:"System",       record:"—",        details:"User login to the system",                ip:"197.210.45.25", status:"Success",  fullDetails:"User Esther Obi logged into the system.", changes:"" },
  { id:15, date:"May 24, 2025", time:"09:30:55 AM", user:"Ayomide Ajayi",    role:"System Administrator", initials:"AM", color:"#4f6ef7", action:"DELETE", module:"Users",        record:"USER-0015",details:"Removed user account...",                  ip:"197.210.45.12", status:"Success",  fullDetails:"Removed user account USER-0015 (John Doe) from the system.", changes:"" },
  { id:16, date:"May 24, 2025", time:"08:12:44 AM", user:"Ibrahim Okafor",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"ADJUST", module:"Adjustments",  record:"ADJ-0091", details:"Quantity adjusted by +50...",             ip:"197.210.45.18", status:"Success",  fullDetails:"Stock adjustment of +50 units applied to item 24\" LED Monitor.", changes:"Stock: 10 → 60" },
  { id:17, date:"May 23, 2025", time:"03:15:22 PM", user:"Bola David",       role:"Warehouse Manager",     initials:"BW", color:"#8b5cf6", action:"CREATE", module:"Transfers",    record:"TRF-1120", details:"Created transfer request...",             ip:"197.210.45.11", status:"Success",  fullDetails:"Created transfer request TRF-1120 from Receiving Area to Storage Area.", changes:"" },
  { id:18, date:"May 23, 2025", time:"10:44:09 AM", user:"Chinedu Samuel",   role:"Inventory Officer",     initials:"IO", color:"#22c27e", action:"UPDATE", module:"Items",        record:"ITEM-1230",details:"Updated item description...",              ip:"197.210.45.18", status:"Success",  fullDetails:"Updated description and barcode for item HP LaserJet Pro M428.", changes:"Barcode: null → '12345678'" },
  { id:19, date:"May 22, 2025", time:"02:30:11 PM", user:"Ayomide Ajayi",    role:"System Administrator", initials:"AM", color:"#4f6ef7", action:"UPDATE", module:"Settings",     record:"SET-0002", details:"Updated notification settings",           ip:"197.210.45.12", status:"Success",  fullDetails:"Enabled email notifications and low stock alerts.", changes:"" },
  { id:20, date:"May 21, 2025", time:"09:05:44 AM", user:"Esther Obi",       role:"Management Viewer",     initials:"EO", color:"#f59e0b", action:"LOGIN",  module:"System",       record:"—",        details:"User login to the system",                ip:"197.210.45.25", status:"Failed",   fullDetails:"Failed login attempt for user Esther Obi. Invalid credentials.", changes:"" },
];

const ACTION_COLORS = {
  CREATE:  { bg:"#e6faf3", color:"#16a369" },
  UPDATE:  { bg:"#eef2ff", color:"#4f6ef7" },
  DELETE:  { bg:"#fff1f0", color:"#c0392b" },
  APPROVE: { bg:"#e6faf3", color:"#16a369" },
  ADJUST:  { bg:"#fff7ed", color:"#c27a0a" },
  LOGIN:   { bg:"#f0f4ff", color:"#4f6ef7" },
};
const STATUS_COLORS = {
  Success: { color:"#16a369" },
  Warning: { color:"#c27a0a" },
  Failed:  { color:"#c0392b" },
};

const ALL_MODULES = ["All Modules","Items","Inventory","Transfers","Users","System","Adjustments","Stock Counts","Settings","Receipts"];
const ALL_ACTIONS = ["All Actions","CREATE","UPDATE","DELETE","APPROVE","ADJUST","LOGIN"];
const ALL_USERS   = ["All Users","Ayomide Ajayi","Ibrahim Okafor","Bola David","Chinedu Samuel","Esther Obi"];
const ALL_STATUS  = ["All Status","Success","Warning","Failed"];

const PAGE_SIZE = 10;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function CalendarPicker({ value, onChange, onClose }) {
  const [viewDate, setViewDate] = useState(new Date(2025, 4, 1));
  const [selecting, setSelecting] = useState(null); // "start"|"end"
  const [hover, setHover] = useState(null);
  const [localStart, setLocalStart] = useState(value.start);
  const [localEnd,   setLocalEnd]   = useState(value.end);

  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const days = [];
  for (let i=0;i<firstDay;i++) days.push(null);
  for (let d=1;d<=daysInMonth;d++) days.push(new Date(year, month, d));

  const toStr = d => d ? d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  const inRange = d => {
    if (!d) return false;
    const end = localEnd || hover;
    if (localStart && end) return d > localStart && d < end;
    return false;
  };
  const isStart = d => d && localStart && d.toDateString()===localStart.toDateString();
  const isEnd   = d => d && localEnd   && d.toDateString()===localEnd.toDateString();

  const handleDay = (d) => {
    if (!d) return;
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(d); setLocalEnd(null); setSelecting("end");
    } else {
      if (d < localStart) { setLocalEnd(localStart); setLocalStart(d); }
      else setLocalEnd(d);
      setSelecting(null);
    }
  };
  const apply = () => { onChange({ start: localStart, end: localEnd||localStart }); onClose(); };

  return (
    <div className="al-calendar" style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", zIndex:1000, padding:20, minWidth:320 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={()=>setViewDate(new Date(year, month-1,1))} style={{ border:"1px solid #e4e7ef", borderRadius:6, width:28, height:28, cursor:"pointer", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ fontWeight:600, fontSize:13.5, color:"#1e2740" }}>{MONTHS[month]} {year}</span>
        <button onClick={()=>setViewDate(new Date(year, month+1,1))} style={{ border:"1px solid #e4e7ef", borderRadius:6, width:28, height:28, cursor:"pointer", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:8 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
          <div key={d} style={{ textAlign:"center", fontSize:11, color:"#9aa1b4", fontWeight:600, padding:"4px 0" }}>{d}</div>
        ))}
        {days.map((d,i)=>(
          <div key={i} onClick={()=>handleDay(d)} onMouseEnter={()=>d&&selecting&&setHover(d)} onMouseLeave={()=>setHover(null)}
            style={{
              textAlign:"center", padding:"5px 0", fontSize:12, borderRadius:6, cursor:d?"pointer":"default",
              background: isStart(d)||isEnd(d) ? "#4f6ef7" : inRange(d) ? "#eef2ff" : "transparent",
              color: isStart(d)||isEnd(d) ? "#fff" : d ? "#1e2740" : "transparent",
              fontWeight: isStart(d)||isEnd(d) ? 600 : 400,
            }}
          >{d ? d.getDate() : ""}</div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid #f0f2f7", paddingTop:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ fontSize:11.5, color:"#6b7591" }}>
          {localStart ? toStr(localStart) : "Start"} {localEnd ? `– ${toStr(localEnd)}` : ""}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onClose} style={{ padding:"6px 14px", border:"1px solid #e4e7ef", borderRadius:7, fontSize:12, cursor:"pointer", background:"#fff", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={apply}   style={{ padding:"6px 14px", border:"none", borderRadius:7, fontSize:12, cursor:"pointer", background:"#4f6ef7", color:"#fff", fontFamily:"inherit", fontWeight:600 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function Dropdown({ options, value, onChange, width=160 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{ const h=(e)=>{ if(ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", border:"1px solid #e4e7ef", borderRadius:8, background:"#fff", fontSize:12.5, cursor:"pointer", color:"#1e2740", fontFamily:"inherit", minWidth:width, justifyContent:"space-between" }}>
        <span>{value}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:"#fff", border:"1px solid #e4e7ef", borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:999, minWidth:width, overflow:"hidden" }}>
          {options.map(opt=>(
            <div key={opt} onClick={()=>{ onChange(opt); setOpen(false); }}
              style={{ padding:"9px 14px", fontSize:12.5, cursor:"pointer", color: value===opt ? "#4f6ef7":"#1e2740", fontWeight: value===opt ? 600:400, background:"#fff" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f4f6fb"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const Toast = ({msg})=>(<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#1e2740",color:"#fff",padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:500,zIndex:99999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",maxWidth:"calc(100vw - 32px)",overflow:"hidden",textOverflow:"ellipsis" }}>{msg}</div>);

export default function AuditLogs() {
  const [logs] = useState(SEED_LOGS);
  const [search, setSearch]       = useState("");
  const [module, setModule]       = useState("All Modules");
  const [action, setAction]       = useState("All Actions");
  const [user,   setUser]         = useState("All Users");
  const [status, setStatus]       = useState("All Status");
  const [dateRange, setDateRange] = useState({ start: new Date(2025,4,20), end: new Date(2025,4,27) });
  const [showCal, setShowCal]     = useState(false);
  const [selected, setSelected]   = useState(SEED_LOGS[0]);
  const [page, setPage]           = useState(1);
  const [toast, setToast]         = useState(null);
  const calRef = useRef();

  useEffect(()=>{ const h=(e)=>{ if(calRef.current&&!calRef.current.contains(e.target)) setShowCal(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  const filtered = useMemo(()=>{
    return logs.filter(l=>{
      const q = search.toLowerCase();
      const matchQ = !q || l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q) || l.record.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
      const matchMod = module==="All Modules" || l.module===module;
      const matchAct = action==="All Actions" || l.action===action;
      const matchUsr = user==="All Users"     || l.user===user;
      const matchSts = status==="All Status"  || l.status===status;
      const logDate  = new Date(`${l.date} ${l.time}`);
      const matchDate = (!dateRange.start || logDate >= dateRange.start) && (!dateRange.end || logDate <= new Date(dateRange.end.getTime()+86399999));
      return matchQ && matchMod && matchAct && matchUsr && matchSts && matchDate;
    });
  },[logs,search,module,action,user,status,dateRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const fmtDateRange = () => {
    const f = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
    return `${f(dateRange.start)} - ${f(dateRange.end)}`;
  };

  const handleDownload = () => {
    const data = filtered.map(l=>({
      "Date":       l.date,
      "Time":       l.time,
      "User":       l.user,
      "Role":       l.role,
      "Action":     l.action,
      "Module":     l.module,
      "Record":     l.record,
      "Details":    l.details,
      "IP Address": l.ip,
      "Status":     l.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, "InventoryPro_Audit_Logs.xlsx");
    showToast("Audit log downloaded ✓");
  };

  const metrics = [
    { label:"Total Activities", value:"2,584", sub:"All time",       iconBg:"#eef2ff", color:"#4f6ef7", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label:"Today's Activities", value:"142", sub:"May 27, 2025",   iconBg:"#e6faf3", color:"#22c27e", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { label:"Users",             value:"18",  sub:"Active users",    iconBg:"#f3f0ff", color:"#8b5cf6", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label:"Critical Activities",value:"7", sub:"Require attention",iconBg:"#fff7ed", color:"#f59e0b", subAccent:true, icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ];

  const pageNums = () => {
    if (totalPages<=6) return Array.from({length:totalPages},(_,i)=>i+1);
    if (page<=3) return [1,2,3,null,totalPages-1,totalPages];
    if (page>=totalPages-2) return [1,2,null,totalPages-2,totalPages-1,totalPages];
    return [1,2,null,page-1,page,page+1,null,totalPages];
  };

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif", fontSize:13, color:"#1e2740" }}>
      {toast && <Toast msg={toast}/>}
      <style>{`
        .al-row:hover { background:#f8f9fb; }
        .al-pagbtn { width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid #e4e7ef;border-radius:6px;cursor:pointer;background:#fff;font-size:12.5px;color:#1e2740;user-select:none; }
        .al-pagbtn:hover { background:#f4f6fb; }
        .al-pagbtn.active { background:#4f6ef7;border-color:#4f6ef7;color:#fff;font-weight:600; }
        .al-pagbtn.muted  { cursor:default;color:#9aa1b4; }
        .al-pagbtn.nav:hover { background:#f4f6fb; }
        .al-link { color:#4f6ef7;font-weight:500;cursor:pointer; }
        .al-link:hover { text-decoration:underline; }
        input::placeholder { color:#b0b8cc; }

        .al-page { padding: 16px; }
        .al-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        .al-layout { display:grid; grid-template-columns:1fr 300px; gap:14px; align-items:start; }
        .al-toolbar { padding:14px 16px; border-bottom:1px solid #e4e7ef; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .al-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .al-table { width:100%; border-collapse:collapse; font-size:12.5px; min-width:920px; }
        .al-detail-panel { position:sticky; top:20px; }

        @media (max-width: 1024px) {
          .al-layout { grid-template-columns: 1fr; }
          .al-detail-panel { position:static; }
        }
        @media (max-width: 768px) {
          .al-page { padding: 12px; }
          .al-metrics { grid-template-columns:repeat(2,1fr); gap:10px; }
          .al-toolbar { padding:12px; }
          .al-toolbar > div, .al-toolbar > button { width:100%; }
          .al-toolbar input { width:100%; }
        }
        @media (max-width: 480px) {
          .al-metrics { grid-template-columns:1fr; }
          .al-calendar { left:50%; transform:translateX(-50%); min-width:280px; max-width:calc(100vw - 32px); }
        }
      `}</style>

      <div className="al-page">
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700, margin:0, lineHeight:1.2 }}>Audit Logs</h1>
        <p style={{ color:"#6b7591", fontSize:12.5, margin:"4px 0 0" }}>Track all system activities and changes to ensure transparency and accountability.</p>
      </div>

      
      <div className="al-metrics">
        {metrics.map((m,i)=>(
          <div key={i} style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:10, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, minWidth:0 }}>
            <div style={{ width:44, height:44, background:m.iconBg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{m.icon}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11.5, color:"#6b7591", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.label}</div>
              <div style={{ fontSize:22, fontWeight:700, lineHeight:1, color:"#1e2740", marginBottom:3 }}>{m.value}</div>
              <div style={{ fontSize:11, color: m.subAccent ? "#f59e0b":"#6b7591", fontWeight: m.subAccent?600:400, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="al-layout">
        
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, overflow:"hidden", minWidth:0 }}>

          
          <div className="al-toolbar">
            
            <div style={{ position:"relative", flex:"1 1 200px" }}>
              <svg style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by keyword, action, module or user..."
                style={{ width:"100%", padding:"7px 10px 7px 32px", border:"1px solid #e4e7ef", borderRadius:8, fontSize:12.5, fontFamily:"inherit", color:"#1e2740", outline:"none", background:"#fff", boxSizing:"border-box" }}
              />
            </div>
            <Dropdown options={ALL_MODULES} value={module} onChange={v=>{setModule(v);setPage(1);}} width={140} />
            <Dropdown options={ALL_ACTIONS} value={action} onChange={v=>{setAction(v);setPage(1);}} width={130} />
            <Dropdown options={ALL_USERS}   value={user}   onChange={v=>{setUser(v);setPage(1);}}   width={140} />
            <Dropdown options={ALL_STATUS}  value={status} onChange={v=>{setStatus(v);setPage(1);}} width={120} />

            {/* Date Range */}
            <div ref={calRef} style={{ position:"relative" }}>
              <button onClick={()=>setShowCal(o=>!o)} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 12px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#1e2740",fontFamily:"inherit",whiteSpace:"nowrap" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmtDateRange()}
              </button>
              {showCal && <CalendarPicker value={dateRange} onChange={v=>{setDateRange(v);setPage(1);}} onClose={()=>setShowCal(false)}/>}
            </div>

            {/* Filters btn */}
            <button style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",border:"1px solid #4f6ef7",borderRadius:8,background:"#eef2ff",fontSize:12.5,cursor:"pointer",color:"#4f6ef7",fontFamily:"inherit",fontWeight:500,justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
            <button onClick={()=>{ setSearch(""); setModule("All Modules"); setAction("All Actions"); setUser("All Users"); setStatus("All Status"); setPage(1); }}
              style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#6b7591",fontFamily:"inherit",justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr style={{ background:"#f8f9fb", borderBottom:"1px solid #e4e7ef" }}>
                  {["Date & Time","User","Action","Module","Record","Details","IP Address","Status",""].map((h,i)=>(
                    <th key={i} style={{ padding:"11px 12px", color:"#6b7591", fontWeight:500, textAlign:"left", whiteSpace:"nowrap" }}>
                      {h}{h&&h!=="" && <svg style={{verticalAlign:"-2px",marginLeft:3}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c5cde8" strokeWidth="2"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length===0 ? (
                  <tr><td colSpan={9} style={{ padding:"48px 20px", textAlign:"center", color:"#9aa1b4" }}>No activities match your filters.</td></tr>
                ) : paginated.map((log,i)=>{
                  const ac = ACTION_COLORS[log.action] || {bg:"#f4f6fb",color:"#1e2740"};
                  const sc = STATUS_COLORS[log.status] || {color:"#6b7591"};
                  const isSel = selected?.id===log.id;
                  return (
                    <tr key={log.id} className="al-row" onClick={()=>setSelected(log)} style={{ borderBottom: i===paginated.length-1?"none":"1px solid #f4f6fb", cursor:"pointer", background: isSel?"#f0f4ff":"", transition:"background .15s" }}>
                      <td style={{ padding:"12px 12px", whiteSpace:"nowrap" }}>
                        <div style={{ fontWeight:600, color:"#1e2740", fontSize:12.5 }}>{log.date}</div>
                        <div style={{ color:"#9aa1b4", fontSize:11.5 }}>{log.time}</div>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:log.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10.5, fontWeight:700, flexShrink:0 }}>{log.initials}</div>
                          <div>
                            <div style={{ fontWeight:600, fontSize:12.5, color:"#1e2740", whiteSpace:"nowrap" }}>{log.user}</div>
                            <div style={{ fontSize:11, color:"#9aa1b4" }}>{log.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ background:ac.bg, color:ac.color, padding:"3px 9px", borderRadius:5, fontSize:11.5, fontWeight:600 }}>{log.action}</span>
                      </td>
                      <td style={{ padding:"12px 12px", color:"#6b7591", whiteSpace:"nowrap" }}>{log.module}</td>
                      <td style={{ padding:"12px 12px" }}><span className="al-link">{log.record}</span></td>
                      <td style={{ padding:"12px 12px", color:"#6b7591", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.details}</td>
                      <td style={{ padding:"12px 12px", color:"#6b7591", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:12 }}>{log.ip}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ color:sc.color, fontWeight:600, fontSize:12 }}>{log.status}</span>
                      </td>
                      <td style={{ padding:"12px 8px", textAlign:"center" }}>
                        <div style={{ width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:5, cursor:"pointer" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f4f6fb"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderTop:"1px solid #e4e7ef", flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:12, color:"#6b7591" }}>Showing {filtered.length===0?0:(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length} activities</span>
            <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <div className="al-pagbtn nav" onClick={()=>setPage(1)}>«</div>
              <div className="al-pagbtn nav" onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</div>
              {pageNums().map((n,i)=>
                n===null
                  ? <div key={"e"+i} className="al-pagbtn muted">...</div>
                  : <div key={n} className={`al-pagbtn${n===page?" active":""}`} onClick={()=>setPage(n)}>{n}</div>
              )}
              <div className="al-pagbtn nav" onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>›</div>
              <div className="al-pagbtn nav" onClick={()=>setPage(totalPages)}>»</div>
            </div>
          </div>
        </div>

        {/* Right: Activity Details Panel */}
        {selected ? (
          <div className="al-detail-panel" style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, overflow:"hidden", minWidth:0 }}>
            <div style={{ padding:"16px 18px", borderBottom:"1px solid #e4e7ef", display:"flex", alignItems:"center", gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span style={{ fontWeight:700, fontSize:14, color:"#1e2740" }}>Activity Details</span>
            </div>
            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:0 }}>
              {[
                ["Action",     <span style={{ color: (ACTION_COLORS[selected.action]||{}).color||"#4f6ef7", fontWeight:700 }}>{selected.action}</span>],
                ["Module",     selected.module],
                ["Record",     <span className="al-link">{selected.record}</span>],
                ["Date & Time",`${selected.date} ${selected.time}`],
              ].map(([label,val],i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f4f6fb", gap:10 }}>
                  <span style={{ fontSize:12.5, color:"#6b7591" }}>{label}</span>
                  <span style={{ fontSize:12.5, color:"#1e2740", fontWeight:500, textAlign:"right", maxWidth:160 }}>{val}</span>
                </div>
              ))}

              {/* User */}
              <div style={{ padding:"12px 0", borderBottom:"1px solid #f4f6fb" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:8 }}>User</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:selected.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>{selected.initials}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12.5 }}>{selected.user}</div>
                    <div style={{ fontSize:11, color:"#9aa1b4" }}>{selected.role}</div>
                  </div>
                </div>
              </div>

              {/* IP */}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f4f6fb", gap:10 }}>
                <span style={{ fontSize:12.5, color:"#6b7591" }}>IP Address</span>
                <span style={{ fontSize:12.5, fontFamily:"monospace" }}>{selected.ip}</span>
              </div>

              {/* User Agent */}
              <div style={{ padding:"10px 0", borderBottom:"1px solid #f4f6fb" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:5 }}>User Agent</div>
                <div style={{ fontSize:11.5, color:"#3d4a63", lineHeight:1.5, wordBreak:"break-word" }}>Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15</div>
              </div>

              {/* Details */}
              <div style={{ padding:"10px 0", borderBottom:selected.changes?"1px solid #f4f6fb":"none" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:5 }}>Details</div>
                <div style={{ fontSize:12, color:"#1e2740", lineHeight:1.6, wordBreak:"break-word" }}>{selected.fullDetails}</div>
              </div>

              {/* Changes */}
              {selected.changes && (
                <div style={{ padding:"10px 0" }}>
                  <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:5 }}>Changes</div>
                  <div style={{ fontSize:12, color:"#1e2740", background:"#f8f9fb", borderRadius:7, padding:"8px 10px", fontFamily:"monospace", wordBreak:"break-word" }}>{selected.changes}</div>
                </div>
              )}
            </div>

            {/* Download Log */}
            <div style={{ padding:"14px 18px", borderTop:"1px solid #e4e7ef" }}>
              <button onClick={handleDownload} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", border:"1px solid #e4e7ef", borderRadius:9, background:"#fff", fontSize:13, fontWeight:500, color:"#1e2740", cursor:"pointer", fontFamily:"inherit", transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f4f6fb"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Log
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:32, textAlign:"center", color:"#9aa1b4", fontSize:13 }}>
            Select an activity to view details
          </div>
        )}
      </div>
      </div>
    </div>
  );
}