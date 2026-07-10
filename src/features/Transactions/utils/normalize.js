const TYPE_LABELS = {
  receipt: "Receipt",
  transfer: "Transfer",
  adjustment: "Adjustment",
  stock_count: "Stock Count",
  stock_taking: "Stock Count",
  stocktake: "Stock Count",
};

export function labelizeType(raw, fallback) {
  if (!raw) return fallback || "Transaction";
  const key = String(raw).toLowerCase().trim().replace(/\s+/g, "_");
  if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  return String(raw).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== "") return v;
  return undefined;
}

export function normalizeTransaction(raw, itemMeta, assumedType) {
  const type = labelizeType(
    firstDefined(raw.type, raw.transaction_type, raw.txn_type, raw.movement_type),
    assumedType
  );

  const qty = Number(firstDefined(raw.quantity, raw.qty, raw.quantity_change, 0)) || 0;
  const unitCost = Number(firstDefined(raw.unit_cost, raw.cost, itemMeta?.unit_cost, 0)) || 0;
  const total = Number(firstDefined(raw.total_cost, raw.total, qty * unitCost)) || 0;

  const createdAtRaw = firstDefined(raw.created_at, raw.date, raw.performed_at, raw.transaction_date);
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

  const from = firstDefined(
    raw.from_location?.name, raw.source_location?.name, raw.from,
    "—"
  );
  const to = firstDefined(
    raw.to_location?.name, raw.destination_location?.name, raw.location?.name, raw.to,
    "—"
  );

  const userName = firstDefined(
    raw.user?.name, raw.created_by_user?.name, raw.performed_by?.name, raw.creator?.name, raw.requested_by?.name,
    "—"
  );

  const status = labelizeType(firstDefined(raw.status), "—");

  return {
    id: firstDefined(raw.id, raw.reference_number, `${itemMeta?.id || "x"}-${Math.random().toString(36).slice(2, 8)}`),
    refLabel: firstDefined(raw.reference_number, raw.id ? `#${raw.id}` : null, "—"),
    date: createdAt,
    type,
    item: firstDefined(raw.item?.name, itemMeta?.name, "—"),
    sku: firstDefined(raw.item?.sku, itemMeta?.sku, "—"),
    from,
    to,
    qty,
    unitCost,
    total,
    user: userName,
    status,
  };
}

export function fmtDateTime(d) {
  if (!d || isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}
