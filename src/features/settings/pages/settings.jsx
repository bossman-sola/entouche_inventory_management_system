import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../../shared/api/entoucheApi";

function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?"#4f6ef7":"#d1d5e0", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: value?20:3, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left .2s" }}/>
    </div>
  );
}

const SectionHead = ({title, sub}) => (
  <div style={{ marginBottom:22 }}>
    <div style={{ fontSize:16, fontWeight:700, color:"#1e2740", marginBottom:4 }}>{title}</div>
    <div style={{ fontSize:12.5, color:"#6b7591" }}>{sub}</div>
  </div>
);


const FieldRow = ({children, cols="1fr 1fr 1fr"}) => (
  <div className="st-fieldrow" style={{ display:"grid", gridTemplateColumns:cols, gap:16, marginBottom:16 }}>{children}</div>
);


const Field = ({label, children}) => (
  <div style={{ minWidth:0 }}>
    <label style={{ fontSize:12, color:"#6b7591", display:"block", marginBottom:6 }}>{label}</label>
    {children}
  </div>
);

const Inp = ({value, onChange, readOnly, placeholder}) => (
  <input value={value} onChange={e=>onChange&&onChange(e.target.value)} readOnly={readOnly} placeholder={placeholder}
    style={{ width:"100%", padding:"9px 12px", border:"1px solid #e4e7ef", borderRadius:8, fontSize:13, fontFamily:"inherit", color:"#1e2740", outline:"none", background:readOnly?"#f8f9fb":"#fff", boxSizing:"border-box", transition:"border .15s" }}
    onFocus={e=>{if(!readOnly)e.target.style.borderColor="#4f6ef7"}} onBlur={e=>e.target.style.borderColor="#e4e7ef"}
  />
);

/* ─── Select ─── */
const Sel = ({value, onChange, options, disabled}) => (
  <div style={{ position:"relative" }}>
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{ width:"100%", padding:"9px 32px 9px 12px", border:"1px solid #e4e7ef", borderRadius:8, fontSize:13, fontFamily:"inherit", color:"#1e2740", outline:"none", appearance:"none", background:disabled?"#f8f9fb":"#fff", cursor:disabled?"default":"pointer", boxSizing:"border-box" }}>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
    <svg style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
);

/* ─── Save Button ─── */
const SaveBtn = ({onClick, saving}) => (
  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
    <button onClick={onClick} disabled={saving} style={{ padding:"10px 28px", background: saving?"#9aabf5":"#4f6ef7", border:"none", borderRadius:8, fontSize:13.5, fontWeight:600, color:"#fff", cursor:saving?"default":"pointer", fontFamily:"inherit", transition:"background .15s" }}
      onMouseEnter={e=>{ if(!saving) e.currentTarget.style.background="#3a5be0"; }} onMouseLeave={e=>{ if(!saving) e.currentTarget.style.background="#4f6ef7"; }}>
      {saving ? "Saving…" : "Save Changes"}
    </button>
  </div>
);

/* ─── Section Divider ─── */
const Divider = () => <div style={{ borderTop:"1px solid #e4e7ef", margin:"28px 0" }}/>;

