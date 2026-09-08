const TYPE_FAMILY = {
  receipt: "Receipt",
  transfer_in: "Transfer",
  transfer_out: "Transfer",
  adjustment_in: "Adjustment",
  adjustment_out: "Adjustment",
};

const TYPE_DETAIL = {
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment_in: "Adjustment (Increase)",
  adjustment_out: "Adjustment (Decrease)",
};

function titleCase(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function labelizeType(raw, fallback) {
  if (!raw) return fallback || "Transaction";
  const key = String(raw).toLowerCase().trim().replace(/\s+/g, "_");
  return TYPE_FAMILY[key] || titleCase(key);
}

export function labelizeTypeDetail(raw, fallback) {
  if (!raw) return fallback || "Transaction";
  const key = String(raw).toLowerCase().trim().replace(/\s+/g, "_");
  return TYPE_DETAIL[key] || labelizeType(raw, fallback);
}

export function firstDefined(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== "") return v;
  return undefined;
}

function formatTxnId(id) {
  if (id === undefined || id === null || id === "") return null;
  const digits = String(id).replace(/\D/g, "");
  if (!digits) return null;
  return `TXN-${digits.padStart(6, "0")}`;
}

export function normalizeTransaction(raw, itemMeta, assumedType) {
  const rawType = firstDefined(
    raw.type,
    raw.transaction_type,
    raw.txn_type,
    raw.movement_type,
  );
  const type = labelizeType(rawType, assumedType);
  const typeDetail = labelizeTypeDetail(rawType, type);
  const direction = firstDefined(
    raw.direction,
    rawType && String(rawType).endsWith("_out") ? "out" : undefined,
    rawType && String(rawType).endsWith("_in") ? "in" : undefined,
  );

  const qty =
    Number(firstDefined(raw.quantity, raw.qty, raw.quantity_change, 0)) || 0;
  const unitCost =
    Number(firstDefined(raw.unit_cost, raw.cost, itemMeta?.unit_cost, 0)) || 0;
  const total =
    Number(firstDefined(raw.total_cost, raw.total, qty * unitCost)) || 0;

  const createdAtRaw = firstDefined(
    raw.created_at,
    raw.date,
    raw.performed_at,
    raw.transaction_date,
  );
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

  const isTransfer =
    rawType === "transfer_in" ||
    rawType === "transfer_out" ||
    raw.reference_type === "App\\Models\\Transfer";

  const from = isTransfer
    ? firstDefined(
      raw.transfer?.from_location?.name,
      raw.transfer?.from_warehouse?.name,
      "-",
    )
    : direction === "out"
      ? firstDefined(
        raw.location?.name,
        raw.warehouse?.name,
        "-",
      )
      : firstDefined(
        raw.from_location?.name,
        raw.source_location?.name,
        raw.from,
        "-",
      );

  const to = isTransfer
    ? firstDefined(
      raw.transfer?.to_location?.name,
      raw.transfer?.to_warehouse?.name,
      "-",
    )
    : direction === "in"
      ? firstDefined(
        raw.location?.name,
        raw.warehouse?.name,
        "-",
      )
      : firstDefined(
        raw.to_location?.name,
        raw.destination_location?.name,
        raw.to,
        "-",
      );

  const userName = firstDefined(
    raw.performer?.name,
    raw.user?.name,
    raw.created_by_user?.name,
    raw.creator?.name,
    raw.requester?.name,
    raw.requested_by_user?.name,
    "-",
  );

  const status = raw.status ? labelizeType(raw.status) : "Completed";

  return {
    id: firstDefined(
      raw.id,
      raw.reference_number,
      `${itemMeta?.id || "x"}-${Math.random().toString(36).slice(2, 8)}`,
    ),
    refLabel: formatTxnId(raw.id) || firstDefined(raw.reference_number, "-"),
    date: createdAt,
    type,
    typeDetail,
    direction,
    item: firstDefined(raw.item?.name, itemMeta?.name, "-"),
    sku: firstDefined(raw.item?.sku, itemMeta?.sku, "-"),
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
  if (!d || isNaN(d.getTime())) return { date: "-", time: "" };
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

const DRAFT_ACTIONABLE_STATUSES = ["draft", "submitted", "pending"];

export function normalizeDraftDocument(doc, sourceType, itemsById) {
  const items = Array.isArray(doc.items) ? doc.items : [];
  const status = titleCase(doc.status || "draft");
  const docNumber = firstDefined(
    doc.receipt_number,
    doc.transfer_number,
    doc.adjustment_number,
    doc.count_number,
    doc.reference_number,
  );
  const dateRaw = firstDefined(
    doc.receipt_date,
    doc.transfer_date,
    doc.adjustment_date,
    doc.count_date,
    doc.created_at,
  );
  const date = dateRaw ? new Date(dateRaw) : null;

  // one row per line item, same shape normalizeTransaction produces
  return (items.length ? items : [{}]).map((line, i) => {
    const itemMeta = itemsById.get(line.item_id);
    const qty =
      Number(
        firstDefined(
          line.quantity,
          line.adjustment_quantity,
          line.counted_quantity,
          0,
        ),
      ) || 0;
    const unitCost =
      Number(firstDefined(line.unit_cost, itemMeta?.unit_cost, 0)) || 0;

    return {
      id: `${sourceType}-${doc.id}-${line.id ?? i}`,
      refLabel: docNumber || `${sourceType.toUpperCase()}-${doc.id}`,
      date,
      type: titleCase(sourceType),
      typeDetail: `${titleCase(sourceType)} (${status})`,
      direction: undefined,
      item: firstDefined(itemMeta?.name, "-"),
      sku: firstDefined(itemMeta?.sku, "-"),
      from: "-",
      to: "-",
      qty,
      unitCost,
      total: qty * unitCost,
      user: "-",
      status,
      // extra fields the table's action menu will need - not present on
      // ledger rows, so TransactionsTable must check `sourceType` before
      // reading these
      sourceType, // "adjustment" | "receipt" | "transfer" | "stock_count"
      sourceId: doc.id,
      isDraftSource: true,
    };
  });
}

export function isActionableStatus(status) {
  return DRAFT_ACTIONABLE_STATUSES.includes(String(status).toLowerCase());
}
