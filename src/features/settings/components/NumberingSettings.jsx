import Field from "./Field";
import FieldRow from "./FieldRow";
import SettingsInput from "./SettingsInput";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";

export default function NumberingSettings({ form, setField, onSave, saving }) {
  return (
    <div className="st-card" style={{ background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28 }}>
      <SectionHead title="Document & Numbering" sub="Configure document prefixes and numbering." />
      <FieldRow cols="1fr 1fr 1fr 1fr 1fr">
        <Field label="Item Prefix"><SettingsInput value={form.itemPrefix} onChange={(v) => setField("itemPrefix", v)} /></Field>
        <Field label="Inventory Prefix"><SettingsInput value={form.inventoryPrefix} onChange={(v) => setField("inventoryPrefix", v)} /></Field>
        <Field label="Transfer Prefix"><SettingsInput value={form.transferPrefix} onChange={(v) => setField("transferPrefix", v)} /></Field>
        <Field label="Receipt Prefix"><SettingsInput value={form.receiptPrefix} onChange={(v) => setField("receiptPrefix", v)} /></Field>
        <Field label="Adjustment Prefix"><SettingsInput value={form.adjustmentPrefix} onChange={(v) => setField("adjustmentPrefix", v)} /></Field>
      </FieldRow>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#6b7591", marginBottom:6 }}>Numbering Reset</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          {["Do not reset","Monthly","Yearly"].map((opt) => (
            <button key={opt} type="button" onClick={() => setField("numberingReset", opt)} style={{ padding:"7px 16px", border:`1px solid ${form.numberingReset===opt?"#4f6ef7":"#e4e7ef"}`, borderRadius:7, background:form.numberingReset===opt?"#eef2ff":"#fff", color:form.numberingReset===opt?"#4f6ef7":"#1e2740", fontSize:12.5, cursor:"pointer", fontFamily:"inherit", fontWeight:form.numberingReset===opt?600:400 }}>{opt}</button>
          ))}
          <span style={{ fontSize:12, color:"#9aa1b4" }}>Numbers will continue sequentially.</span>
        </div>
      </div>
      <SaveButton onClick={() => onSave("numbering")} saving={saving} />
    </div>
  );
}