/* ─── Toast ─── */
const Toast = ({msg})=>(<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#1e2740",color:"#fff",padding:"10px 22px",borderRadius:9,fontSize:13,fontWeight:500,zIndex:99999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",maxWidth:"calc(100vw - 32px)",overflow:"hidden",textOverflow:"ellipsis" }}>{msg}</div>);

/* ─── NAV SECTIONS ─── */
const NAV_ITEMS = [
  { key:"general",      label:"General",        sub:"Company, system and localization",  icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { key:"warehouse",    label:"Warehouse",       sub:"Manage warehouses and locations",   icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key:"inventory",    label:"Inventory",       sub:"Stock, numbering and preferences",  icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
  { key:"users",        label:"Users & Roles",   sub:"Default roles and permissions",     icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key:"notifications",label:"Notifications",   sub:"Email and system alerts",           icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { key:"integrations", label:"Integrations",    sub:"Third-party services and API",      icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { key:"backup",       label:"Backup & Restore",sub:"Data backup and restore",           icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
  { key:"security",     label:"Security",        sub:"Password, sessions and policies",   icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { key:"audit",        label:"Audit",           sub:"Audit log and retention settings",  icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
];

/* ─── Settings-key map ───
   GET /settings returns { [group]: { "group.key": { value, type } } }.
   The doc only shows two confirmed keys (general.company_name,
   general.currency, numbering.receipt_prefix) — the rest below follow the
   same "group.snake_case_field" convention but haven't been individually
   confirmed against a live response. If the backend uses different key
   names, hydration below will just silently keep the current UI default
   (see `hydrate`) and Save will write new keys rather than break — but
   it's worth diffing this map against a real GET /settings payload once
   the backend has data seeded. */
const SETTINGS_MAP = {
  general: {
    companyName:  "general.company_name",
    companyEmail: "general.company_email",
    companyPhone: "general.company_phone",
    country:      "general.country",
    timezone:     "general.timezone",
    dateFormat:   "general.date_format",
    timeFormat:   "general.time_format",
    currency:     "general.currency",
    language:     "general.language",
  },
  preferences: {
    lowStockAlerts:     "inventory.low_stock_alerts",
    emailNotifications: "notifications.email_notifications",
    allowNegativeStock: "inventory.allow_negative_stock",
    requireReasonAdj:   "inventory.require_reason_adjustment",
    autoGenerateSku:    "inventory.auto_generate_sku",
    sessionTimeout:     "security.session_timeout",
  },
  numbering: {
    itemPrefix:       "numbering.item_prefix",
    inventoryPrefix:  "numbering.inventory_prefix",
    transferPrefix:   "numbering.transfer_prefix",
    receiptPrefix:    "numbering.receipt_prefix",
    adjustmentPrefix: "numbering.adjustment_prefix",
    numberingReset:   "numbering.reset_period",
  },
  warehouse: {
    defaultWarehouse:   "warehouse.default_warehouse",
    warehousePrefix:    "warehouse.prefix",
    enableBinLocations: "warehouse.enable_bin_locations",
    requireLocation:    "warehouse.require_location_on_receipt",
  },
  security: {
    minPasswordLength: "security.min_password_length",
    requireUppercase:  "security.require_uppercase",
    requireNumbers:    "security.require_numbers",
    twoFactorAuth:     "security.two_factor_auth",
    maxLoginAttempts:  "security.max_login_attempts",
    lockoutDuration:   "security.lockout_duration",
  },
  notifications: {
    notifyEmail:    "notifications.notify_email",
    lowStockEmail:  "notifications.low_stock_email",
    receiptAlerts:  "notifications.receipt_alerts",
    transferAlerts: "notifications.transfer_alerts",
    dailyDigest:    "notifications.daily_digest",
  },
  audit: {
    retentionPeriod: "audit.retention_period",
    logLogins:       "audit.log_logins",
    logDataChanges:  "audit.log_data_changes",
    logExports:      "audit.log_exports",
    autoDeleteLogs:  "audit.auto_delete_logs",
  },
};

// Coerce a { value, type } settings entry into a JS value matching what
// the local <input>/<select>/<Toggle> state expects.
function coerceSetting(entry) {
  if (!entry) return undefined;
  const { value, type } = entry;
  if (type === "boolean") return value === true || value === "true" || value === 1 || value === "1";
  if (type === "integer" || type === "number") return String(value);
  return value ?? "";
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  // Live API state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingSection, setSavingSection] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [auditLogCount, setAuditLogCount] = useState(null);

  /* ── General ── */
  const [companyName,  setCompanyName]  = useState("Ross & Co. Global Resources");
  const [companyEmail, setCompanyEmail] = useState("info@rossglobal.com");
  const [companyPhone, setCompanyPhone] = useState("+234 803 123 4567");
  const [country,      setCountry]      = useState("Nigeria");
  const [timezone,     setTimezone]     = useState("(UTC+01:00) West Africa Time (WAT)");
  const [dateFormat,   setDateFormat]   = useState("May 27, 2025");
  const [timeFormat,   setTimeFormat]   = useState("12 Hour (hh:mm AM/PM)");
  const [currency,     setCurrency]     = useState("NGN (₦) - Nigerian Naira");
  const [language,     setLanguage]     = useState("English (US)");

  /* ── System Preferences ── */
  const [lowStockAlerts,       setLowStockAlerts]       = useState(true);
  const [emailNotifications,   setEmailNotifications]   = useState(true);
  const [allowNegativeStock,   setAllowNegativeStock]   = useState(false);
  const [requireReasonAdj,     setRequireReasonAdj]     = useState(true);
  const [autoGenerateSku,      setAutoGenerateSku]      = useState(true);
  const [sessionTimeout,       setSessionTimeout]       = useState("30");

  /* ── Document & Numbering ── */
  const [itemPrefix,        setItemPrefix]        = useState("ITM");
  const [inventoryPrefix,   setInventoryPrefix]   = useState("INV");
  const [transferPrefix,    setTransferPrefix]    = useState("TRF");
  const [receiptPrefix,     setReceiptPrefix]     = useState("RCV");
  const [adjustmentPrefix,  setAdjustmentPrefix]  = useState("ADJ");
  const [numberingReset,    setNumberingReset]    = useState("Do not reset");

  /* ── Warehouse Settings ── */
  const [defaultWarehouse,    setDefaultWarehouse]    = useState("Storage Area");
  const [warehousePrefix,     setWarehousePrefix]     = useState("WH");
  const [enableBinLocations,  setEnableBinLocations]  = useState(false);
  const [requireLocation,     setRequireLocation]     = useState(true);

  /* ── Security ── */
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireUppercase,  setRequireUppercase]  = useState(true);
  const [requireNumbers,    setRequireNumbers]    = useState(true);
  const [twoFactorAuth,     setTwoFactorAuth]     = useState(false);
  const [maxLoginAttempts,  setMaxLoginAttempts]  = useState("5");
  const [lockoutDuration,   setLockoutDuration]   = useState("15");

  /* ── Notifications ── */
  const [lowStockEmail,   setLowStockEmail]   = useState(true);
  const [receiptAlerts,   setReceiptAlerts]   = useState(true);
  const [transferAlerts,  setTransferAlerts]  = useState(false);
  const [dailyDigest,     setDailyDigest]     = useState(true);
  const [notifyEmail,     setNotifyEmail]     = useState("info@rossglobal.com");

  /* ── Audit ── */
  const [retentionPeriod, setRetentionPeriod] = useState("12 months");
  const [logLogins,       setLogLogins]       = useState(true);
  const [logDataChanges,  setLogDataChanges]  = useState(true);
  const [logExports,      setLogExports]      = useState(true);
  const [autoDeleteLogs,  setAutoDeleteLogs]  = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2600); };

  // Every piece of state above, keyed the same way SETTINGS_MAP keys its
  // fields, so hydrate/save can loop generically instead of a 40-line
  // switch statement.
  const stateByField = {
    companyName:  [companyName, setCompanyName],
    companyEmail: [companyEmail, setCompanyEmail],
    companyPhone: [companyPhone, setCompanyPhone],
    country:      [country, setCountry],
    timezone:     [timezone, setTimezone],
    dateFormat:   [dateFormat, setDateFormat],
    timeFormat:   [timeFormat, setTimeFormat],
    currency:     [currency, setCurrency],
    language:     [language, setLanguage],

    lowStockAlerts:     [lowStockAlerts, setLowStockAlerts],
    emailNotifications: [emailNotifications, setEmailNotifications],
    allowNegativeStock: [allowNegativeStock, setAllowNegativeStock],
    requireReasonAdj:   [requireReasonAdj, setRequireReasonAdj],
    autoGenerateSku:    [autoGenerateSku, setAutoGenerateSku],
    sessionTimeout:     [sessionTimeout, setSessionTimeout],

    itemPrefix:       [itemPrefix, setItemPrefix],
    inventoryPrefix:  [inventoryPrefix, setInventoryPrefix],
    transferPrefix:   [transferPrefix, setTransferPrefix],
    receiptPrefix:    [receiptPrefix, setReceiptPrefix],
    adjustmentPrefix: [adjustmentPrefix, setAdjustmentPrefix],
    numberingReset:   [numberingReset, setNumberingReset],

    defaultWarehouse:   [defaultWarehouse, setDefaultWarehouse],
    warehousePrefix:    [warehousePrefix, setWarehousePrefix],
    enableBinLocations: [enableBinLocations, setEnableBinLocations],
    requireLocation:    [requireLocation, setRequireLocation],

    minPasswordLength: [minPasswordLength, setMinPasswordLength],
    requireUppercase:  [requireUppercase, setRequireUppercase],
    requireNumbers:    [requireNumbers, setRequireNumbers],
    twoFactorAuth:     [twoFactorAuth, setTwoFactorAuth],
    maxLoginAttempts:  [maxLoginAttempts, setMaxLoginAttempts],
    lockoutDuration:   [lockoutDuration, setLockoutDuration],

    notifyEmail:    [notifyEmail, setNotifyEmail],
    lowStockEmail:  [lowStockEmail, setLowStockEmail],
    receiptAlerts:  [receiptAlerts, setReceiptAlerts],
    transferAlerts: [transferAlerts, setTransferAlerts],
    dailyDigest:    [dailyDigest, setDailyDigest],

    retentionPeriod: [retentionPeriod, setRetentionPeriod],
    logLogins:       [logLogins, setLogLogins],
    logDataChanges:  [logDataChanges, setLogDataChanges],
    logExports:      [logExports, setLogExports],
    autoDeleteLogs:  [autoDeleteLogs, setAutoDeleteLogs],
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [settingsRes, warehousesRes, auditRes] = await Promise.allSettled([
        api.listSettings(),
        api.listWarehouses(),
        api.listAuditLogs(),
      ]);

      if (settingsRes.status === "fulfilled" && settingsRes.value) {
        // Flatten { group: { "group.key": {value,type} } } -> { "group.key": coercedValue }
        const flat = {};
        Object.values(settingsRes.value).forEach(group => {
          Object.entries(group || {}).forEach(([key, entry]) => {
            flat[key] = coerceSetting(entry);
          });
        });
        Object.values(SETTINGS_MAP).forEach(fieldMap => {
          Object.entries(fieldMap).forEach(([field, settingKey]) => {
            if (flat[settingKey] !== undefined) {
              const [, setter] = stateByField[field];
              setter(flat[settingKey]);
            }
          });
        });
      } else if (settingsRes.status === "rejected") {
        setLoadError(settingsRes.reason?.message || "Failed to load settings");
      }

      setWarehouses(warehousesRes.status === "fulfilled" ? (warehousesRes.value || []) : []);

      if (auditRes.status === "fulfilled") {
        const val = auditRes.value;
        const count = Array.isArray(val) ? val.length : (val?.total ?? val?.data?.length ?? null);
        setAuditLogCount(count);
      }
    } catch (e) {
      setLoadError(e.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const warehouseOptions = useMemo(() => {
    const names = warehouses.map(w => w.name).filter(Boolean);
    // Keep the current selection visible even if it's not in the fetched
    // list yet (e.g. still loading, or the saved setting predates the
    // warehouse being renamed/deleted).
    return names.includes(defaultWarehouse) ? names : [defaultWarehouse, ...names];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouses]);

  const handleSaveSection = async (sectionKey) => {
    const fieldMap = SETTINGS_MAP[sectionKey];
    if (!fieldMap) { showToast("Nothing to save for this section"); return; }
    const payload = {};
    Object.entries(fieldMap).forEach(([field, settingKey]) => {
      payload[settingKey] = stateByField[field][0];
    });
    setSavingSection(sectionKey);
    try {
      await api.bulkUpdateSettings(payload);
      showToast("Settings saved successfully ✓");
    } catch (e) {
      showToast(`Couldn't save settings: ${e.message}`);
    } finally {
      setSavingSection(null);
    }
  };

  // Backup Now / Restore from Backup / Clear Cache have no corresponding
  // endpoints in the API (no backup, restore, or cache-clear routes exist)
  // — surface that honestly instead of faking a success toast.
  // "View System Logs" is the one action with a real match: audit logs.
  const actionItems = [
    { label:"Backup Now",         sub:"Create a backup of your data now", color:"#4f6ef7", available:false, icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
    { label:"Restore from Backup",sub:"Restore data from a previous backup", color:"#f59e0b", available:false, icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg> },
    { label:"Clear Cache",        sub:"Improve system performance", color:"#8b5cf6", available:false, icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> },
    { label:"View System Logs",   sub:"View system activity logs", color:"#22c27e", available:true, icon:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  ];

  const handleAction = async (item) => {
    if (!item.available) {
      showToast(`${item.label} isn't available yet — no matching endpoint`);
      return;
    }
    // View System Logs -> pull a fresh count from /audit-logs
    try {
      const res = await api.listAuditLogs();
      const count = Array.isArray(res) ? res.length : (res?.total ?? res?.data?.length ?? 0);
      setAuditLogCount(count);
      showToast(`${count} audit log entr${count===1?"y":"ies"} recorded`);
    } catch (e) {
      showToast(`Couldn't load audit logs: ${e.message}`);
    }
  };

  const renderSection = () => {
    switch(activeSection) {

      case "general": return (
        <>
          {/* General Settings */}
          <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28, marginBottom:16 }} className="st-card">
            <SectionHead title="General Settings" sub="Configure basic information about your organization and system." />
            <FieldRow cols="1fr 1fr 1fr">
              <Field label="Company Name"><Inp value={companyName} onChange={setCompanyName}/></Field>
              <Field label="Company Email"><Inp value={companyEmail} onChange={setCompanyEmail}/></Field>
              <Field label="Company Phone"><Inp value={companyPhone} onChange={setCompanyPhone}/></Field>
            </FieldRow>
            <FieldRow cols="1fr 1fr 1fr">
              <Field label="Country"><Sel value={country} onChange={setCountry} options={["Nigeria","Ghana","Kenya","South Africa","United States","United Kingdom"]}/></Field>
              <Field label="Time Zone"><Sel value={timezone} onChange={setTimezone} options={["(UTC+01:00) West Africa Time (WAT)","(UTC+00:00) GMT","(UTC-05:00) Eastern Time","(UTC+03:00) East Africa Time"]}/></Field>
              <Field label="Date Format"><Inp value={dateFormat} onChange={setDateFormat}/></Field>
            </FieldRow>
            <FieldRow cols="1fr 1fr 1fr">
              <Field label="Time Format"><Sel value={timeFormat} onChange={setTimeFormat} options={["12 Hour (hh:mm AM/PM)","24 Hour (HH:mm)"]}/></Field>
              <Field label="Currency"><Sel value={currency} onChange={setCurrency} options={["NGN (₦) - Nigerian Naira","USD ($) - US Dollar","GBP (£) - British Pound","EUR (€) - Euro"]}/></Field>
              <Field label="Language"><Sel value={language} onChange={setLanguage} options={["English (US)","English (UK)","French","Portuguese"]}/></Field>
            </FieldRow>
            <SaveBtn onClick={()=>handleSaveSection("general")} saving={savingSection==="general"}/>
          </div>

          {/* System Preferences */}
          <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28, marginBottom:16 }} className="st-card">
            <SectionHead title="System Preferences" sub="Configure system wide preferences." />
            <div className="st-togglegrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
              {[
                [lowStockAlerts,     setLowStockAlerts,     "Low Stock Alerts",           "Enable alerts for items below reorder level."],
                [emailNotifications, setEmailNotifications, "Email Notifications",         "Send email notifications for key events."],
                [allowNegativeStock, setAllowNegativeStock, "Allow Negative Stock",        "Allow stock quantity to go below zero."],
                [requireReasonAdj,   setRequireReasonAdj,   "Require Reason on Adjustments","Users must provide reason for stock adjustments."],
                [autoGenerateSku,    setAutoGenerateSku,    "Auto Generate Item SKU",      "Automatically generate SKU for new items."],
              ].map(([val,setter,label,sub],i)=>(
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <Toggle value={val} onChange={setter}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:12, color:"#6b7591" }}>{sub}</div>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:8 }}>Session Timeout (minutes)</div>
                <div style={{ position:"relative", maxWidth:280 }}>
                  <select value={sessionTimeout} onChange={e=>setSessionTimeout(e.target.value)}
                    style={{ width:"100%", padding:"9px 32px 9px 12px", border:"1px solid #e4e7ef", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", appearance:"none", background:"#fff" }}>
                    {["15","30","60","120"].map(v=><option key={v}>{v}</option>)}
                  </select>
                  <svg style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div style={{ fontSize:12, color:"#9aa1b4", marginTop:5 }}>Automatically log out inactive users.</div>
              </div>
            </div>
            <SaveBtn onClick={()=>handleSaveSection("preferences")} saving={savingSection==="preferences"}/>
          </div>

          {/* Document & Numbering */}
          <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }} className="st-card">
            <SectionHead title="Document & Numbering" sub="Configure document prefixes and numbering." />
            <FieldRow cols="1fr 1fr 1fr 1fr 1fr">
              <Field label="Item Prefix"><Inp value={itemPrefix} onChange={setItemPrefix}/></Field>
              <Field label="Inventory Prefix"><Inp value={inventoryPrefix} onChange={setInventoryPrefix}/></Field>
              <Field label="Transfer Prefix"><Inp value={transferPrefix} onChange={setTransferPrefix}/></Field>
              <Field label="Receipt Prefix"><Inp value={receiptPrefix} onChange={setReceiptPrefix}/></Field>
              <Field label="Adjustment Prefix"><Inp value={adjustmentPrefix} onChange={setAdjustmentPrefix}/></Field>
            </FieldRow>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#6b7591", marginBottom:6 }}>Numbering Reset</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                {["Do not reset","Monthly","Yearly"].map(opt=>(
                  <button key={opt} onClick={()=>setNumberingReset(opt)} style={{ padding:"7px 16px", border:`1px solid ${numberingReset===opt?"#4f6ef7":"#e4e7ef"}`, borderRadius:7, background: numberingReset===opt?"#eef2ff":"#fff", color: numberingReset===opt?"#4f6ef7":"#1e2740", fontSize:12.5, cursor:"pointer", fontFamily:"inherit", fontWeight: numberingReset===opt?600:400 }}>{opt}</button>
                ))}
                <span style={{ fontSize:12, color:"#9aa1b4" }}>Numbers will continue sequentially.</span>
              </div>
            </div>
            <SaveBtn onClick={()=>handleSaveSection("numbering")} saving={savingSection==="numbering"}/>
          </div>
        </>
      );

      case "warehouse": return (
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }} className="st-card">
          <SectionHead title="Warehouse Settings" sub="Manage warehouse and location preferences."/>
          <FieldRow cols="1fr 1fr">
            <Field label="Default Warehouse">
              <Sel value={defaultWarehouse} onChange={setDefaultWarehouse} options={warehouseOptions} disabled={warehouses.length===0}/>
            </Field>
            <Field label="Warehouse Prefix"><Inp value={warehousePrefix} onChange={setWarehousePrefix}/></Field>
          </FieldRow>
          {warehouses.length===0 && !loading && (
            <div style={{ fontSize:12, color:"#9aa1b4", marginTop:-8, marginBottom:16 }}>No warehouses returned by the API yet — showing the saved value only.</div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
            {[
              [enableBinLocations, setEnableBinLocations, "Enable Bin Locations",     "Allow items to be assigned to specific bin locations."],
              [requireLocation,    setRequireLocation,    "Require Location on Receipt","Location must be specified when receiving items."],
            ].map(([val,setter,label,sub],i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Toggle value={val} onChange={setter}/>
                <div><div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 }}>{label}</div><div style={{ fontSize:12, color:"#6b7591" }}>{sub}</div></div>
              </div>
            ))}
          </div>
          <SaveBtn onClick={()=>handleSaveSection("warehouse")} saving={savingSection==="warehouse"}/>
        </div>
      );

      case "security": return (
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }} className="st-card">
          <SectionHead title="Security Settings" sub="Configure password policies, sessions and security options."/>
          <FieldRow cols="1fr 1fr 1fr">
            <Field label="Minimum Password Length"><Sel value={minPasswordLength} onChange={setMinPasswordLength} options={["6","8","10","12"]}/></Field>
            <Field label="Max Login Attempts"><Sel value={maxLoginAttempts} onChange={setMaxLoginAttempts} options={["3","5","10"]}/></Field>
            <Field label="Lockout Duration (mins)"><Sel value={lockoutDuration} onChange={setLockoutDuration} options={["5","10","15","30","60"]}/></Field>
          </FieldRow>
          <div className="st-togglegrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              [requireUppercase, setRequireUppercase, "Require Uppercase Letters",   "Passwords must contain at least one uppercase letter."],
              [requireNumbers,   setRequireNumbers,   "Require Numbers",             "Passwords must contain at least one number."],
              [twoFactorAuth,    setTwoFactorAuth,    "Two-Factor Authentication",   "Require 2FA for all user accounts."],
            ].map(([val,setter,label,sub],i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Toggle value={val} onChange={setter}/>
                <div><div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 }}>{label}</div><div style={{ fontSize:12, color:"#6b7591" }}>{sub}</div></div>
              </div>
            ))}
          </div>
          <SaveBtn onClick={()=>handleSaveSection("security")} saving={savingSection==="security"}/>
        </div>
      );

      case "notifications": return (
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }} className="st-card">
          <SectionHead title="Notification Settings" sub="Configure email and system alert preferences."/>
          <Field label="Notification Email"><Inp value={notifyEmail} onChange={setNotifyEmail}/></Field>
          <div style={{ height:16 }}/>
          <div className="st-togglegrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              [lowStockEmail,  setLowStockEmail,  "Low Stock Email Alerts",  "Receive emails when items fall below reorder level."],
              [receiptAlerts,  setReceiptAlerts,  "Receipt Alerts",          "Notifications when goods are received."],
              [transferAlerts, setTransferAlerts, "Transfer Alerts",         "Notifications for inventory transfers."],
              [dailyDigest,    setDailyDigest,    "Daily Digest",            "Receive a daily summary of all activities."],
            ].map(([val,setter,label,sub],i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Toggle value={val} onChange={setter}/>
                <div><div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 }}>{label}</div><div style={{ fontSize:12, color:"#6b7591" }}>{sub}</div></div>
              </div>
            ))}
          </div>
          <SaveBtn onClick={()=>handleSaveSection("notifications")} saving={savingSection==="notifications"}/>
        </div>
      );

      case "audit": return (
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }} className="st-card">
          <SectionHead title="Audit Settings" sub="Configure audit log and data retention settings."/>
          {auditLogCount !== null && (
            <div style={{ fontSize:12.5, color:"#6b7591", marginBottom:16 }}>{auditLogCount} audit log entr{auditLogCount===1?"y":"ies"} currently recorded.</div>
          )}
          <div style={{ marginBottom:16 }}>
            <Field label="Log Retention Period">
              <Sel value={retentionPeriod} onChange={setRetentionPeriod} options={["3 months","6 months","12 months","24 months","Indefinitely"]}/>
            </Field>
          </div>
          <div className="st-togglegrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              [logLogins,      setLogLogins,      "Log User Logins",     "Record all login and logout events."],
              [logDataChanges, setLogDataChanges, "Log Data Changes",    "Record all create, update and delete operations."],
              [logExports,     setLogExports,     "Log Data Exports",    "Record all data export and download events."],
              [autoDeleteLogs, setAutoDeleteLogs, "Auto-Delete Old Logs","Automatically delete logs older than retention period."],
            ].map(([val,setter,label,sub],i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Toggle value={val} onChange={setter}/>
                <div><div style={{ fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 }}>{label}</div><div style={{ fontSize:12, color:"#6b7591" }}>{sub}</div></div>
              </div>
            ))}
          </div>
          <SaveBtn onClick={()=>handleSaveSection("audit")} saving={savingSection==="audit"}/>
        </div>
      );

      default: return (
        <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:48, textAlign:"center", color:"#9aa1b4", fontSize:13 }} className="st-card">
          This section is coming soon.
        </div>
      );
    }
  };

  const activeNavItem = NAV_ITEMS.find(n => n.key === activeSection);

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif", fontSize:13, color:"#1e2740" }}>
      {toast && <Toast msg={toast}/>}

      <style>{`
        .st-page { padding: 16px; }
        .st-layout { display:grid; grid-template-columns:250px 1fr 280px; gap:16px; align-items:start; }
        .st-nav { position:sticky; top:20px; }
        .st-right { position:sticky; top:20px; }

        .st-navmobile-toggle { display:none; }

        @media (max-width: 1100px) {
          .st-layout { grid-template-columns: 220px 1fr; }
          .st-right { grid-column: 1 / -1; position:static; display:grid !important; grid-template-columns:1fr 1fr; }
        }

        @media (max-width: 860px) {
          .st-layout { grid-template-columns: 1fr; }
          .st-nav { position:static; display:none; }
          .st-nav.open { display:block; }
          .st-navmobile-toggle { display:flex; }
          .st-right { grid-template-columns:1fr; }
        }

        @media (max-width: 640px) {
          .st-page { padding: 12px; }
          .st-card { padding: 18px !important; }
          .st-fieldrow { grid-template-columns: 1fr !important; gap: 12px !important; }
          .st-togglegrid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="st-page" style={{ paddingBottom: 0 }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, lineHeight:1.2 }}>Settings</h1>
          <p style={{ color:"#6b7591", fontSize:12.5, margin:"4px 0 0" }}>Manage system configuration and preferences.</p>
        </div>

        {loadError && (
          <div style={{ background:"#fff5f5", border:"1px solid #fecaca", color:"#b91c1c", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:12.5, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <span>Couldn't load live settings: {loadError}</span>
            <button onClick={loadAll} style={{ border:"1px solid #fecaca", background:"#fff", color:"#b91c1c", borderRadius:6, padding:"4px 10px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>Retry</button>
          </div>
        )}

        {/* Mobile nav toggle */}
        <button className="st-navmobile-toggle" onClick={()=>setNavOpen(o=>!o)}
          style={{ alignItems:"center", justifyContent:"space-between", width:"100%", padding:"12px 16px", marginBottom:12, background:"#fff", border:"1px solid #e4e7ef", borderRadius:10, fontFamily:"inherit", cursor:"pointer" }}>
          <span style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ color:"#4f6ef7" }}>{activeNavItem?.icon}</span>
            <span style={{ fontSize:13.5, fontWeight:600, color:"#1e2740" }}>{activeNavItem?.label}</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="2" style={{ transform: navOpen?"rotate(180deg)":"none", transition:"transform .15s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div className="st-layout">

          {/* ── Left Nav ── */}
          <div className={`st-nav${navOpen?" open":""}`} style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, overflow:"hidden", marginBottom: 16 }}>
            {NAV_ITEMS.map(item=>{
              const isActive = activeSection===item.key;
              return (
                <button key={item.key} onClick={()=>{ setActiveSection(item.key); setNavOpen(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background: isActive?"#eef2ff":"#fff", border:"none", borderLeft: isActive?"3px solid #4f6ef7":"3px solid transparent", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"background .15s" }}
                  onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="#f8f9fb"; }} onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="#fff"; }}>
                  <div style={{ color: isActive?"#4f6ef7":"#6b7591", marginTop:1, flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight: isActive?700:500, color: isActive?"#4f6ef7":"#1e2740", marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontSize:11, color:"#9aa1b4", lineHeight:1.3 }}>{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Center Content ── */}
          <div style={{ minWidth:0 }}>{loading ? (
            <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:48, textAlign:"center", color:"#9aa1b4" }}>Loading settings…</div>
          ) : renderSection()}</div>

          {/* ── Right Panel ── */}
          <div className="st-right" style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Company Info */}
            <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid #e4e7ef", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700, fontSize:13.5, color:"#1e2740" }}>Company Information</span>
                <button onClick={()=>{ setActiveSection("general"); setNavOpen(false); }} style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 12px",border:"1px solid #e4e7ef",borderRadius:7,background:"#fff",fontSize:12,cursor:"pointer",color:"#4f6ef7",fontFamily:"inherit",fontWeight:500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              </div>
              <div style={{ padding:"18px 18px 6px" }}>
                {/* Logo placeholder — no logo-upload endpoint exists yet */}
                <div style={{ width:56, height:56, background:"#f4f6fb", border:"1px solid #e4e7ef", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                </div>
                <div style={{ textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#1e2740" }}>{companyName}</div>
                  <div style={{ fontSize:12, color:"#9aa1b4", marginTop:3 }}>Enterprise Inventory Management</div>
                </div>
                {[
                  ["Email", companyEmail],
                  ["Phone", companyPhone],
                ].map(([label,val])=>(
                  <div key={label} style={{ display:"flex", gap:8, padding:"8px 0", borderTop:"1px solid #f4f6fb" }}>
                    <span style={{ fontSize:12, color:"#9aa1b4", width:55, flexShrink:0 }}>{label}</span>
                    <span style={{ fontSize:12, color:"#1e2740", wordBreak:"break-all" }}>{val}</span>
                  </div>
                ))}
                {/* Address / Website aren't part of the settings schema
                    the API exposes (general.* only has name/email/phone/
                    country/timezone/date/time/currency/language in the
                    documented example) — omitted rather than faked. */}
              </div>
            </div>

            {/* System Details — no /system, /version, or /backup endpoints
                exist in the API, so this stays static rather than pretend
                it's live. */}
            <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:18 }}>
              <div style={{ fontWeight:700, fontSize:13.5, color:"#1e2740", marginBottom:14 }}>System Details</div>
              {[
                ["Audit Log Entries", auditLogCount !== null ? String(auditLogCount) : "—"],
                ["Warehouses",        String(warehouses.length)],
              ].map(([label,val])=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 0", borderBottom:"1px solid #f4f6fb", gap:10 }}>
                  <span style={{ fontSize:12, color:"#9aa1b4" }}>{label}</span>
                  <span style={{ fontSize:12, color:"#1e2740", fontWeight:500, textAlign:"right", maxWidth:140 }}>{val}</span>
                </div>
              ))}
              <div style={{ fontSize:11, color:"#c9cedd", marginTop:8 }}>Version, environment and backup info aren't exposed by the API yet.</div>
            </div>

            {/* Actions */}
            <div style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:18 }}>
              <div style={{ fontWeight:700, fontSize:13.5, color:"#1e2740", marginBottom:14 }}>Actions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {actionItems.map((a,i)=>(
                  <button key={i} onClick={()=>handleAction(a)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", border:"1px solid #f4f6fb", borderRadius:9, background:"#fff", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"background .15s", width:"100%", opacity:a.available?1:0.55 }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8f9fb"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                    <div style={{ width:32, height:32, borderRadius:8, background:"#f4f6fb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:a.color, marginBottom:2 }}>{a.label}</div>
                      <div style={{ fontSize:11, color:"#9aa1b4" }}>{a.available ? a.sub : "Not available — no matching endpoint"}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}