import React from "react";
import { Icon } from "./icons/Icon.jsx";
import { iconPaths } from "../constants.js";

export const emptyItem = () => ({ id: Date.now() + Math.random(), itemId: "", item: "", sku: "", unit: "", qty: 0, unitCost: 0, stockOnHand: undefined });

export const ItemRow = ({ row, idx, onChange, onRemove, showCost, showAvailable, showCurrentStock, catalogItems, units, fetchStockBalance }) => {
  const total = (row.qty * row.unitCost).toFixed(2);
  const td = { padding: "6px 8px", borderBottom: "1px solid #f4f6fb" };

  const handlePickItem = (itemId) => {
    const found = catalogItems.find(ci => String(ci.id) === String(itemId));
    if (!found) {
      onChange(row.id, "itemId", "");
      onChange(row.id, "stockOnHand", undefined);
      return;
    }
    onChange(row.id, "itemId", found.id);
    onChange(row.id, "item", found.name);
    onChange(row.id, "sku", found.sku || "");
    onChange(row.id, "unit", found.unit?.abbreviation || found.unit?.name || "");
    onChange(row.id, "unitCost", Number(found.unit_cost) || 0);

    // The item catalog (GET /items) doesn't include stock levels — those
    // live behind GET /items/{id}/stock-balance. Fetch it live whenever a
    // row's item changes, same pattern as the Transfers page. `null` here
    // is a loading marker (see the render below); it flips to a number, or
    // "—" if the lookup fails, once the request resolves.
    if ((showAvailable || showCurrentStock) && fetchStockBalance) {
      onChange(row.id, "stockOnHand", null);
      fetchStockBalance(found.id)
        .then(balance => {
          const value = showAvailable ? balance?.total_available : balance?.total_on_hand;
          onChange(row.id, "stockOnHand", value ?? 0);
        })
        .catch(() => onChange(row.id, "stockOnHand", "—"));
    } else {
      onChange(row.id, "stockOnHand", undefined);
    }
  };

  const stockCell = row.stockOnHand === null ? "…" : (row.stockOnHand ?? "—");

  return (
    <tr>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{idx + 1}</td>
      <td style={td}>
        <select value={row.itemId} onChange={e => handlePickItem(e.target.value)}
          style={{ width: "100%", padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, outline: "none", fontFamily: "inherit", background: "#fff" }}>
          <option value="">Select item…</option>
          {catalogItems.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
        </select>
      </td>
      <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{row.sku || "—"}</td>
      {showAvailable    && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{stockCell}</td>}
      {showCurrentStock && <td style={{ ...td, color: "#9aa1b4", fontSize: 12 }}>{stockCell}</td>}
      <td style={td}>
        <select value={row.unit} onChange={e => onChange(row.id, "unit", e.target.value)}
          style={{ padding: "5px 8px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, fontFamily: "inherit" }}>
          <option value="">Unit</option>
          {units.map(u => <option key={u.id} value={u.abbreviation || u.name}>{u.abbreviation || u.name}</option>)}
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
          <Icon d={iconPaths.trash} size={12} stroke="#c0392b" />
        </div>
      </td>
    </tr>
  );
};

export default ItemRow;