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

export const IMPORTABLE_TYPES = ["items", "inventory"];
