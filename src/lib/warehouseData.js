import apiClient from '../shared/api/axiosClient.js';
import { warehousesApi } from '../features/warehouse/api/warehousesApi.js';


export async function fetchAllItems() {
  let page = 1;
  let all = [];
  while (page <= 50) {
    const { data: json } = await apiClient.get('/items', { params: { per_page: 100, page } });
    all = all.concat(json.data || []);
    const meta = json.meta;
    if (!meta || page >= meta.last_page) break;
    page += 1;
  }
  return all;
}

export async function fetchStockBalances(items) {
  const settled = await Promise.allSettled(
    items.map((item) => apiClient.get(`/items/${item.id}/stock-balance`))
  );
  return settled.map((r, idx) => ({
    item: items[idx],
    balance: r.status === 'fulfilled' ? r.value.data.data : null,
  }));
}

export async function fetchAllLocations() {
  const warehouses = await warehousesApi.listAll();
  const settled = await Promise.allSettled(
    warehouses.map((w) => warehousesApi.listLocations(w.id))
  );
  const locations = settled.flatMap((r, idx) => {
    if (r.status !== 'fulfilled') return [];
    return (r.value || []).map((loc) => ({
      ...loc,
      warehouse: warehouses[idx].name,
      warehouseId: warehouses[idx].id,
    }));
  });
  return { warehouses, locations };
}


export function aggregateQuantityByLocation(balances, locationsById) {
  const map = new Map();
  for (const { balance } of balances) {
    const rows = Array.isArray(balance?.by_location) ? balance.by_location : [];
    for (const row of rows) {
      const locId = row.location_id ?? row.warehouse_location_id ?? row.location?.id ?? null;
      const qty = Number(row.quantity ?? row.on_hand ?? row.qty ?? row.total_on_hand ?? 0);
      const label =
        locationsById.get(locId)?.name ??
        row.location?.name ??
        row.location_name ??
        (locId ? `Location #${locId}` : 'Unspecified');
      const key = locId ?? label;
      const prev = map.get(key) || { label, qty: 0 };
      prev.qty += qty;
      map.set(key, prev);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
}

export function buildLocationQtyMap(balances) {
  const map = new Map();
  for (const { balance } of balances) {
    const rows = Array.isArray(balance?.by_location) ? balance.by_location : [];
    for (const row of rows) {
      const locId = row.location_id ?? row.warehouse_location_id ?? row.location?.id ?? null;
      if (locId == null) continue;
      const qty = Number(row.quantity ?? row.on_hand ?? row.qty ?? row.total_on_hand ?? 0);
      map.set(locId, (map.get(locId) || 0) + qty);
    }
  }
  return map;
}
