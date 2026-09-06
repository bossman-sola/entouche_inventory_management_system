export function mapApiItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    barcode: item.barcode || "",
    cat: item.category?.name || "Uncategorized",
    categoryId: item.category_id ?? item.category?.id ?? null,
    unit: item.unit?.abbreviation
      ? `${item.unit.name} (${item.unit.abbreviation})`
      : item.unit?.name || "-",
    unitId: item.unit_of_measure_id ?? item.unit?.id ?? null,
    supplierId: item.supplier_id ?? item.supplier?.id ?? null,
    reorderLevel: item.reorder_level ?? null,
    cost: Number(item.unit_cost || 0),
    sellingPrice: Number(item.selling_price || 0),
    status: item.status,
  };
}

export function mapApiSupplier(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    email: s.email,
    phone: s.phone,
    address: s.address,
    status: s.status,
  };
}

export function mapApiUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, status: u.status };
}

export function mapApiWarehouse(w) {
  if (!w) return null;
  return {
    id: w.id,
    name: w.name,
    code: w.code,
    city: w.city,
    state: w.state,
    status: w.status,
  };
}

export function mapApiLocation(l) {
  if (!l) return null;
  return {
    id: l.id,
    name: l.name,
    code: l.code,
    type: l.type,
    status: l.status,
  };
}

const PO_PREFIX = /^PO:\s*(.*)\n?/;

export function packReceiptNotes(poNumber, notes) {
  const cleanNotes = (notes || "").trim();
  if (!poNumber) return cleanNotes;
  return `PO: ${poNumber}${cleanNotes ? "\n" + cleanNotes : ""}`;
}

