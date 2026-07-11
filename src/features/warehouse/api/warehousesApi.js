
import apiClient from '../../../shared/api/axiosClient.js';

async function unwrap(promise) {
  try {
    const { data } = await promise;
    return data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Request failed';
    const wrapped = new Error(message);
    wrapped.status = err.response?.status;
    wrapped.errors = err.response?.data?.errors ?? null;
    throw wrapped;
  }
}

export const warehousesApi = {
  // GET /api/v1/warehouses — paginated, returns { data, meta, links }
  list(params = {}) {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    );
    return unwrap(apiClient.get('/warehouses', { params: cleaned }));
  },

  // Walks every page so callers get every warehouse, not just page 1.
  async listAll() {
    let page = 1;
    let all = [];
    while (page <= 50) { // hard stop so a bad response can't loop forever
      const json = await this.list({ per_page: 100, page });
      all = all.concat(json.data || []);
      const meta = json.meta;
      if (!meta || page >= meta.last_page) break;
      page += 1;
    }
    return all;
  },

  async get(id) {
    const json = await unwrap(apiClient.get(`/warehouses/${id}`));
    return json.data;
  },

  async create(payload) {
    const json = await unwrap(apiClient.post('/warehouses', payload));
    return json.data;
  },

  async update(id, payload) {
    const json = await unwrap(apiClient.put(`/warehouses/${id}`, payload));
    return json.data;
  },

  remove(id) {
    return unwrap(apiClient.delete(`/warehouses/${id}`));
  },

  async toggleStatus(id, status) {
    const json = await unwrap(apiClient.post(`/warehouses/${id}/toggle-status`, { status }));
    return json.data;
  },

  // GET /api/v1/warehouses/{warehouse_id}/locations
  async listLocations(warehouseId) {
    const json = await unwrap(apiClient.get(`/warehouses/${warehouseId}/locations`));
    return json.data ?? [];
  },

  // POST /api/v1/warehouses/{warehouse_id}/locations
  async createLocation(warehouseId, payload) {
  const json = await unwrap(
    apiClient.post(`/warehouses/${warehouseId}/locations`, {
      ...payload,
      warehouse_id: warehouseId,
    })
  );
  return json.data;
},

  // GET /api/v1/warehouses/{warehouse_id}/stock-summary
  async stockSummary(warehouseId) {
    const json = await unwrap(apiClient.get(`/warehouses/${warehouseId}/stock-summary`));
    return json.data;
  },
};