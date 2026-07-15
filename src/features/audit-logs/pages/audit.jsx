import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

const BASE_URL = "https://entouche-staging-api-16910c236bc5.herokuapp.com";
const DEFAULT_EMAIL = "admin@inventory.local";
const DEFAULT_PASSWORD = "Admin@1234";

const MODULE_COLOR = {
  Items:      "#4f6ef7",
  Categories: "#8b5cf6",
  Suppliers:  "#22c27e",
  Units:      "#f59e0b",
  Users:      "#c0392b",
};
const ACTION_COLORS = {
  CREATE: { bg: "#e6faf3", color: "#16a369" },
  UPDATE: { bg: "#eef2ff", color: "#4f6ef7" },
  DELETE: { bg: "#fff1f0", color: "#c0392b" },
};
const STATUS_COLORS = {
  Success: { color: "#16a369" },
  Warning: { color: "#c27a0a" },
  Failed:  { color: "#c0392b" },
};

const PAGE_SIZE = 10;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function apiFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok || json.success === false) {
    const msg = json?.errors ? Object.values(json.errors).flat().join(" ") : (json?.message || `Request failed (${res.status})`);
    throw new Error(msg);
  }
  return json;
}

async function fetchAllPages(path, token) {
  let page = 1, lastPage = 1;
  const all = [];
  do {
    const json = await apiFetch(`${path}${path.includes("?") ? "&" : "?"}page=${page}`, { token });
    all.push(...(json.data || []));
    lastPage = json.meta?.last_page || 1;
    page++;
  } while (page <= lastPage);
  return all;
}