export function unpackReceiptNotes(rawNotes) {
  const raw = rawNotes || "";
  const m = PO_PREFIX.exec(raw);
  if (!m) return { poNumber: "", notes: raw };
  return { poNumber: m[1].trim(), notes: raw.slice(m[0].length) };
}

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${mm} ${ampm}`;
}

export const RECEIPT_STATUS_LABEL = {
  draft: "Draft",
  received: "Received",
  cancelled: "Cancelled",
};

export function mapApiReceiptItem(it) {
  if (!it) return null;
  const item = it.item || {};
  return {
    id: it.item_id ?? item.id,
    lineId: it.id,
    name: item.name || it.item_name || "Unknown item",
    sku: item.sku || "",
    cat: item.category?.name || "Uncategorized",
    unit: item.unit?.abbreviation
      ? `${item.unit.name} (${item.unit.abbreviation})`
      : item.unit?.name || "-",
    qty: Number(it.quantity || 0),
    cost: Number(it.unit_cost || 0),
    warehouseLocationId: it.warehouse_location_id ?? null,
  };
}

export function mapApiReceipt(r) {
  if (!r) return null;
  const items = (r.items || []).map(mapApiReceiptItem);
  const qty = items.reduce((a, it) => a + Number(it.qty || 0), 0);
  const val = items.reduce(
    (a, it) => a + Number(it.qty || 0) * Number(it.cost || 0),
    0,
  );
  const { poNumber, notes } = unpackReceiptNotes(r.notes);

  const timeline = [];
  if (r.status === "cancelled") {
    timeline.push({
      title: "Receipt Cancelled",
      date: fmtDateTime(r.updated_at),
      status: "done",
    });
  }
  if (r.received_at) {
    timeline.push({
      title: "Stock Received",
      date: fmtDateTime(r.received_at),
      by: r.receiver?.name,
      status: "done",
    });
  }
  timeline.push({
    title: "Receipt Created",
    date: fmtDateTime(r.created_at),
    by: r.creator?.name,
    status: "done",
  });
  if (r.status === "draft") {
    timeline.unshift({
      title: "Awaiting Receiving",
      date: fmtDateTime(r.created_at),
      status: "pending",
    });
  }

  return {
    id: r.id,
    no: r.receipt_number || "",
    status: RECEIPT_STATUS_LABEL[r.status] || r.status || "Draft",
    apiStatus: r.status,
    api_po_number: r.api_po_number || "",
    vendor_po_number: r.vendor_po_number || "",
    date: r.receipt_date || "",
    supplier: r.supplier?.name || "",
    supplierId: r.supplier_id ?? r.supplier?.id ?? null,
    by: r.creator?.name || "",
    received_by: r.received_by || "",
    receivedById: r.created_by ?? null,
    warehouse: r.warehouse?.name || "",
    warehouseId: r.warehouse_id ?? r.warehouse?.id ?? null,
    receivingLocation: r.receiving_location?.name || "",
    receivingLocationId:
      r.receiving_location_id ?? r.receiving_location?.id ?? null,
    storageLocation: r.receiving_location?.name || "",
    ref: poNumber || "-",
    poNumber,
    notes,
    qty,
    val: "₦" + Math.round(val).toLocaleString("en-NG"),
    deliveryNoteNo: r.receipt_number || "-",
    deliveryDate: r.receipt_date || "",
    discount: 0,
    otherCharges: 0,
    attachments: [],
    items,
    timeline,
    receivedAt: r.received_at || null,
    canEdit: r.status === "draft",
    canDelete: r.status === "draft",
    canReceive: r.status === "draft",
    canCancel: r.status === "draft",
  };
}

function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function mapApiNotification(notification) {
  if (!notification) {
    return null;
  }

  const data = notification.data || {};

  return {
    id: notification.id,

    importId:
      data.import_id ?? null,

    /*
     * IMPORTANT:
     * Do NOT use notification.type here.
     *
     * notification.type is:
     * "App\\Notifications\\ActivityNotification"
     *
     * The useful business type is inside data.type:
     * "transfer_approved"
     * "stock_count_submitted"
     * "maintenance_scheduled"
     * "maintenance_cancelled"
     * etc.
     */
    type: data.type || "notification",

    title:
      data.title || "Notification",

    description:
      data.description || "",

    timeAgo:
      timeAgo(notification.created_at),

    unread:
      notification.read_at === null,

    readAt:
      notification.read_at,

    createdAt:
      notification.created_at,

    updatedAt:
      notification.updated_at,

    // Related entity IDs
    receiptId:
      data.receipt_id ?? null,

    adjustmentId:
      data.adjustment_id ?? null,

    transferId:
      data.transfer_id ?? null,

    stockCountId:
      data.stock_count_id ?? null,

    itemId:
      data.item_id ?? null,

    importId:
      data.import_id ?? null,

    // Maintenance fields
    maintenanceId:
      data.maintenance_id ?? null,

    maintenanceTitle:
      data.maintenance_title ?? null,

    maintenanceStatus:
      data.status ?? null,

    startsAt:
      data.starts_at ?? null,

    endsAt:
      data.ends_at ?? null,

    affectedService:
      data.affected_service ?? null,

    /*
     * Keep the complete notification payload available
     * for future dialog logic.
     */
    data,

    raw: notification,
  };
}

export function mapApiReceiptForApproval(r) {
  if (!r) return null;
  const items = (r.items || []).map((it) => {
    const item = it.item || {};
    const qty = Number(it.quantity || 0);
    const unitCost = Number(it.unit_cost || 0);
    return {
      id: it.item_id ?? item.id,
      name: item.name || it.item_name || "Unknown item",
      sku: item.sku || "",
      cat: item.category?.name || "Uncategorized",
      unit: item.unit?.abbreviation
        ? `${item.unit.name} (${item.unit.abbreviation})`
        : item.unit?.name || "-",
      qty,
      unitCost,
      totalCost: qty * unitCost,
    };
  });
  const qty = items.reduce((a, it) => a + it.qty, 0);
  const amount = items.reduce((a, it) => a + it.totalCost, 0);
  const { poNumber, notes } = unpackReceiptNotes(r.notes);

  return {
    receipt: {
      number: r.receipt_number || "",
      supplier: r.supplier?.name || "",
      submittedOn: fmtDateTime(r.created_at),
      warehouse: r.warehouse?.name || "",
      submittedBy: r.creator?.name || "",
      type: "Purchase Receipt",
      expectedDeliveryDate: r.receipt_date || "",
    },
    items,
    totals: {
      items: items.length,
      qty: `${qty} ${items[0]?.unit ?? ""}`.trim(),
      amount,
    },
    reference: {
      poNumber,
      invoiceNumber: r.vendor_po_number || "",
      deliveryNote: r.receipt_number || "",
    },
    notes,
    workflowSteps: [
      {
        label: "Submitted",
        status: "done",
        date: fmtDateTime(r.created_at),
        by: r.creator?.name,
      },
      { label: "Pending Approval", status: "current" },
      { label: "Approved", status: "pending" },
    ],
  };
}

function resolveActor(actor) {
  if (!actor) return { name: "", role: "" };
  if (typeof actor === "object") return { name: actor.name || "", role: "" };
  return { name: "", role: "" }; // raw id, no lookup available
}

const VARIANCE_LEVEL_THRESHOLDS = [
  { level: "Critical", range: "> 10%", min: 10 },
  { level: "High", range: "5% - 10%", min: 5 },
  { level: "Low", range: "2% - 5%", min: 2 },
  { level: "Within Limit", range: "≤ 2%", min: 0 },
];

function levelFor(pct) {
  const abs = Math.abs(pct);
  return (
    VARIANCE_LEVEL_THRESHOLDS.find((t) => abs >= t.min) ||
    VARIANCE_LEVEL_THRESHOLDS.at(-1)
  );
}

export function mapApiStockCountVariance(sc) {
  if (!sc) return null;
  const items = sc.items || [];
  const submittedBy = resolveActor(sc.submitted_by);

  const rows = items.map((it) => {
    const sys = Number(it.system_quantity || 0);
    const counted = Number(it.counted_quantity || 0);
    const variance = Number(it.variance_quantity ?? counted - sys);
    // NOTE: when system qty is 0 and there's any variance, treated as 100% swing
    // to avoid divide-by-zero. Not a confirmed business rule - revisit if this
    // matters for reporting accuracy.
    const pct = sys !== 0 ? (variance / sys) * 100 : variance !== 0 ? 100 : 0;
    const value = variance * Number(it.item?.unit_cost || 0);
    return {
      name: it.item?.name || "Unknown item",
      cat: "—", // category not expanded in this payload
      sku: it.item?.sku || "",
      systemQty: sys,
      countedQty: counted,
      variance,
      variancePct: Number(pct.toFixed(1)),
      value,
    };
  });

  const levelBuckets = VARIANCE_LEVEL_THRESHOLDS.map((t) => ({
    level: t.level,
    range: t.range,
    items: 0,
    qty: 0,
    value: 0,
  }));
  rows.forEach((r) => {
    const bucket = levelBuckets.find(
      (b) => b.level === levelFor(r.variancePct).level,
    );
    bucket.items += 1;
    bucket.qty += r.variance;
    bucket.value += r.value;
  });

  const totalVarianceQty = rows.reduce((a, r) => a + r.variance, 0);
  const totalVarianceValue = rows.reduce((a, r) => a + r.value, 0);
  const totalSystemQty = rows.reduce((a, r) => a + r.systemQty, 0);
  const variancePct =
    totalSystemQty !== 0
      ? Number(((totalVarianceQty / totalSystemQty) * 100).toFixed(2))
      : null;

  return {
    count: {
      number: sc.count_number || "",
      countedOn: sc.submitted_at
        ? fmtDateTime(sc.submitted_at)
        : fmtDateTime(sc.updated_at),
      location: sc.location?.name || "",
      zone: sc.warehouse?.name || "",
      countType: sc.count_type || "",
      countedBy: submittedBy.name,
      countedByRole: "",
      approvalFrom: "", // no approver assigned yet at pending_review
      approvalFromRole: "",
    },
    summary: {
      itemsCounted: rows.length,
      totalVarianceQty: `${totalVarianceQty}`,
      totalVarianceValue,
      variancePct,
    },
    varianceLevels: levelBuckets.map((b) => ({ ...b, qty: `${b.qty}` })),
    topVariances: rows
      .slice()
      .sort((a, b) => Math.abs(b.variancePct) - Math.abs(a.variancePct))
      .slice(0, 5)
      .map((r) => ({ ...r, variance: `${r.variance}` })),
  };
}

export function mapNotificationToSimpleDialog(n) {
  if (!n) return null;
  return {
    title: n.title,
    description: n.description,
    timeAgo: n.timeAgo,
    stockCountId: n.stockCountId,
  };
}

export function mapApiAdjustmentPending(
  adj,
  itemsById = {},
  locationsById = {},
) {
  if (!adj) return null;
  const items = (adj.items || []).map((it) => {
    const item = itemsById[it.item_id] || {};
    const loc = locationsById[it.warehouse_location_id] || {};
    const qtyChange = Number(it.adjustment_quantity || 0);
    return {
      name: item.name || `Item #${it.item_id}`,
      sku: item.sku || "",
      cat: item.category?.name || "",
      location:
        loc.name ||
        (it.warehouse_location_id
          ? `Location #${it.warehouse_location_id}`
          : "—"),
      zone: "",
      qtyChange:
        adj.adjustment_type === "decrease" ? `-${qtyChange}` : `+${qtyChange}`,
      unit: item.unit?.abbreviation || "",
    };
  });

  const totalChange = items.reduce((a, it) => a + parseFloat(it.qtyChange), 0);

  return {
    adjustment: {
      number: adj.adjustment_number || "",
      type: adj.adjustment_type === "decrease" ? "Decrease" : "Increase",
      submittedOn: fmtDateTime(adj.created_at),
      reason: adj.reason || "",
      submittedBy: "", // adjusted_by/created_by are raw ids, no expansion available
      submittedByRole: "",
      approvalFrom: "",
      approvalFromRole: "",
    },
    items,
    stockSummary: {
      previous: "—", // quantity_before/after are 0.000 placeholders in this payload, not reliable
      adjustment: `${totalChange >= 0 ? "+" : ""}${totalChange}`,
      expected: "—",
    },
    details: {
      reasonDetails: adj.notes || "",
      reference: adj.adjustment_number || "",
      affectedBy: "",
      attachment: null,
    },
    workflowSteps: [
      { label: "Submitted", status: "done", date: fmtDateTime(adj.created_at) },
      { label: "Pending Approval", status: "current" },
      { label: "Approved", status: "pending" },
    ],
  };
}

