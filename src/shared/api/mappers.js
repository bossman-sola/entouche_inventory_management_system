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
  submitted: "Pending Approval",
  approved: "Approved",
  received: "Received",
  cancelled: "Cancelled",
};

export function mapApiReceiptItem(it) {
  if (!it) return null;

  const item =
    it.item || {};

  return {
    id:
      it.item_id ??
      item.id,

    lineId:
      it.id,

    name:
      item.name ||
      it.item_name ||
      "Unknown item",

    sku:
      item.sku ||
      "",

    cat:
      item.category?.name ||
      "Uncategorized",

    unit:
      item.unit?.abbreviation ||
      item.unit?.name ||
      "-",

    qty:
      Number(
        it.quantity || 0
      ),

    cost:
      Number(
        it.unit_cost || 0
      ),

    warehouseLocationId:
      it.warehouse_location_id ??
      null,

    location:
      it.location?.name ||
      "",
  };
}

export function mapApiReceipt(r) {
  if (!r) return null;

  const items = (r.items || []).map(
    mapApiReceiptItem
  );

  const qty = items.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  );

  const val = items.reduce(
    (sum, item) =>
      sum +
      Number(item.qty || 0) *
      Number(item.cost || 0),
    0
  );

  const {
    poNumber,
    notes,
  } = unpackReceiptNotes(r.notes);

  /*
   * Actual receiver takes priority.
   *
   * Imported receipts usually have no received_by
   * because the spreadsheet has no receiver column.
   * In that case the importing/creating user is shown.
   */
  const receivedByUser =
    r.receiver ||
    r.creator ||
    null;

  /*
   * Receipt-item storage location.
   * Fall back to receipt receiving location if the
   * individual line does not expose a location.
   */
  const firstItemLocation =
    r.items?.find(
      (item) => item.location
    )?.location || null;

  const storageLocation =
    firstItemLocation?.name ||
    r.receiving_location?.name ||
    "";

  const timeline = [];

  if (r.status === "cancelled") {
    timeline.push({
      title:
        "Receipt Cancelled",

      date:
        fmtDateTime(
          r.updated_at
        ),

      status: "done",
    });
  }

  if (r.received_at) {
    timeline.push({
      title:
        "Stock Received",

      date:
        fmtDateTime(
          r.received_at
        ),

      by:
        receivedByUser?.name ||
        "",

      status: "done",
    });
  }

  timeline.push({
    title:
      "Receipt Created",

    date:
      fmtDateTime(
        r.created_at
      ),

    by:
      r.creator?.name ||
      "",

    status: "done",
  });

  if (r.status === "draft") {
    timeline.unshift({
      title:
        "Awaiting Receiving",

      date:
        fmtDateTime(
          r.created_at
        ),

      status: "pending",
    });
  }

  return {
    id:
      r.id,

    no:
      r.receipt_number ||
      "",

    status:
      RECEIPT_STATUS_LABEL[
      r.status
      ] ||
      r.status ||
      "Draft",

    apiStatus:
      r.status,

    api_po_number:
      r.api_po_number ||
      "",

    vendor_po_number:
      r.vendor_po_number ||
      "",

    date:
      r.receipt_date ||
      "",

    supplier:
      r.supplier?.name ||
      "",

    supplierId:
      r.supplier_id ??
      r.supplier?.id ??
      null,

    by:
      r.creator?.name ||
      "",

    /*
     * Display name, NOT numeric ID.
     */
    receivedBy:
      receivedByUser?.name ||
      "",

    receivedByRole:
      receivedByUser?.roles?.[0]?.name
        ?.replace(/_/g, " ")
        ?.replace(
          /\b\w/g,
          (c) => c.toUpperCase()
        ) || "",

    receivedById:
      r.received_by ??
      r.created_by ??
      null,

    warehouse:
      r.warehouse?.name ||
      "",

    warehouseId:
      r.warehouse_id ??
      r.warehouse?.id ??
      null,

    receivingLocation:
      r.receiving_location?.name ||
      "",

    receivingLocationId:
      r.receiving_location_id ??
      r.receiving_location?.id ??
      null,

    storageLocation,

    ref:
      poNumber ||
      "-",

    poNumber,

    notes,

    qty,

    val:
      "₦" +
      Math.round(
        val
      ).toLocaleString(
        "en-NG"
      ),

    deliveryNoteNo:
      r.receipt_number ||
      "-",

    deliveryDate:
      r.receipt_date ||
      "",

    discount: 0,

    otherCharges: 0,

    attachments: [],

    items,

    timeline,

    receivedAt:
      r.received_at ||
      null,

    canEdit:
      r.status === "draft",

    canDelete:
      r.status === "draft",

    canSubmit:
      r.status === "draft",

    canApprove:
      r.status === "submitted",

    canReceive:
      r.status === "approved",

    canCancel:
      [
        "draft",
        "submitted",
        "approved",
      ].includes(r.status),
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
  if (!r) {
    return null;
  }

  const items = (
    r.items || []
  ).map((it) => {
    const item =
      it.item || {};

    const qty =
      Number(
        it.quantity || 0,
      );

    const unitCost =
      Number(
        it.unit_cost || 0,
      );

    const totalCost =
      it.total_cost !==
        undefined &&
        it.total_cost !== null
        ? Number(
          it.total_cost,
        )
        : qty * unitCost;

    return {
      id:
        it.item_id ??
        item.id,

      lineId:
        it.id,

      name:
        item.name ||
        it.item_name ||
        "Unknown item",

      sku:
        item.sku ||
        "",

      cat:
        item.category
          ?.name ||
        "Uncategorized",

      unit:
        item.unit
          ?.abbreviation ||
        item.unit?.name ||
        "-",

      qty,

      unitCost,

      totalCost,
    };
  });

  const totalQty =
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.qty || 0,
        ),
      0,
    );

  const totalAmount =
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalCost || 0,
        ),
      0,
    );

  const {
    poNumber: legacyPoNumber,
    notes,
  } =
    unpackReceiptNotes(
      r.notes,
    );

  /*
   * receipt_date is a business DATE.
   *
   * Do not pass it through new Date()
   * because that can shift the date
   * according to the browser timezone.
   */
  const formatDateOnly = (
    value,
  ) => {
    if (!value) {
      return "";
    }

    const dateOnly =
      String(value).slice(
        0,
        10,
      );

    const [
      year,
      month,
      day,
    ] =
      dateOnly.split("-");

    if (
      !year ||
      !month ||
      !day
    ) {
      return value;
    }

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

    const monthIndex =
      Number(month) - 1;

    if (
      monthIndex < 0 ||
      monthIndex > 11
    ) {
      return value;
    }

    return `${months[monthIndex]
      } ${Number(
        day,
      )}, ${year}`;
  };

  const submittedByRole =
    r.creator?.roles?.[0]
      ?.name
      ?.replace(
        /_/g,
        " ",
      )
      ?.replace(
        /\b\w/g,
        (c) =>
          c.toUpperCase(),
      ) || "";

  return {
    receipt: {
      number:
        r.receipt_number ||
        "",

      supplier:
        r.supplier?.name ||
        "",

      /*
       * created_at is a real timestamp,
       * so local date + time is correct here.
       */
      submittedOn:
        fmtDateTime(
          r.created_at,
        ),

      submittedBy:
        r.creator?.name ||
        "",

      submittedByRole,

      warehouse:
        r.warehouse?.name ||
        "",

      type:
        "Standard Receipt",

      /*
       * receipt_date stays date-only.
       */
      expectedDeliveryDate:
        formatDateOnly(
          r.receipt_date,
        ),
    },

    items,

    totals: {
      items:
        items.length,

      qty:
        totalQty,

      amount:
        totalAmount,

      taxPct:
        0,

      taxAmount:
        0,
    },

    reference: {
      /*
       * Prefer the proper dedicated DB
       * field. The unpacked note value is
       * retained only as compatibility
       * fallback for older records.
       */
      poNumber:
        r.vendor_po_number ||
        legacyPoNumber ||
        "",

      invoiceNumber:
        r.invoice_number ||
        "",

      deliveryNote:
        r.receipt_number ||
        "",
    },

    notes:
      notes || "",

    workflowSteps: [
      {
        label:
          "Submitted",

        status:
          "done",

        date:
          fmtDateTime(
            r.created_at,
          ),

        by:
          r.creator?.name ||
          "",

        byRole:
          submittedByRole,
      },

      {
        label:
          "Pending Approval",

        status:
          "current",
      },

      {
        label:
          "Approved",

        status:
          "pending",
      },
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

export function mapApiAdjustmentPending(adj) {
  if (!adj) {
    return null;
  }

  const items = (adj.items || []).map((row) => {
    const item = row.item || {};
    const location =
      row.location ||
      adj.location ||
      {};

    const qty =
      Number(row.adjustment_quantity || 0);

    const signedQty =
      adj.adjustment_type === "decrease"
        ? -qty
        : qty;

    return {
      id: row.id,

      name:
        item.name ||
        `Item #${row.item_id}`,

      sku:
        item.sku || "",

      cat:
        item.category?.name ||
        "Uncategorized",

      location:
        location.name || "—",

      zone:
        adj.warehouse?.name || "",

      qtyChange:
        `${signedQty > 0 ? "+" : ""}${signedQty}`,

      unit:
        item.unit?.abbreviation ||
        item.unit?.name ||
        "",
    };
  });

  const totalChange =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.qtyChange || 0),
      0,
    );

  const submittedBy =
    adj.adjusted_by || null;

  const approvedBy =
    adj.approved_by || null;

  const submittedByRole =
    submittedBy?.roles?.[0]?.name
      ?.replace(/_/g, " ")
      ?.replace(
        /\b\w/g,
        (c) => c.toUpperCase(),
      ) || "";

  const approvalFromRole =
    approvedBy?.roles?.[0]?.name
      ?.replace(/_/g, " ")
      ?.replace(
        /\b\w/g,
        (c) => c.toUpperCase(),
      ) || "";

  const firstRow =
    adj.items?.[0];

  const previousStock =
    firstRow?.quantity_before != null
      ? Number(firstRow.quantity_before)
      : null;

  const expectedStock =
    previousStock != null
      ? previousStock + totalChange
      : null;

  return {
    adjustment: {
      number:
        adj.adjustment_number || "",

      type:
        adj.adjustment_type ===
          "decrease"
          ? "Decrease"
          : "Increase",

      submittedOn:
        fmtDateTime(
          adj.created_at,
        ),

      reason:
        adj.reason || "",

      submittedBy:
        submittedBy?.name || "",

      submittedByRole,

      approvalFrom:
        approvedBy?.name ||
        "Warehouse Manager",

      approvalFromRole,
    },

    items,

    stockSummary: {
      previous:
        previousStock ?? "—",

      adjustment:
        `${totalChange > 0 ? "+" : ""}${totalChange}`,

      expected:
        expectedStock ?? "—",
    },

    details: {
      reasonDetails:
        adj.notes ||
        adj.reason ||
        "",

      reference:
        adj.adjustment_number || "",

      affectedBy:
        submittedBy?.name || "",

      attachment:
        null,

      attachmentUrl:
        null,
    },

    workflowSteps: [
      {
        label: "Submitted",
        status: "done",

        date:
          fmtDateTime(
            adj.created_at,
          ),

        by:
          submittedBy?.name || "",
      },

      {
        label:
          "Pending Approval",

        status: "current",
      },

      {
        label: "Approved",
        status: "pending",
      },
    ],
  };
}

