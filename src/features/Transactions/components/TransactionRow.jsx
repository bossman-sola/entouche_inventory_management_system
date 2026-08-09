import React from "react";
import { DotsIcon, EyeIcon } from "./icons/SmallIcons.jsx";
import { txTypeStyle, statusStyle } from "../constants.js";
import { fmtDateTime } from "../utils/normalize.js";

export const TransactionRow = ({ t, isMenuOpen, onToggleMenu }) => {
  const ts = txTypeStyle[t.type] || { bg: "#f4f6fb", color: "#5c657a" };
  const ss = statusStyle[t.status] || { bg: "#f4f6fb", color: "#5c657a" };
  const { date: dLabel, time: tLabel } = fmtDateTime(t.date);

  return (
    <tr
      style={{ borderBottom: "1px solid #f4f6fb", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
      onMouseLeave={e => e.currentTarget.style.background = ""}
    >
      <td style={{ padding: "12px 14px", fontWeight: 500, color: "#4f6ef7", whiteSpace: "nowrap", cursor: "pointer" }}>{t.refLabel}</td>
      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
        <div style={{ color: "#1e2740" }}>{dLabel}</div>
        <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{tLabel}</div>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <span style={{ background: ts.bg, color: ts.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap" }}>{t.type}</span>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ color: "#1e2740", whiteSpace: "nowrap" }}>{t.item}</div>
        <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{t.sku}</div>
      </td>
      <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.from}</td>
      <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.to}</td>
      <td style={{ padding: "12px 14px", fontWeight: 500, color: t.qty < 0 ? "#c0392b" : "#1e2740" }}>{t.qty}</td>
      <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.unitCost.toLocaleString()}</td>
      <td style={{ padding: "12px 14px", fontWeight: 600, color: t.total < 0 ? "#c0392b" : "#1e2740", whiteSpace: "nowrap" }}>{t.total.toLocaleString()}</td>
      <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.user}</td>
      <td style={{ padding: "12px 14px" }}>
        <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500 }}>{t.status}</span>
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center", position: "relative" }}>
        <div
          onClick={e => { e.stopPropagation(); onToggleMenu(t.id); }}
          style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6, margin: "0 auto", transition: "background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <EyeIcon />
          {/* <DotsIcon /> */}
        </div>
        {/* {isMenuOpen && (
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 8, top: 32, zIndex: 50, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, boxShadow: "0 8px 24px rgba(20,25,50,0.14)", minWidth: 150, padding: 4, textAlign: "left" }}>
            <div onClick={() => onToggleMenu(null)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#1e2740", fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <EyeIcon /> View Details
            </div>
          </div>
        )} */}
      </td>
    </tr>
  );
};

export default TransactionRow;