export function mapApiTransferApproved(
  transfer,
  itemsById = {},
  locationsById = {},
  warehousesById = {},
) {
  if (!transfer) return null;
  const items = (transfer.items || []).map((it) => {
    const item = itemsById[it.item_id] || {};
    return {
      name: item.name || `Item #${it.item_id}`,
      sku: item.sku || "",
      cat: item.category?.name || "",
      qty: Number(it.quantity || 0),
      unit: item.unit?.abbreviation || "",
    };
  });
  const fromLoc = locationsById[transfer.from_location_id] || {};
  const toLoc = locationsById[transfer.to_location_id] || {};
  const fromWh = warehousesById[transfer.from_warehouse_id] || {};
  const toWh = warehousesById[transfer.to_warehouse_id] || {};

  return {
    transfer: {
      number: transfer.transfer_number || "",
      fromLocation: fromLoc.name || `Location #${transfer.from_location_id}`,
      fromZone: fromWh.name || "",
      toLocation: toLoc.name || `Location #${transfer.to_location_id}`,
      toZone: toWh.name || "",
      approvedOn: fmtDateTime(transfer.approved_at),
      completedOn: fmtDateTime(transfer.completed_at),
      approvedBy: "", // approved_by is a raw id, no expansion available
      approvedByRole: "",
      completedBy: "",
      completedByRole: "",
      purpose: transfer.notes || "",
    },
    items,
    totals: {
      items: items.length,
      qty: `${items.reduce((a, it) => a + it.qty, 0)} ${items[0]?.unit ?? ""}`.trim(),
      type: "Stock Transfer",
    },
    details: {
      requestedOn: fmtDateTime(transfer.created_at),
      requestedBy: "",
      requestedByRole: "",
      reference: transfer.transfer_number || "",
      status: transfer.status === "completed" ? "Completed" : "Approved",
    },
    summary: {
      previousLocation: fromLoc.name || "",
      previousStock: "—",
      transferredOut: `${items.reduce((a, it) => a + it.qty, 0)}`,
      transferredIn: `${items.reduce((a, it) => a + it.qty, 0)}`,
      newLocation: toLoc.name || "",
      newStock: "—",
    },
  };
}

