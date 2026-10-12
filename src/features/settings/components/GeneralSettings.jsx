import Field from "./Field";
import FieldRow from "./FieldRow";
import SettingsInput from "./SettingsInput";
import SettingsSelect from "./SettingsSelect";
import SaveButton from "./SaveButton";
import SectionHead from "./SectionHead";

export default function GeneralSettings({ form, setField, onSave, saving }) {
  return (
    <div className="st-card" style={cardStyle}>
      <SectionHead title="General Settings" sub="Configure basic information about your organization and system." />
      <FieldRow cols="1fr 1fr 1fr">
        <Field label="Company Name"><SettingsInput value={form.companyName} onChange={(v) => setField("companyName", v)} /></Field>
        <Field label="Company Email"><SettingsInput value={form.companyEmail} onChange={(v) => setField("companyEmail", v)} /></Field>
        <Field label="Company Phone"><SettingsInput value={form.companyPhone} onChange={(v) => setField("companyPhone", v)} /></Field>
      </FieldRow>
      <FieldRow cols="1fr 1fr 1fr">
        <Field label="Country"><SettingsSelect value={form.country} onChange={(v) => setField("country", v)} options={["Nigeria","Ghana","Kenya","South Africa","United States","United Kingdom"]} /></Field>
        <Field label="Time Zone"><SettingsSelect value={form.timezone} onChange={(v) => setField("timezone", v)} options={["(UTC+01:00) West Africa Time (WAT)","(UTC+00:00) GMT","(UTC-05:00) Eastern Time","(UTC+03:00) East Africa Time"]} /></Field>
        <Field label="Date Format"><SettingsInput value={form.dateFormat} onChange={(v) => setField("dateFormat", v)} /></Field>
      </FieldRow>
      <FieldRow cols="1fr 1fr 1fr">
        <Field label="Time Format"><SettingsSelect value={form.timeFormat} onChange={(v) => setField("timeFormat", v)} options={["12 Hour (hh:mm AM/PM)","24 Hour (HH:mm)"]} /></Field>
        <Field label="Currency"><SettingsSelect value={form.currency} onChange={(v) => setField("currency", v)} options={["NGN (₦) - Nigerian Naira","USD ($) - US Dollar","GBP (£) - British Pound","EUR (€) - Euro"]} /></Field>
        <Field label="Language"><SettingsSelect value={form.language} onChange={(v) => setField("language", v)} options={["English (US)","English (UK)","French","Portuguese"]} /></Field>
      </FieldRow>
      <SaveButton onClick={() => onSave("general")} saving={saving} />
    </div>
  );
}
const cardStyle = { background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, padding:28, marginBottom:16 };
