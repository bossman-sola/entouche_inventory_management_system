import {
  listStockCounts,
  createStockCount,
  getStockCount,
  updateStockCount,
  deleteStockCount,
  addStockCountItem,
  updateStockCountItem,
  removeStockCountItem,
  submitStockCount,
  approveStockCount,
  rejectStockCount,
  requestStockCountRecount,
  cancelStockCount,
  getStockCountOverview,
  getStockCountLookups,
  exportStockCounts,
} from "../api/StockCountApi.js";
import { listUsers } from "../../../lib/api.js";
import { warehousesApi } from "../../warehouse/api/warehousesApi.js";


export async function apiFetchOverview() {
  try {
    const ov = await getStockCountOverview();
    if (ov) {
      return {
        totalStockCounts: ov.total_stock_counts ?? ov.totalStockCounts,
        totalDelta: ov.total_delta ?? ov.totalDelta,
        pendingReview:
          ov.pending_review ?? ov.pendingReview ?? ov.awaiting_approval,
        variancesFound: ov.variances_found ?? ov.variancesFound,
        completedCounts: ov.completed_counts ?? ov.completedCounts,
        completedDelta: ov.completed_delta ?? ov.completedDelta,
        breakdown: ov.breakdown ?? ov.status_breakdown ?? [],
        countTypes: ov.count_types ?? ov.countTypes ?? [],
        recentActivity: ov.recent_activity ?? ov.recentActivity ?? [],
      };
    }
  } catch (err) {
    
  }
  
  try {
    const { stockCounts, meta } = await listStockCounts({ page: 1 });
    const total = meta?.total ?? stockCounts.length;
    const completedCounts = stockCounts.filter(
      (s) => s.status === "approved" || s.status === "completed",
    ).length;
    const variancesFound = stockCounts.reduce((acc, sc) => {
      const items = sc.items || [];
      const v = items.reduce(
        (a, it) =>
          a + (Number(it.variance_quantity || it.variance || 0) !== 0 ? 1 : 0),
        0,
      );
      return acc + v;
    }, 0);
    return {
      totalStockCounts: total,
      totalDelta: undefined,
      pendingReview: stockCounts.filter((s) => s.status === "completed").length,
      variancesFound,
      completedCounts,
      completedDelta: undefined,
      breakdown: [],
      countTypes: [],
      recentActivity: [],
    };
  } catch (err) {
    return null;
  }
}


export async function apiFetchStockCounts(params = {}) {
  const { stockCounts, meta } = await listStockCounts(params);
  const rows = (stockCounts || []).map((sc) => {
    const varianceVal =
      sc.total_variance ??
      sc.totalVariance ??
      (sc.items
        ? sc.items.reduce(
            (a, it) => a + Number(it.variance_quantity || it.variance || 0),
            0,
          )
        : 0);
    const countedBy =
      sc.counted_by_name || sc.counted_by || sc.countedBy || "-";
    const date = sc.count_date || sc.countDate || sc.created_at || sc.createdAt;
    const d = date ? new Date(date) : null;
    return {
      id: sc.id,
      countNo: sc.count_number || sc.countNo || `#${sc.id}`,
      warehouse:
        (sc.warehouse && (sc.warehouse.name || sc.warehouse)) ||
        sc.warehouse_id ||
        "-",
      location:
        (sc.location && (sc.location.name || sc.location)) ||
        sc.warehouse_location_id ||
        "-",
      countType: sc.count_type || sc.countType || sc.type || "-",
      items: sc.items ? sc.items.length : (sc.items_count ?? 0),
      variance: varianceVal,
      status: (sc.status || "")
        .replace(/_/g, " ")
        .replace(/^./, (s) => s.toUpperCase()),
      
      rawStatus: sc.status,
      rawWarehouseId: sc.warehouse_id,
      rawWarehouseLocationId: sc.warehouse_location_id,
      rawCountDate: (sc.count_date || sc.created_at || "").slice(0, 10),
      countedBy,
      date: d ? d.toLocaleDateString() : "-",
      time: d
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    };
  });
  return {
    rows,
    total: meta?.total ?? rows.length,
    page: meta?.current_page ?? params.page ?? 1,
    pageSize: meta?.per_page ?? params.pageSize ?? 10,
  };
}


