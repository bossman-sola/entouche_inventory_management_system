import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "./icons/Icon.jsx";
import { iconPaths, txTypes } from "../constants.js";
import { Modal } from "./Modal.jsx";
import { TypeCard } from "./TypeCard.jsx";
import { ItemRow, emptyItem } from "./ItemRow.jsx";
import { FieldLabel, FieldSelect, FieldInput, FieldTextarea } from "./FormFields.jsx";


function useWarehouseLocationPicker(fetchLocationsForWarehouse) {
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId]   = useState("");
  const [locations, setLocations]     = useState([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLocationId("");
    setLocations([]);
    if (!warehouseId) return undefined;
    setLoading(true);
    fetchLocationsForWarehouse(warehouseId)
      .then(list => { if (!cancelled) setLocations(list || []); })
      .catch(() => { if (!cancelled) setLocations([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [warehouseId, fetchLocationsForWarehouse]);

  return { warehouseId, setWarehouseId, locationId, setLocationId, locations, loading };
}

const ADJUSTMENT_TYPES = [
  { value: "increase", label: "Increase Stock" },
  { value: "decrease", label: "Decrease Stock" },
];

export const NewTransactionModal = ({ open, onClose, onSave, catalogItems, units, suppliers, warehouses, fetchLocationsForWarehouse, fetchStockBalance, saving, saveError }) => {
  const [type, setType]           = useState("Receipt");
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier]   = useState("");
  const [adjustType, setAdjustType] = useState("");
  const [reason, setReason]       = useState("");
  const [notes, setNotes]         = useState("");
  const [items, setItems]         = useState([emptyItem()]);

  // One warehouse+location picker per slot the API needs. Adjustment and
  // Stock Count both only need a single warehouse/location, so they share
  // the "general" picker — only one of those two types is ever shown at once.
  const receiving = useWarehouseLocationPicker(fetchLocationsForWarehouse);
  const from       = useWarehouseLocationPicker(fetchLocationsForWarehouse);
  const to         = useWarehouseLocationPicker(fetchLocationsForWarehouse);
  const general    = useWarehouseLocationPicker(fetchLocationsForWarehouse);

  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const totalQty  = items.reduce((s, r) => s + +r.qty, 0);
  const totalCost = items.reduce((s, r) => s + r.qty * r.unitCost, 0);

  const handleSave = () => {
    onSave({
      type,
      date,
      supplier,
      notes,
      adjustType,
      reason,
      items,
      receivingWarehouseId: receiving.warehouseId,
      receivingLocationId: receiving.locationId,
      fromWarehouseId: from.warehouseId,
      fromLocationId: from.locationId,
      toWarehouseId: to.warehouseId,
      toLocationId: to.locationId,
      generalWarehouseId: general.warehouseId,
      generalLocationId: general.locationId,
    });
  };

  const gridStyle    = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 };
  const stepNumStyle = { width: 22, height: 22, borderRadius: "50%", background: "#4f6ef7", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

  const locationPlaceholder = (picker) => {
    if (!picker.warehouseId) return "Select warehouse first";
    if (picker.loading) return "Loading locations…";
    return picker.locations.length ? "Select location" : "No locations found";
  };

  const showAvailable    = type === "Transfer";
  const showCurrentStock = type === "Adjustment" || type === "Stock Count";

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ padding: 24, fontFamily: "Inter,system-ui,sans-serif", fontSize: 13 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e2740" }}>New Inventory Transaction</div>
            <div style={{ fontSize: 12, color: "#6b7591", marginTop: 3 }}>Select the type of transaction and fill in the details below.</div>
          </div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon d={iconPaths.x} size={14} stroke="#6b7591" />
          </div>
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>1</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>Transaction Type</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {txTypes.map(t => <TypeCard key={t.id} t={t} selected={type === t.id} onClick={setType} />)}
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>2</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>{type} Information</div>
          </div>
          {type === "Receipt" && (
            <div style={gridStyle}>
              <div>
                <FieldLabel required>Supplier</FieldLabel>
                <FieldSelect value={supplier} onChange={setSupplier} options={suppliers} placeholder={suppliers.length ? "Select supplier" : "No suppliers found"} getLabel={s => s.name} getValue={s => s.id} />
              </div>
              <div>
                <FieldLabel required>Warehouse</FieldLabel>
                <FieldSelect value={receiving.warehouseId} onChange={receiving.setWarehouseId} options={warehouses} placeholder={warehouses.length ? "Select warehouse" : "No warehouses found"} getLabel={w => w.name} getValue={w => w.id} />
              </div>
              <div>
                <FieldLabel required>Receiving Location</FieldLabel>
                <FieldSelect value={receiving.locationId} onChange={receiving.setLocationId} options={receiving.locations} placeholder={locationPlaceholder(receiving)} getLabel={l => l.name} getValue={l => l.id} />
              </div>
              <div><FieldLabel required>Receipt Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div style={{ gridColumn: "span 2" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Transfer" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Transfer Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>From Warehouse</FieldLabel>
                <FieldSelect value={from.warehouseId} onChange={from.setWarehouseId} options={warehouses} placeholder={warehouses.length ? "Select warehouse" : "No warehouses found"} getLabel={w => w.name} getValue={w => w.id} />
              </div>
              <div>
                <FieldLabel required>From Location</FieldLabel>
                <FieldSelect value={from.locationId} onChange={from.setLocationId} options={from.locations} placeholder={locationPlaceholder(from)} getLabel={l => l.name} getValue={l => l.id} />
              </div>
              <div>
                <FieldLabel required>To Warehouse</FieldLabel>
                <FieldSelect value={to.warehouseId} onChange={to.setWarehouseId} options={warehouses} placeholder={warehouses.length ? "Select warehouse" : "No warehouses found"} getLabel={w => w.name} getValue={w => w.id} />
              </div>
              <div>
                <FieldLabel required>To Location</FieldLabel>
                <FieldSelect value={to.locationId} onChange={to.setLocationId} options={to.locations} placeholder={locationPlaceholder(to)} getLabel={l => l.name} getValue={l => l.id} />
              </div>
              <div style={{ gridColumn: "span 2" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Adjustment" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Adjustment Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>Warehouse</FieldLabel>
                <FieldSelect value={general.warehouseId} onChange={general.setWarehouseId} options={warehouses} placeholder={warehouses.length ? "Select warehouse" : "No warehouses found"} getLabel={w => w.name} getValue={w => w.id} />
              </div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <FieldSelect value={general.locationId} onChange={general.setLocationId} options={general.locations} placeholder={locationPlaceholder(general)} getLabel={l => l.name} getValue={l => l.id} />
              </div>
              <div>
                <FieldLabel required>Adjustment Type</FieldLabel>
                <FieldSelect value={adjustType} onChange={setAdjustType} options={ADJUSTMENT_TYPES} placeholder="Select type" getLabel={o => o.label} getValue={o => o.value} />
              </div>
              <div><FieldLabel required>Reason</FieldLabel><FieldInput value={reason} onChange={setReason} placeholder="e.g. Damaged items, stock count variance…" /></div>
            </div>
          )}
          {type === "Stock Count" && (
            <>
              <div style={gridStyle}>
                <div><FieldLabel required>Count Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
                <div>
                  <FieldLabel required>Warehouse</FieldLabel>
                  <FieldSelect value={general.warehouseId} onChange={general.setWarehouseId} options={warehouses} placeholder={warehouses.length ? "Select warehouse" : "No warehouses found"} getLabel={w => w.name} getValue={w => w.id} />
                </div>
                <div>
                  <FieldLabel required>Location</FieldLabel>
                  <FieldSelect value={general.locationId} onChange={general.setLocationId} options={general.locations} placeholder={locationPlaceholder(general)} getLabel={l => l.name} getValue={l => l.id} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
              </div>
              <div style={{ marginTop: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#1d4ed8" }}>
                Stock counts save as a draft here. The API needs it "started" (which loads current
                system quantities per item), counted, then completed and approved before it moves
                stock — that multi-step flow isn't wired up on this page yet, so finish this one from
                the Stock Counts page once it exists.
              </div>
            </>
          )}
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={stepNumStyle}>3</div>
            <div style={{ fontWeight: 600, color: "#1e2740" }}>Items</div>
          </div>
          <div style={{ border: "1px solid #e4e7ef", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead style={{ background: "#f8f9fb", borderBottom: "1px solid #e4e7ef" }}>
                  <tr>
                    {["#","Item *","SKU",
                      ...(showAvailable    ? ["Available"]     : []),
                      ...(showCurrentStock ? ["Current Stock"] : []),
                      "Unit", type === "Stock Count" ? "Counted Qty *" : "Qty *",
                      ...(type==="Receipt" ? ["Unit Cost (₦)","Total (₦)"] : []),
                      ""
                    ].map(h => (
                      <th key={h} style={{ padding: "8px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "#6b7591", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <ItemRow key={row.id} row={row} idx={idx} onChange={updateItem} onRemove={removeItem}
                      showCost={type==="Receipt"}
                      showAvailable={showAvailable}
                      showCurrentStock={showCurrentStock}
                      catalogItems={catalogItems}
                      units={units}
                      fetchStockBalance={fetchStockBalance}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "8px 12px", background: "#f8f9fb", borderTop: "1px solid #f0f2f8", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4f6ef7", fontWeight: 500, cursor: "pointer" }}>
                <Icon d={iconPaths.plus} size={13} stroke="#4f6ef7" /> Add Item
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#6b7591", flexWrap: "wrap" }}>
                <span>Items: <strong style={{ color: "#1e2740" }}>{items.length}</strong></span>
                <span>Qty: <strong style={{ color: "#1e2740" }}>{totalQty}</strong></span>
                {type==="Receipt" && <span>Total: <strong style={{ color: "#1e2740" }}>₦{totalCost.toLocaleString()}</strong></span>}
              </div>
            </div>
          </div>
        </div>

        {saveError && (
          <div style={{ marginBottom: 14, padding: "10px 12px", background: "#fff1f0", border: "1px solid #ffd3ce", borderRadius: 8, fontSize: 12, color: "#c0392b" }}>
            {saveError}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e4e7ef" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #e4e7ef", borderRadius: 8, fontSize: 12.5, background: "#fff", cursor: "pointer", color: "#1e2740", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", border: "none", borderRadius: 8, fontSize: 12.5, background: saving ? "#9aa8f7" : "#4f6ef7", color: "#fff", cursor: saving ? "default" : "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            {saving ? "Saving…" : `Save ${type}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewTransactionModal;