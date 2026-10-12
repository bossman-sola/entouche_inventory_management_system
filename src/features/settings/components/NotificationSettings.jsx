import Field from "./Field";
import SettingsInput from "./SettingsInput";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";
import Toggle from "./Toggle";
import MaintenanceSettings from "./MaintenanceSettings";

export default function NotificationSettings({form,setField,onSave,saving,maintenance}) {
  const toggles=[
    ["lowStockEmail","Low Stock Email Alerts","Receive emails when items fall below reorder level."],
    ["receiptAlerts","Receipt Alerts","Notifications when goods are received."],
    ["transferAlerts","Transfer Alerts","Notifications for inventory transfers."],
    ["dailyDigest","Daily Digest","Receive a daily summary of all activities."],
  ];
  return <>
    <div className="st-card" style={{background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:28,marginBottom:16}}>
      <SectionHead title="Notification Settings" sub="Configure email and system alert preferences."/>
      <Field label="Notification Email"><SettingsInput value={form.notifyEmail} onChange={(v)=>setField("notifyEmail",v)}/></Field>
      <div style={{height:16}}/>
      <div className="st-togglegrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        {toggles.map(([field,label,sub])=><div key={field} style={{display:"flex",alignItems:"flex-start",gap:12}}><Toggle value={form[field]} onChange={(v)=>setField(field,v)}/><div><div style={{fontSize:13,fontWeight:600,color:"#1e2740",marginBottom:3}}>{label}</div><div style={{fontSize:12,color:"#6b7591"}}>{sub}</div></div></div>)}
      </div>
      <SaveButton onClick={()=>onSave("notifications")} saving={saving}/>
    </div>
    <MaintenanceSettings {...maintenance}/>
  </>;
}
