import { ChevDown } from "./icons.jsx";

export const FieldLabel = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
    {children}{required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
);

export const FieldSelect = ({ value, onChange, options, placeholder }) => (
  <div style={{ position: "relative" }}>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ appearance: "none", width: "100%", padding: "7px 28px 7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
  </div>
);

export const FieldInput = ({ value, onChange, placeholder, type = "text" }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
);

export const FieldTextarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", resize: "none", boxSizing: "border-box" }} />
);