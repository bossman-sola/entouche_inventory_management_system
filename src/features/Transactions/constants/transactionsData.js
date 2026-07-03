/* ─────────────────────────── shared UI config (NOT business data) ─────────────────────────── */
/* Calendar labels, icon paths, and style/color maps below are structural UI configuration —
 * they describe how the feature looks, not data from the backend, so they stay here. */

export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export const icons = {
  receipt: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  transfer: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  adjustment: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  stockcount: "M4 6h16M4 10h16M4 14h16M4 18h16",
  plus: "M12 4v16m8-8H4",
  x: "M6 18L18 6M6 6l12 12",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

export const txTypeStyle = {
  Receipt:       { bg: "#e6faf3", color: "#16a369" },
  Transfer:      { bg: "#eef2ff", color: "#4f6ef7" },
  Adjustment:    { bg: "#fff7ed", color: "#c27a0a" },
  "Stock Count": { bg: "#f5f3ff", color: "#7c3aed" },
};

export const statusStyle = {
  Completed: { bg: "#e6faf3", color: "#16a369" },
  Pending:   { bg: "#fff7ed", color: "#c27a0a" },
  Cancelled: { bg: "#fff1f0", color: "#c0392b" },
};

export const txTypes = [
  { id: "Receipt",     iconPath: icons.receipt,    iconBg: "#e6faf3", iconColor: "#16a369", desc: "Record items received into inventory." },
  { id: "Transfer",    iconPath: icons.transfer,   iconBg: "#eef2ff", iconColor: "#4f6ef7", desc: "Move items between different locations." },
  { id: "Adjustment",  iconPath: icons.adjustment, iconBg: "#fff7ed", iconColor: "#c27a0a", desc: "Adjust inventory quantities." },
  { id: "Stock Count", iconPath: icons.stockcount, iconBg: "#f5f3ff", iconColor: "#7c3aed", desc: "Record physical stock count." },
];

export const emptyItem = () => ({ id: Date.now() + Math.random(), item: "", sku: "", unit: "", qty: 0, unitCost: 0 });

/*
 * REMOVED (previously hardcoded, now gone per request):
 *   - MOCK transaction feed          -> no global transactions-list endpoint exists yet.
 *   - locs (location names)          -> no Warehouses/Locations endpoint exists yet.
 *   - reasons (adjustment reasons)   -> no adjustment-reasons config endpoint exists yet.
 *   - suppliersList (supplier names) -> REPLACED with real data via useSuppliers().
 *   - users (requested-by/counted-by)-> REPLACED with real data via useUsers().
 *
 * Until Locations and Adjustment Reasons have a real backend source, those two dropdowns
 * in NewTransactionModal render with zero options — that's expected, not a bug.
 */