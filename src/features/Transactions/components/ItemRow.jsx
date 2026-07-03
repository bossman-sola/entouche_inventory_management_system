import { Icon } from "./icons.jsx";
import { icons } from "../constants/transactionsData.js";

export const ItemRow = ({ row, idx, onChange, onRemove, showCost, showAvailable, showCurrentStock }) => {
  const total = (row.qty * row.unitCost).toFixed(2);
  const td = { padding: "6px 8px", borderBottom: "1px solid #f4f6fb" };
  return (
    <tr>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{idx + 1}</td>
      <td style={td}>
        <input value={row.item} onChange={e => onChange(row.id, "item", e.target.value)} placeholder="Search item…"
          style={{ width: "100%", padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
      </td>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.sku || "—"}</td>
      {showAvailable    && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>—</td>}
      {showCurrentStock && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>0</td>}
      <td style={td}>
        <select value={row.unit} onChange={e => onChange(row.id, "unit", e.target.value)}
          style={{ padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }}>
          <option value="">Unit</option>
          {["pcs","kg","box","carton","set"].map(u => <option key={u}>{u}</option>)}
        </select>
      </td>
      <td style={td}>
        <input type="number" value={row.qty} onChange={e => onChange(row.id, "qty", +e.target.value)}
          style={{ width: 56, padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, textAlign: "center", fontFamily: "inherit" }} />
      </td>
      {showCost && <td style={td}>
        <input type="number" value={row.unitCost} onChange={e => onChange(row.id, "unitCost", +e.target.value)}
          style={{ width: 90, padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }} />
      </td>}
      {showCost && <td style={{ ...td, fontSize: 12, fontWeight: 500, color: "#1e2740" }}>{Number(total).toLocaleString()}</td>}
      <td style={td}>
        <div onClick={() => onRemove(row.id)} style={{ width: 26, height: 26, borderRadius: 6, background: "#fff1f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon d={icons.trash} size={12} stroke="#c0392b" />
        </div>
      </td>
    </tr>
  );
};