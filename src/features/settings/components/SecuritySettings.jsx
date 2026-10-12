import Field from "./Field";
import FieldRow from "./FieldRow";
import SettingsSelect from "./SettingsSelect";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";
import Toggle from "./Toggle";

export default function SecuritySettings({ form, setField, onSave, saving }) {
  return (
    <div className="st-card" style={cardStyle}>
      <SectionHead title="Security Settings" sub="Configure password policies, sessions and security options." />
      <FieldRow cols="1fr 1fr 1fr">
        <Field label="Minimum Password Length"><SettingsSelect value={form.minPasswordLength} onChange={(v)=>setField("minPasswordLength",v)} options={["6","8","10","12"]}/></Field>
        <Field label="Max Login Attempts"><SettingsSelect value={form.maxLoginAttempts} onChange={(v)=>setField("maxLoginAttempts",v)} options={["3","5","10"]}/></Field>
        <Field label="Lockout Duration (mins)"><SettingsSelect value={form.lockoutDuration} onChange={(v)=>setField("lockoutDuration",v)} options={["5","10","15","30","60"]}/></Field>
      </FieldRow>
      <div className="st-togglegrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <ToggleRow value={form.requireUppercase} onChange={(v)=>setField("requireUppercase",v)} label="Require Uppercase Letters" sub="Passwords must contain at least one uppercase letter."/>
        <ToggleRow value={form.requireNumbers} onChange={(v)=>setField("requireNumbers",v)} label="Require Numbers" sub="Passwords must contain at least one number."/>
        <ToggleRow value={form.twoFactorAuth} onChange={(v)=>setField("twoFactorAuth",v)} label="Two-Factor Authentication" sub="Require 2FA for all user accounts."/>
      </div>
      <SaveButton onClick={()=>onSave("security")} saving={saving}/>
    </div>
  );
}
function ToggleRow({value,onChange,label,sub}){return <div style={{display:"flex",alignItems:"flex-start",gap:12}}><Toggle value={value} onChange={onChange}/><div><div style={labelStyle}>{label}</div><div style={subStyle}>{sub}</div></div></div>}
const cardStyle={background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:28};
const labelStyle={fontSize:13,fontWeight:600,color:"#1e2740",marginBottom:3};
const subStyle={fontSize:12,color:"#6b7591"};
