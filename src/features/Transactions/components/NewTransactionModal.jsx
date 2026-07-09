import React, { useState } from "react";
import { Icon } from "./icons/Icon.jsx";
import { iconPaths, txTypes } from "../constants.js";
import { Modal } from "./Modal.jsx";
import { TypeCard } from "./TypeCard.jsx";
import { ItemRow, emptyItem } from "./ItemRow.jsx";
import { FieldLabel, FieldSelect, FieldInput, FieldTextarea } from "./FormFields.jsx";

export const NewTransactionModal = ({ open, onClose, onSave, catalogItems, units, suppliers, users, knownLocations, saving, saveError }) => {
  const [type, setType]           = useState("Receipt");
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier]   = useState("");
  const [receivingLoc, setReceivingLoc] = useState("");
  const [fromLoc, setFromLoc]     = useState("");
  const [toLoc, setToLoc]         = useState("");
  const [location, setLocation]   = useState("");
  const [adjustType, setAdjustType] = useState("");
  const [reason, setReason]       = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [refNum, setRefNum]       = useState("");
  const [notes, setNotes]         = useState("");
  const [items, setItems]         = useState([emptyItem()]);

  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(r => r.id !== id));
  const updateItem = (id, field, val) => setItems(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const totalQty  = items.reduce((s, r) => s + +r.qty, 0);
  const totalCost = items.reduce((s, r) => s + r.qty * r.unitCost, 0);

  const handleSave = () => {
    onSave({
      type,
      date,
      supplier, receivingLoc, fromLoc, toLoc, location, adjustType, reason, requestedBy, refNum, notes,
      items,
    });
  };

  const gridStyle    = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 };
  const stepNumStyle = { width: 22, height: 22, borderRadius: "50%", background: "#4f6ef7", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

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
                <FieldLabel required>Receiving Location</FieldLabel>
                <FieldInput value={receivingLoc} onChange={setReceivingLoc} placeholder="Type a location" listId="loc-list-receiving" listOptions={knownLocations} />
              </div>
              <div><FieldLabel required>Receipt Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="PO or reference (optional)" /></div>
              <div style={{ gridColumn: "span 2" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Transfer" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Transfer Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>From Location</FieldLabel>
                <FieldInput value={fromLoc} onChange={setFromLoc} placeholder="Type source location" listId="loc-list-from" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>To Location</FieldLabel>
                <FieldInput value={toLoc} onChange={setToLoc} placeholder="Type destination location" listId="loc-list-to" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>Requested By</FieldLabel>
                <FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder={users.length ? "Select user" : "No users found"} getLabel={u => u.name} getValue={u => u.id} />
              </div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. TRF-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Adjustment" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Adjustment Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <FieldInput value={location} onChange={setLocation} placeholder="Type a location" listId="loc-list-adj" listOptions={knownLocations} />
              </div>
              <div><FieldLabel required>Adjustment Type</FieldLabel><FieldSelect value={adjustType} onChange={setAdjustType} options={["Increase Stock","Decrease Stock","Set Stock"]} placeholder="Select type" /></div>
              <div><FieldLabel required>Reason</FieldLabel><FieldInput value={reason} onChange={setReason} placeholder="e.g. Damaged items, stock count variance…" /></div>
              <div><FieldLabel>Reference Number</FieldLabel><FieldInput value={refNum} onChange={setRefNum} placeholder="e.g. ADJ-001 (optional)" /></div>
              <div><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
          )}
          {type === "Stock Count" && (
            <div style={gridStyle}>
              <div><FieldLabel required>Count Date</FieldLabel><FieldInput type="date" value={date} onChange={setDate} /></div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <FieldInput value={location} onChange={setLocation} placeholder="Type a location" listId="loc-list-count" listOptions={knownLocations} />
              </div>
              <div>
                <FieldLabel required>Counted By</FieldLabel>
                <FieldSelect value={requestedBy} onChange={setRequestedBy} options={users} placeholder={users.length ? "Select user" : "No users found"} getLabel={u => u.name} getValue={u => u.id} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}><FieldLabel>Notes</FieldLabel><FieldTextarea value={notes} onChange={setNotes} placeholder="Enter any notes (optional)" /></div>
            </div>
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
                      ...(type==="Transfer"   ? ["Available"]    : []),
                      ...(type==="Adjustment" ? ["Current Stock"] : []),
                      "Unit","Qty *",
                      ...(type==="Receipt"||type==="Adjustment" ? ["Unit Cost (₦)","Total (₦)"] : []),
                      ""
                    ].map(h => (
                      <th key={h} style={{ padding: "8px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "#6b7591", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <ItemRow key={row.id} row={row} idx={idx} onChange={updateItem} onRemove={removeItem}
                      showCost={type==="Receipt"||type==="Adjustment"}
                      showAvailable={type==="Transfer"}
                      showCurrentStock={type==="Adjustment"}
                      catalogItems={catalogItems}
                      units={units}
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
                {(type==="Receipt"||type==="Adjustment") && <span>Total: <strong style={{ color: "#1e2740" }}>₦{totalCost.toLocaleString()}</strong></span>}
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
