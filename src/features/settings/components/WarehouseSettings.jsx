import Field from "./Field";
import FieldRow from "./FieldRow";
import SettingsInput from "./SettingsInput";
import SettingsSelect from "./SettingsSelect";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";
import Toggle from "./Toggle";

export default function WarehouseSettings({ form, setField, warehouses = [], loading, onSave, saving }) {
  const names = warehouses.map((w) => w.name).filter(Boolean);
  const options = names.includes(form.defaultWarehouse) ? names : [form.defaultWarehouse, ...names].filter(Boolean);
  return (
    <div className="st-card" style={cardStyle}>
      <SectionHead title="Warehouse Settings" sub="Manage warehouse and location preferences." />
      <FieldRow cols="1fr 1fr">
        <Field label="Default Warehouse"><SettingsSelect value={form.defaultWarehouse} onChange={(v) => setField("defaultWarehouse", v)} options={options} disabled={warehouses.length===0} /></Field>
        <Field label="Warehouse Prefix"><SettingsInput value={form.warehousePrefix} onChange={(v) => setField("warehousePrefix", v)} /></Field>
      </FieldRow>
      {warehouses.length===0 && !loading && <div style={{ fontSize:12, color:"#9aa1b4", marginTop:-8, marginBottom:16 }}>No warehouses returned by the API yet - showing the saved value only.</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
        <ToggleRow value={form.enableBinLocations} onChange={(v)=>setField("enableBinLocations",v)} label="Enable Bin Locations" sub="Allow items to be assigned to specific bin locations." />
        <ToggleRow value={form.requireLocation} onChange={(v)=>setField("requireLocation",v)} label="Require Location on Receipt" sub="Location must be specified when receiving items." />
      </div>
      <SaveButton onClick={() => onSave("warehouse")} saving={saving} />
    </div>
  );
}
function ToggleRow({value,onChange,label,sub}){return <div style={{display:"flex",alignItems:"flex-start",gap:12}}><Toggle value={value} onChange={onChange}/><div><div style={labelStyle}>{label}</div><div style={subStyle}>{sub}</div></div></div>}
const cardStyle={background:"#fff",border:"1px solid #e4e7ef",borderRadius:12,padding:28};
const labelStyle={fontSize:13,fontWeight:600,color:"#1e2740",marginBottom:3};
const subStyle={fontSize:12,color:"#6b7591"};
