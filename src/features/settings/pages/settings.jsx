import { useCallback, useState } from "react";
import { useSettingsForm } from "../hooks/useSettingsForm";
import { useSettings } from "../hooks/useSettings";
import { useMaintenanceSettings } from "../hooks/useMaintenanceSettings";
import SettingsSidebar, { NAV_ITEMS } from "../components/SettingsSidebar";
import SettingsRightPanel from "../components/SettingsRightPanel";
import GeneralSettings from "../components/GeneralSettings";
import SystemPreferences from "../components/SystemPreferences";
import NumberingSettings from "../components/NumberingSettings";
import WarehouseSettings from "../components/WarehouseSettings";
import SecuritySettings from "../components/SecuritySettings";
import NotificationSettings from "../components/NotificationSettings";
import AuditSettings from "../components/AuditSettings";
import Toast from "../components/Toast";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [toast, setToast] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const { form, setField, hydrateFromApi, getSectionPayload } = useSettingsForm();
  const maintenance = useMaintenanceSettings();
  const {
    loading,
    loadError,
    savingSection,
    warehouses,
    auditLogCount,
    loadAll,
    saveSection,
    refreshAuditLogs,
  } = useSettings({ hydrateFromApi, getSectionPayload, showToast });

  const selectSection = (section) => {
    setActiveSection(section);
    setNavOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <>
            <GeneralSettings form={form} setField={setField} onSave={saveSection} saving={savingSection === "general"} />
            <SystemPreferences form={form} setField={setField} onSave={saveSection} saving={savingSection === "preferences"} />
            <NumberingSettings form={form} setField={setField} onSave={saveSection} saving={savingSection === "numbering"} />
          </>
        );
      case "warehouse":
        return <WarehouseSettings form={form} setField={setField} warehouses={warehouses} loading={loading} onSave={saveSection} saving={savingSection === "warehouse"} />;
      case "security":
        return <SecuritySettings form={form} setField={setField} onSave={saveSection} saving={savingSection === "security"} />;
      case "notifications":
        return <NotificationSettings form={form} setField={setField} onSave={saveSection} saving={savingSection === "notifications"} maintenance={{ ...maintenance, showToast }} />;
      case "audit":
        return <AuditSettings form={form} setField={setField} auditLogCount={auditLogCount} onSave={saveSection} saving={savingSection === "audit"} />;
      default:
        return <div className="st-card" style={{background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:48,textAlign:"center",color:"#9aa1b4",fontSize:13}}>This section is coming soon.</div>;
    }
  };

  const activeNavItem = NAV_ITEMS.find((item) => item.key === activeSection);

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif", fontSize:13, color:"#1e2740" }}>
      <Toast msg={toast} />
      <style>{`
        .st-layout { display:grid; grid-template-columns:250px minmax(0,1fr) 280px; gap:16px; align-items:start; }
        .st-nav { position:sticky; top:20px; }
        .st-right { position:sticky; top:20px; }
        .st-navmobile-toggle { display:none; }
        @media (max-width: 1200px) {
          .st-layout { grid-template-columns:220px minmax(0,1fr); }
          .st-right { grid-column:1/-1; position:static; display:grid !important; grid-template-columns:1fr 1fr 1fr; }
        }
        @media (max-width: 900px) {
          .st-layout { grid-template-columns:1fr; }
          .st-nav { position:static; display:none; }
          .st-nav.open { display:block; }
          .st-navmobile-toggle { display:flex; }
          .st-right { grid-template-columns:1fr; }
        }
        @media (max-width: 640px) {
          .st-card { padding:18px !important; }
          .st-fieldrow { grid-template-columns:1fr !important; gap:12px !important; }
          .st-togglegrid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div className="st-page" style={{ paddingBottom:0 }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, lineHeight:1.2 }}>Settings</h1>
          <p style={{ color:"#6b7591", fontSize:12.5, margin:"4px 0 0" }}>Manage system configuration and preferences.</p>
        </div>

        {loadError && <div style={{background:"#fff5f5",border:"1px solid #fecaca",color:"#b91c1c",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:12.5,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><span>Couldn't load live settings: {loadError}</span><button type="button" onClick={loadAll} style={{border:"1px solid #fecaca",background:"#fff",color:"#b91c1c",borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Retry</button></div>}

        <button className="st-navmobile-toggle" type="button" onClick={()=>setNavOpen((v)=>!v)} style={{alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 16px",marginBottom:12,background:"#fff",border:"1px solid #e4e7ef",borderRadius:10,fontFamily:"inherit",cursor:"pointer"}}><span style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:"#4f6ef7"}}>{activeNavItem?.icon}</span><span style={{fontSize:13.5,fontWeight:600,color:"#1e2740"}}>{activeNavItem?.label}</span></span><span>⌄</span></button>

        <div className="st-layout">
          <SettingsSidebar activeSection={activeSection} onChange={selectSection} navOpen={navOpen} />
          <div style={{ minWidth:0 }}>
            {loading ? <div style={{background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:48,textAlign:"center",color:"#9aa1b4"}}>Loading settings…</div> : renderSection()}
          </div>
          <SettingsRightPanel form={form} warehouses={warehouses} auditLogCount={auditLogCount} onViewLogs={refreshAuditLogs} showToast={showToast} />
        </div>
      </div>
    </div>
  );
}
