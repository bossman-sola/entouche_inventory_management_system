import Toggle from "./Toggle";
import SettingsSelect from "./SettingsSelect";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";

export default function SystemPreferences({ form, setField, onSave, saving }) {
  const toggles = [
    ["lowStockAlerts", "Low Stock Alerts", "Enable alerts for items below reorder level."],
    ["emailNotifications", "Email Notifications", "Send email notifications for key events."],
    ["allowNegativeStock", "Allow Negative Stock", "Allow stock quantity to go below zero."],
    ["requireReasonAdj", "Require Reason on Adjustments", "Users must provide reason for stock adjustments."],
    ["autoGenerateSku", "Auto Generate Item SKU", "Automatically generate SKU for new items."],
  ];
  return (
    <div className="st-card" style={cardStyle}>
      <SectionHead title="System Preferences" sub="Configure system wide preferences." />
      <div className="st-togglegrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {toggles.map(([field,label,sub]) => (
          <div key={field} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
            <Toggle value={form[field]} onChange={(v) => setField(field, v)} />
            <div><div style={labelStyle}>{label}</div><div style={subStyle}>{sub}</div></div>
          </div>
        ))}
        <div>
          <div style={{...labelStyle, marginBottom:8}}>Session Timeout (minutes)</div>
          <div style={{ maxWidth:280 }}><SettingsSelect value={form.sessionTimeout} onChange={(v) => setField("sessionTimeout", v)} options={["15","30","60","120"]} /></div>
          <div style={{...subStyle, marginTop:5}}>Automatically log out inactive users.</div>
        </div>
      </div>
      <SaveButton onClick={() => onSave("preferences")} saving={saving} />
    </div>
  );
}
const cardStyle = { background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28, marginBottom:16 };
const labelStyle = { fontSize:13, fontWeight:600, color:"#1e2740", marginBottom:3 };
const subStyle = { fontSize:12, color:"#6b7591" };