export async function apiFetchStockCountDetails(id) {
  const sc = await getStockCount(id);
  if (!sc) return null;
  const header = {
    id: sc.id,
    countNo: sc.count_number || sc.countNo || `#${sc.id}`,
    warehouse: sc.warehouse?.name || sc.warehouse || sc.warehouse_id,
    location: sc.location?.name || sc.location || sc.warehouse_location_id,
    countType: sc.count_type || sc.countType,
    countScope: sc.count_scope || sc.scope,
    priority: sc.priority,
    scheduledDate: sc.count_date || sc.countDate,
    startedTime: sc.started_at || sc.startedAt,
    assignedCounter:
      sc.assigned_counter_name || sc.assignedCounter || sc.counted_by,
    notes: sc.notes || sc.description,
    status: (sc.status || "")
      .replace(/_/g, " ")
      .replace(/^./, (s) => s.toUpperCase()),
    rawStatus: sc.status,
  };

  const items = (sc.items || []).map((it) => ({
    id: it.id,
    name: it.item?.name || it.name || "-",
    sku: it.item?.sku || it.sku || "-",
    barcode: it.item?.barcode || it.barcode || "-",
    location: it.location?.name || it.location || "-",
    shelf: it.shelf || "-",
    systemQty:
      it.system_quantity ??
      it.systemQty ??
      it.system_quantity?.toString?.() ??
      "-",
    countedQty: it.counted_quantity ?? it.countedQty ?? null,
    variance: Number(it.variance_quantity ?? it.variance ?? 0),
    remarks: it.remarks,
  }));

  const totalItems = items.length;
  const countedItems = items.filter(
    (i) =>
      i.countedQty !== null &&
      i.countedQty !== undefined &&
      i.countedQty !== "",
  ).length;
  const uncountedItems = totalItems - countedItems;
  const totalVariance = items.reduce(
    (a, it) => a + (Number(it.variance) || 0),
    0,
  );

  const stats = {
    totalItems,
    countedItems,
    uncountedItems,
    countedPct: totalItems ? Math.round((countedItems / totalItems) * 100) : 0,
    uncountedPct: totalItems
      ? Math.round((uncountedItems / totalItems) * 100)
      : 0,
    totalVariance,
    totalVariancePct: undefined,
    progressPct: totalItems ? Math.round((countedItems / totalItems) * 100) : 0,
  };

  const activity = (sc.activity || []).map((a) => ({
    title: a.title || a.type,
    detail: a.description || a.detail,
    time: a.time || a.created_at,
    done: !!a.done,
  }));

  return { header, stats, items, activity };
}

export async function apiFetchLookups() {
  try {
    const lk = await getStockCountLookups();
    if (lk) {
      const mapOpts = (arr, labelKeys) =>
        (arr || []).map((o) => ({
          value: o.id ?? o.value,
          label: labelKeys.map((k) => o[k]).find(Boolean) || `#${o.id}`,
          warehouseId: o.warehouse_id,
        }));
      return {
        warehouses: mapOpts(lk.warehouses, ["name", "warehouse_name"]),
        locations: mapOpts(lk.locations, ["name", "location_name"]),
        users: mapOpts(lk.users, ["name", "email"]),
      };
    }
  } catch (err) {
    
  }
  try {
    
    const allWarehouses = await warehousesApi.listAll();
    const warehouses = allWarehouses.map((w) => ({
      value: w.id,
      label: w.name || w.warehouse_name || `Warehouse ${w.id}`,
    }));

   
    const locationsByWarehouse = await Promise.all(
      allWarehouses.map((w) =>
        warehousesApi
          .listLocations(w.id)
          .then((locs) =>
            (locs || []).map((loc) => ({
              value: loc.id,
              label: loc.name || loc.location_name || `Location ${loc.id}`,
              warehouseId: w.id,
            })),
          )
          .catch(() => []),
      ),
    );
    const locations = locationsByWarehouse.flat();

    const usersRaw = await listUsers();
    const users = (usersRaw || []).map((u) => ({
      value: u.id,
      label: u.name || u.email || `User ${u.id}`,
    }));

    return { warehouses, locations, users };
  } catch (err) {
    return { warehouses: [], locations: [], users: [] };
  }
}


