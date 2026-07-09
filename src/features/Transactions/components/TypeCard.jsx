import React from "react";
import { Icon } from "./icons/Icon.jsx";

export const TypeCard = ({ t, selected, onClick }) => (
  <div onClick={() => onClick(t.id)} style={{
    border: selected ? "2px solid #4f6ef7" : "1px solid #e4e7ef",
    borderRadius: 10, padding: 12, cursor: "pointer", flex: 1, minWidth: 120,
    background: selected ? "#f0f4ff" : "#fff", transition: "border-color .15s",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: t.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={t.iconPath} size={16} stroke={t.iconColor} />
      </div>
      <div style={{ width: 18, height: 18, borderRadius: "50%", border: selected ? "2px solid #4f6ef7" : "2px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f6ef7" }} />}
      </div>
    </div>
    <div style={{ fontWeight: 600, fontSize: 12.5, color: "#1e2740" }}>{t.id}</div>
    <div style={{ fontSize: 11, color: "#6b7591", marginTop: 2 }}>{t.desc}</div>
  </div>
);

export default TypeCard;