export function mapApiTransferApproved(transfer) {
  if (!transfer) return null;

  const items = (transfer.items || []).map((it) => {
    const item = it.item || {};

    return {
      id: it.item_id ?? item.id,
      name: item.name || `Item #${it.item_id}`,
      sku: item.sku || "",
      cat: item.category?.name || "Uncategorized",
      qty: Number(it.quantity || 0),
      unit:
        item.unit?.abbreviation ||
        item.unit?.name ||
        "",
    };
  });

  const totalQty = items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  const fromLocation =
    transfer.from_location?.name || "";

  const toLocation =
    transfer.to_location?.name || "";

  const fromWarehouse =
    transfer.from_warehouse?.name || "";

  const toWarehouse =
    transfer.to_warehouse?.name || "";

  const completedByRole =
    transfer.completer?.roles?.[0]?.name
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "";

  const approvedByRole =
    transfer.approver?.roles?.[0]?.name
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "";

  const requestedByRole =
    transfer.requester?.roles?.[0]?.name
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "";

  return {
    transfer: {
      requestedOn:
        fmtDateTime(transfer.created_at),

      requestedBy:
        transfer.requester?.name || "",

      requestedByRole,

      reference:
        transfer.transfer_number || "",

      status:
        transfer.status === "rejected"
          ? "Rejected"
          : transfer.status === "completed"
            ? "Completed"
            : "Approved",

      rejectionReason:
        transfer.rejection_reason || "",

      number:
        transfer.transfer_number || "",

      fromLocation:
        fromLocation || "—",

      fromZone:
        fromWarehouse || "",

      toLocation:
        toLocation || "—",

      toZone:
        toWarehouse || "",

      approvedOn:
        fmtDateTime(transfer.approved_at),

      approvedBy:
        transfer.approver?.name || "",

      approvedByRole,

      completedOn:
        fmtDateTime(transfer.completed_at),

      completedBy:
        transfer.completer?.name || "",

      completedByRole,

      purpose:
        transfer.notes || "",
    },

    items,

    totals: {
      items: items.length,

      qty:
        `${totalQty}${items[0]?.unit
          ? ` ${items[0].unit}`
          : ""
        }`,

      type: "Stock Transfer",
    },

    details: {
      requestedOn:
        fmtDateTime(transfer.created_at),

      requestedBy:
        transfer.requester?.name || "",

      requestedByRole,

      reference:
        transfer.transfer_number || "",

      status:
        transfer.status === "completed"
          ? "Completed"
          : "Approved",
    },

    summary: {
      previousLocation:
        fromLocation || "—",

      previousStock: "—",

      transferredOut:
        `${totalQty}`,

      transferredIn:
        `${totalQty}`,

      newLocation:
        toLocation || "—",

      newStock: "—",
    },

    notes:
      transfer.notes || "",
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