function initials(name) {
  return (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function colorFor(name) {
  const palette = ["#4f6ef7", "#22c27e", "#8b5cf6", "#f59e0b", "#c0392b", "#0ea5e9"];
  let h = 0;
  for (const c of (name || "")) h = (h * 31 + c.charCodeAt(0)) % palette.length;
  return palette[h];
}

function CalendarPicker({ value, onChange, onClose }) {
  const [viewDate, setViewDate] = useState(value.start || new Date());
  const [selecting, setSelecting] = useState(null);
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
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:"#fff", border:"1px solid #e4e7ef", borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:999, minWidth:width, maxHeight:260, overflowY:"auto" }}>
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

// Builds an activity-feed entry from a raw API record. The API has no
// audit-log endpoint, so this reconstructs "what happened" from timestamps
// and status fields on the real records themselves - nothing here is
// invented data.
function toLogEntry(record, module, userMap) {
  const created = record.created_at, updated = record.updated_at;
  const isDeleted = !!record.deleted_at;
  const isNew = created && updated && created === updated;
  const action = isDeleted ? "DELETE" : isNew ? "CREATE" : "UPDATE";
  const actorId = record.created_by;
  const actor = actorId && userMap.get(actorId);
  const status = isDeleted ? "Failed" : record.status === "inactive" ? "Warning" : "Success";

  let recordCode, details;
  if (module === "Items") {
    recordCode = record.sku || `ITEM-${record.id}`;
    details = `Item "${record.name}"${record.status === "inactive" ? " (inactive)" : ""}`;
  } else if (module === "Users") {
    recordCode = `USER-${record.id}`;
    details = `User "${record.name}" (${record.email})`;
  } else if (module === "Categories") {
    recordCode = record.code || `CAT-${record.id}`;
    details = `Category "${record.name}"`;
  } else if (module === "Suppliers") {
    recordCode = record.code || `SUP-${record.id}`;
    details = `Supplier "${record.name}"`;
  } else {
    recordCode = `UNIT-${record.id}`;
    details = `Unit "${record.name}" (${record.abbreviation})`;
  }

  const ts = updated || created;
  const dt = ts ? new Date(ts) : null;

  return {
    id: `${module}-${record.id}`,
    dateObj: dt,
    date: dt ? dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-",
    time: dt ? dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-",
    user: actor ? actor.name : "System",
    role: actor ? (actor.roles?.[0]?.name.replace(/_/g, " ") || "-") : "-",
    initials: initials(actor ? actor.name : "System"),
    color: colorFor(actor ? actor.name : "System"),
    action,
    module,
    record: recordCode,
    details: details.length > 32 ? details.slice(0, 32) + "…" : details,
    fullDetails: details,
    status,
    raw: record,
  };
}

export default function AuditLogs() {
  // --- Auth ---
  const [token, setToken] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting");
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState(DEFAULT_EMAIL);
  const [loginPassword, setLoginPassword] = useState(DEFAULT_PASSWORD);

  const login = useCallback(async (email, password) => {
    setAuthStatus("connecting");
    setAuthError("");
    try {
      const json = await apiFetch("/api/v1/auth/login", { method: "POST", body: { email, password } });
      setToken(json.data.access_token);
      setAuthStatus("ok");
    } catch (err) {
      setAuthStatus("error");
      setAuthError(err.message || "Could not reach the API");
    }
  }, []);
  useEffect(() => { login(DEFAULT_EMAIL, DEFAULT_PASSWORD); }, [login]);

  // --- Live activity feed, built from real records across the system ---
  const [logs, setLogs] = useState([]);
  const [usersTotal, setUsersTotal] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const loadActivity = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError("");
    try {
      const [items, categories, suppliers, units, users] = await Promise.all([
        fetchAllPages("/api/v1/items", token),
        fetchAllPages("/api/v1/categories", token),
        fetchAllPages("/api/v1/suppliers", token),
        fetchAllPages("/api/v1/units", token),
        fetchAllPages("/api/v1/users", token),
      ]);
      const userMap = new Map(users.map(u => [u.id, u]));
      const entries = [
        ...items.map(r => toLogEntry(r, "Items", userMap)),
        ...categories.map(r => toLogEntry(r, "Categories", userMap)),
        ...suppliers.map(r => toLogEntry(r, "Suppliers", userMap)),
        ...units.map(r => toLogEntry(r, "Units", userMap)),
        ...users.map(r => toLogEntry(r, "Users", userMap)),
      ].sort((a, b) => (b.dateObj?.getTime() || 0) - (a.dateObj?.getTime() || 0));
      setLogs(entries);
      setUsersTotal(users.length);
    } catch (err) {
      setDataError(err.message || "Failed to load activity from the API");
    } finally {
      setDataLoading(false);
    }
  }, [token]);
  useEffect(() => { if (token) loadActivity(); }, [token, loadActivity]);

  const modulesPresent = useMemo(() => ["All Modules", ...Array.from(new Set(logs.map(l => l.module)))], [logs]);
  const usersPresent = useMemo(() => ["All Users", ...Array.from(new Set(logs.map(l => l.user)))], [logs]);
  const ALL_ACTIONS = ["All Actions", "CREATE", "UPDATE", "DELETE"];
  const ALL_STATUS  = ["All Status", "Success", "Warning", "Failed"];

  const [search, setSearch]       = useState("");
  const [module, setModule]       = useState("All Modules");
  const [action, setAction]       = useState("All Actions");
  const [user,   setUser]         = useState("All Users");
  const [status, setStatus]       = useState("All Status");
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);
    return { start, end };
  });
  const [showCal, setShowCal]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [page, setPage]           = useState(1);
  const [toast, setToast]         = useState(null);
  const calRef = useRef();

  useEffect(() => { if (!selected && logs.length) setSelected(logs[0]); }, [logs, selected]);
  useEffect(()=>{ const h=(e)=>{ if(calRef.current&&!calRef.current.contains(e.target)) setShowCal(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  const filtered = useMemo(()=>{
    return logs.filter(l=>{
      const q = search.toLowerCase();
      const matchQ = !q || l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.module.toLowerCase().includes(q) || l.record.toLowerCase().includes(q) || l.fullDetails.toLowerCase().includes(q);
      const matchMod = module==="All Modules" || l.module===module;
      const matchAct = action==="All Actions" || l.action===action;
      const matchUsr = user==="All Users"     || l.user===user;
      const matchSts = status==="All Status"  || l.status===status;
      const matchDate = !l.dateObj || ((!dateRange.start || l.dateObj >= dateRange.start) && (!dateRange.end || l.dateObj <= new Date(dateRange.end.getTime()+86399999)));
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
      "Date": l.date, "Time": l.time, "User": l.user, "Role": l.role,
      "Action": l.action, "Module": l.module, "Record": l.record,
      "Details": l.fullDetails, "Status": l.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activity Log");
    XLSX.writeFile(wb, "InventoryPro_Activity_Log.xlsx");
    showToast("Activity log downloaded ✓");
  };

  const todayStr = new Date().toDateString();
  const todaysCount = logs.filter(l => l.dateObj && l.dateObj.toDateString() === todayStr).length;
  const criticalCount = logs.filter(l => l.status === "Failed").length;

  const metrics = [
    { label:"Total Activities", value: dataLoading ? "…" : logs.length, sub:"Derived from live records",       iconBg:"#eef2ff", color:"#4f6ef7", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { label:"Today's Activities", value: dataLoading ? "…" : todaysCount, sub: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), iconBg:"#e6faf3", color:"#22c27e", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { label:"Users",             value: usersTotal ?? "…",  sub:"Live from API",    iconBg:"#f3f0ff", color:"#8b5cf6", icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label:"Critical Activities",value: dataLoading ? "…" : criticalCount, sub:"Deleted records",iconBg:"#fff7ed", color:"#f59e0b", subAccent:true, icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ];

  const pageNums = () => {
    if (totalPages<=6) return Array.from({length:totalPages},(_,i)=>i+1);
    if (page<=3) return [1,2,3,null,totalPages-1,totalPages];
    if (page>=totalPages-2) return [1,2,null,totalPages-2,totalPages-1,totalPages];
    return [1,2,null,page-1,page,page+1,null,totalPages];
  };

  const isAuthed = authStatus === "ok" && token;

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
      <div style={{ marginBottom:12, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, lineHeight:1.2 }}>Audit Logs</h1>
          <p style={{ color:"#6b7591", fontSize:12.5, margin:"4px 0 0" }}>Activity reconstructed from live Items, Categories, Suppliers, Units and Users records - the API has no dedicated audit-log endpoint yet.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {authStatus === "connecting" && <span style={{ fontSize:11.5, color:"#6b7591" }}>Connecting…</span>}
          {isAuthed && (
            <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, fontWeight:600, color:"#16a369", background:"#e6faf3", border:"1px solid #bdf0da", borderRadius:999, padding:"5px 10px" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#16a369" }} /> Live {dataLoading && "· syncing…"}
            </span>
          )}
          <button onClick={loadActivity} disabled={!isAuthed || dataLoading} title="Refresh" style={{ width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",cursor:"pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2" style={{ transform: dataLoading ? "rotate(180deg)" : "none", transition:"transform .3s" }}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
          </button>
        </div>
      </div>

      {authStatus === "error" && (
        <div style={{ marginBottom:16, background:"#fff1f0", border:"1px solid #ffd4d0", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:12.5, color:"#c0392b" }}>{authError || "Could not connect to the API."}</span>
          <button onClick={()=>login(loginEmail, loginPassword)} style={{ fontSize:12, color:"#4f6ef7", fontWeight:600, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Retry</button>
        </div>
      )}
      {dataError && (
        <div style={{ marginBottom:16, background:"#fff7ed", border:"1px solid #fde3c2", borderRadius:10, padding:"10px 14px", fontSize:12.5, color:"#c27a0a" }}>{dataError}</div>
      )}

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
            <Dropdown options={modulesPresent} value={module} onChange={v=>{setModule(v);setPage(1);}} width={140} />
            <Dropdown options={ALL_ACTIONS} value={action} onChange={v=>{setAction(v);setPage(1);}} width={130} />
            <Dropdown options={usersPresent}   value={user}   onChange={v=>{setUser(v);setPage(1);}}   width={150} />
            <Dropdown options={ALL_STATUS}  value={status} onChange={v=>{setStatus(v);setPage(1);}} width={120} />

            <div ref={calRef} style={{ position:"relative" }}>
              <button onClick={()=>setShowCal(o=>!o)} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 12px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#1e2740",fontFamily:"inherit",whiteSpace:"nowrap" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {fmtDateRange()}
              </button>
              {showCal && <CalendarPicker value={dateRange} onChange={v=>{setDateRange(v);setPage(1);}} onClose={()=>setShowCal(false)}/>}
            </div>

            <button onClick={()=>{ setSearch(""); setModule("All Modules"); setAction("All Actions"); setUser("All Users"); setStatus("All Status"); setPage(1); }}
              style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",border:"1px solid #e4e7ef",borderRadius:8,background:"#fff",fontSize:12.5,cursor:"pointer",color:"#6b7591",fontFamily:"inherit",justifyContent:"center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
              Reset
            </button>
          </div>

          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr style={{ background:"#f8f9fb", borderBottom:"1px solid #e4e7ef" }}>
                  {["Date & Time","User","Action","Module","Record","Details","Status"].map((h,i)=>(
                    <th key={i} style={{ padding:"11px 12px", color:"#6b7591", fontWeight:500, textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataLoading && logs.length===0 ? (
                  <tr><td colSpan={7} style={{ padding:"48px 20px", textAlign:"center", color:"#9aa1b4" }}>Loading activity from the API…</td></tr>
                ) : paginated.length===0 ? (
                  <tr><td colSpan={7} style={{ padding:"48px 20px", textAlign:"center", color:"#9aa1b4" }}>No activities match your filters.</td></tr>
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
                            <div style={{ fontSize:11, color:"#9aa1b4", textTransform:"capitalize" }}>{log.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ background:ac.bg, color:ac.color, padding:"3px 9px", borderRadius:5, fontSize:11.5, fontWeight:600 }}>{log.action}</span>
                      </td>
                      <td style={{ padding:"12px 12px", color:"#6b7591", whiteSpace:"nowrap" }}>{log.module}</td>
                      <td style={{ padding:"12px 12px" }}><span className="al-link">{log.record}</span></td>
                      <td style={{ padding:"12px 12px", color:"#6b7591", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.details}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ color:sc.color, fontWeight:600, fontSize:12 }}>{log.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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

              <div style={{ padding:"12px 0", borderBottom:"1px solid #f4f6fb" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:8 }}>User</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:selected.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>{selected.initials}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12.5 }}>{selected.user}</div>
                    <div style={{ fontSize:11, color:"#9aa1b4", textTransform:"capitalize" }}>{selected.role}</div>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f4f6fb", gap:10 }}>
                <span style={{ fontSize:12.5, color:"#6b7591" }}>IP Address</span>
                <span style={{ fontSize:12.5, color:"#9aa1b4" }}>Not tracked by API</span>
              </div>

              <div style={{ padding:"10px 0", borderBottom:"1px solid #f4f6fb" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:5 }}>Details</div>
                <div style={{ fontSize:12, color:"#1e2740", lineHeight:1.6, wordBreak:"break-word" }}>{selected.fullDetails}</div>
              </div>

              <div style={{ padding:"10px 0" }}>
                <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:5 }}>Record Status</div>
                <div style={{ fontSize:12, color:"#1e2740", background:"#f8f9fb", borderRadius:7, padding:"8px 10px", wordBreak:"break-word" }}>
                  {selected.raw.status ? `status: ${selected.raw.status}` : ""}{selected.raw.deleted_at ? ` · deleted_at: ${selected.raw.deleted_at}` : ""}
                </div>
              </div>
            </div>

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
            {dataLoading ? "Loading activity…" : "Select an activity to view details"}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}