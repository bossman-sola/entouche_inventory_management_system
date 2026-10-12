import Field from "./Field";
import SettingsSelect from "./SettingsSelect";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";
import Toggle from "./Toggle";

export default function AuditSettings({form,setField,auditLogCount,onSave,saving}) {
  const toggles=[
    ["logLogins","Log User Logins","Record all login and logout events."],
    ["logDataChanges","Log Data Changes","Record all create, update and delete operations."],
    ["logExports","Log Data Exports","Record all data export and download events."],
    ["autoDeleteLogs","Auto-Delete Old Logs","Automatically delete logs older than retention period."],
  ];
  return <div className="st-card" style={{background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:28}}>
    <SectionHead title="Audit Settings" sub="Configure audit log and data retention settings."/>
    {auditLogCount!==null&&<div style={{fontSize:12.5,color:"#6b7591",marginBottom:16}}>{auditLogCount} audit log entr{auditLogCount===1?"y":"ies"} currently recorded.</div>}
    <div style={{marginBottom:16}}><Field label="Log Retention Period"><SettingsSelect value={form.retentionPeriod} onChange={(v)=>setField("retentionPeriod",v)} options={["3 months","6 months","12 months","24 months","Indefinitely"]}/></Field></div>
    <div className="st-togglegrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>{toggles.map(([field,label,sub])=><div key={field} style={{display:"flex",alignItems:"flex-start",gap:12}}><Toggle value={form[field]} onChange={(v)=>setField(field,v)}/><div><div style={{fontSize:13,fontWeight:600,color:"#1e2740",marginBottom:3}}>{label}</div><div style={{fontSize:12,color:"#6b7591"}}>{sub}</div></div></div>)}</div>
    <SaveButton onClick={()=>onSave("audit")} saving={saving}/>
  </div>;
}
