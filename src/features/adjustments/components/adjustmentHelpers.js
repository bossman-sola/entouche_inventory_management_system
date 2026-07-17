export const TYPE_LABELS = { increase: "Increase", decrease: "Decrease", set_stock: "Set Stock" };
export const TYPE_BADGE_CLASS = {
  increase: "bg-green-100 text-green-700",
  decrease: "bg-red-100 text-red-600",
  set_stock: "bg-yellow-100 text-yellow-700",
};

export const STATUS_LABELS = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
export const STATUS_BADGE_CLASS = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export const getAdjType = (a) => a.adjustment_type ?? a.type ?? null;
export const getStatus = (a) => a.status ?? "draft";
export const getReason = (a) => a.reason ?? "—";
export const getDate = (a) => a.adjustment_date ?? a.created_at ?? null;
export const getReference = (a) => {
  if (a.reference_number) return a.reference_number;
  if (a.reference) return a.reference;
  const num = Number(a.id) || 0;
  return `ADJ-${String(num).padStart(6, "0")}`;
};
export const getWarehouseName = (a) => a.warehouse?.name ?? a.warehouse_name ?? "—";
export const getLocationName = (a) => a.warehouse_location?.name ?? a.location?.name ?? a.warehouse_location_name ?? "—";
export const getAdjustedByName = (a) => a.created_by?.name ?? a.user?.name ?? a.creator?.name ?? a.adjusted_by?.name ?? "—";

export const getItemRows = (a) => (Array.isArray(a.items) ? a.items : []);
export const getItemName = (row) => row.item?.name ?? row.name ?? row.item_name ?? "Item";
export const getItemSku = (row) => row.item?.sku ?? row.sku ?? "—";
export const getItemQty = (row) => row.adjustment_quantity ?? row.quantity ?? 0;

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function totalQtyForAdjustment(a) {
  return getItemRows(a).reduce((sum, row) => sum + Math.abs(Number(getItemQty(row)) || 0), 0);
}

export const getFirstItemName = (a) => getItemName(getItemRows(a)[0] || {});
export const getItemCount = (a) => getItemRows(a).length;
export const getItemUnitCost = (row) => Number(row.item?.unit_cost ?? row.unit_cost ?? 0) || 0;


export function signedQtyForAdjustment(a) {
  return getItemRows(a).reduce((sum, row) => sum + (Number(getItemQty(row)) || 0), 0);
}


export function valueImpactForAdjustment(a) {
  return getItemRows(a).reduce((sum, row) => sum + (Number(getItemQty(row)) || 0) * getItemUnitCost(row), 0);
}