export async function apiCreateStockCount(payload) {
  const body = {
    warehouse_id: payload.warehouse_id || payload.warehouse,
    warehouse_location_id:
      payload.location || payload.warehouse_location_id || null,
    count_type: payload.countType || undefined,
    priority: payload.priority ? payload.priority.toLowerCase() : undefined,
    count_date: payload.scheduledDate || payload.count_date,
    start_time: payload.startTime || undefined,
    assigned_to: payload.assignedCounter || undefined,
    notes: payload.notes || undefined,
  };
  const stockCount = await createStockCount(body);

  
  const items = payload.items || [];
  for (const it of items) {
    await addStockCountItem(stockCount.id, {
      item_id: it.item_id,
      warehouse_location_id: it.warehouse_location_id ?? null,
    });
  }
  return stockCount;
}


export async function apiUpdateStockCount(id, payload) {
  const body = {
    warehouse_id: payload.warehouse_id || payload.warehouse || undefined,
    warehouse_location_id:
      payload.location || payload.warehouse_location_id || null,
    count_type: payload.countType || undefined,
    priority: payload.priority ? payload.priority.toLowerCase() : undefined,
    count_date: payload.scheduledDate || payload.count_date,
    start_time: payload.startTime || undefined,
    assigned_to: payload.assignedCounter || undefined,
    notes: payload.notes,
  };
  return await updateStockCount(id, body);
}


export async function apiDeleteStockCount(id) {
  return await deleteStockCount(id);
}


export async function apiAddStockCountItem(stockCountId, payload) {
  return await addStockCountItem(stockCountId, payload);
}


export async function apiUpdateStockCountItem(stockCountId, itemId, payload) {
  return await updateStockCountItem(stockCountId, itemId, payload);
}


export async function apiRemoveStockCountItem(stockCountId, itemId) {
  return await removeStockCountItem(stockCountId, itemId);
}


export async function apiDuplicateStockCount(id) {
  const source = await getStockCount(id);
  if (!source) return null;

  const copy = await createStockCount({
    warehouse_id: source.warehouse_id,
    warehouse_location_id: source.warehouse_location_id,
    count_type: source.count_type,
    priority: source.priority,
    count_date: new Date().toISOString().slice(0, 10),
    assigned_to: source.counted_by,
    notes: source.notes,
  });

  for (const it of source.items || []) {
    await addStockCountItem(copy.id, {
      item_id: it.item_id,
      warehouse_location_id: it.warehouse_location_id ?? null,
    });
  }
  return copy;
}


export async function apiTransitionStockCount(id, action, extra) {
  switch (action) {
    case "submit":
      return await submitStockCount(id);
    case "approve":
      return await approveStockCount(id);
    case "reject":
      return await rejectStockCount(id, extra?.reason || "");
    case "request-recount":
      return await requestStockCountRecount(id, extra?.reason);
    case "cancel":
      return await cancelStockCount(id);
    default:
      throw new Error(`Unsupported transition action: ${action}`);
  }
}


export async function apiExportStockCounts(options = {}) {
  const format = options.format === "pdf" ? "xlsx" : options.format || "xlsx";
  const ids = options.id != null ? [options.id] : options.ids;
  return await exportStockCounts({ format, ids });
}
