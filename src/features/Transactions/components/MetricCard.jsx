import React from "react";

export const MetricCard = ({ iconBg, icon, label, value, sub, subAccent, onClick }) => (
  <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 40, height: 40, background: iconBg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ color: "#6b7591", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: String(value).length > 8 ? 16 : 21, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div onClick={onClick} style={{ fontSize: 10.5, color: subAccent ? "#4f6ef7" : "#6b7591", marginTop: 2, fontWeight: subAccent ? 500 : 400, cursor: subAccent ? "pointer" : "default" }}>{sub}</div>
    </div>
  </div>
);

export default MetricCard;