export function mapApiItemStockAlert(item, stockBalance) {
  if (!item) return null;
  const locations = (stockBalance?.by_location || []).map((l) => {
    const onHand = Number(l.quantity_on_hand || 0);
    const available = Number(l.quantity_available || 0);
    let status = "In Stock";
    if (onHand === 0) status = "Out of Stock";
    else if (onHand <= Number(item.reorder_level || 0)) status = "Low Stock";
    return {
      name: l.location?.name || `Location #${l.warehouse_location_id}`,
      zone: l.warehouse?.name || "",
      onHand,
      reserved: Number(l.quantity_reserved || 0),
      available,
      status,
    };
  });

  return {
    item: {
      name: item.name,
      sku: item.sku,
      category: item.category?.name || "",
      brand: item.brand || "",
      unit: item.unit?.abbreviation || "",
      status: item.status === "active" ? "Active" : item.status,
    },
    locations,
    stats: {
      totalAvailable: Number(stockBalance?.total_available ?? 0),
      reorderLevel: Number(item.reorder_level || 0),
      shortage: Math.max(
        0,
        Number(item.reorder_level || 0) -
        Number(stockBalance?.total_available ?? 0),
      ),
      leadTimeDays: null, // not present in any confirmed payload
    },
  };
}

export const IMPORTABLE_TYPES = ["items", "inventory"];