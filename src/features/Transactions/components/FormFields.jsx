import React from "react";
import { ChevDown } from "./icons/SmallIcons.jsx";

// Small shared form primitives used throughout NewTransactionModal.

export const FieldLabel = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#374151", marginBottom: 4 }}>
    {children}{required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
);

export const FieldSelect = ({ value, onChange, options, placeholder, getLabel = o => o, getValue = o => o }) => (
  <div style={{ position: "relative" }}>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ appearance: "none", width: "100%", padding: "7px 28px 7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff" }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={getValue(o)} value={getValue(o)}>{getLabel(o)}</option>)}
    </select>
    <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><ChevDown /></span>
  </div>
);

export const FieldInput = ({ value, onChange, placeholder, type = "text", listId, listOptions }) => (
  <>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} list={listId}
      style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }} />
    {listId && listOptions && (
      <datalist id={listId}>
        {listOptions.map(o => <option key={o} value={o} />)}
      </datalist>
    )}
  </>
);

export const FieldTextarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
    style={{ width: "100%", padding: "7px 10px", border: "1px solid #e4e7ef", borderRadius: 7, fontSize: 12.5, color: "#1e2740", fontFamily: "inherit", background: "#fff", resize: "none", boxSizing: "border-box" }} />
);
