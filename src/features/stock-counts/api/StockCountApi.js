import apiClient from "../../../shared/api/axiosClient.js";

/**
 * ─────────────────────────────────────────────────────────────
 * DATA SHAPES (JSDoc typedefs — for editor intellisense only,
 * no build step required since this is plain JS)
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} StockCountItem
 * @property {number} id
 * @property {number} stock_count_id
 * @property {number} item_id
 * @property {number|null} warehouse_location_id
 * @property {string} system_quantity      - decimal string, e.g. "100.000"
 * @property {string} counted_quantity     - decimal string, e.g. "98.000"
 * @property {string} variance_quantity    - decimal string, counted - system
 * @property {0|1} adjustment_created      - 1 once approval posts the adjustment
 * @property {string|null} remarks
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object|null} [item]          - embedded item object (present on some responses)
 */

/**
 * @typedef {Object} StockCount
 * @property {number} id
 * @property {string} count_number         - e.g. "SC-000003"
 * @property {number} warehouse_id
 * @property {number|null} warehouse_location_id
 * @property {number} counted_by
 * @property {number|null} approved_by
 * @property {number} created_by
 * @property {string} count_date           - ISO 8601
 * @property {string|null} started_at
 * @property {string|null} completed_at
 * @property {string|null} approved_at
 * @property {"draft"|"in_progress"|"completed"|"approved"|"cancelled"} status
 * @property {string|null} notes
 * @property {string|null} rejection_reason
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} deleted_at
 * @property {StockCountItem[]} [items]
 * @property {Object|null} [warehouse]     - embedded warehouse object
 * @property {Object|null} [location]      - embedded warehouse location object
 */

/**
 * @typedef {Object} StockCountListMeta
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} per_page
 * @property {number} total
 */

/**
 * @typedef {Object} StockCountListResult
 * @property {StockCount[]} stockCounts
 * @property {StockCountListMeta|undefined} meta
 */

/**
 * @typedef {Object} CreateStockCountItemPayload
 * @property {number} item_id
 * @property {number} system_quantity
 * @property {number} counted_quantity
 */

/**
 * @typedef {Object} CreateStockCountPayload
 * @property {number} warehouse_id
 * @property {number|null} [warehouse_location_id]
 * @property {string} count_date                      - "YYYY-MM-DD"
 * @property {CreateStockCountItemPayload[]} items
 */

/**
 * @typedef {Object} UpdateStockCountPayload
 * @property {string|null} [notes]
 * @property {string} [count_date]                     - "YYYY-MM-DD"
 */

/**
 * ─────────────────────────────────────────────────────────────
 * API CALLS
 * ─────────────────────────────────────────────────────────────
 */

/**
 * List stock counts (paginated).
 * @param {Object} [params] - query params (e.g. page, status, warehouse_id)
 * @returns {Promise<StockCountListResult>}
 */
export const listStockCounts = async (params = {}) => {
  const { data } = await apiClient.get("/stock-counts", { params });
  return { stockCounts: data?.data || [], meta: data?.meta };
};

/**
 * Create a new stock count (status starts as "draft").
 * @param {CreateStockCountPayload} payload
 * @returns {Promise<StockCount>}
 */
export const createStockCount = async (payload) => {
  const { data } = await apiClient.post("/stock-counts", payload);
  return data?.data;
};

/**
 * Get a single stock count by id.
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const getStockCount = async (id) => {
  const { data } = await apiClient.get(`/stock-counts/${id}`);
  return data?.data;
};

/**
 * Update a stock count. Only allowed while status is "draft".
 * @param {number|string} id
 * @param {UpdateStockCountPayload} payload
 * @returns {Promise<StockCount>}
 */
export const updateStockCount = async (id, payload) => {
  const { data } = await apiClient.put(`/stock-counts/${id}`, payload);
  return data?.data;
};

/**
 * Delete a stock count. Only allowed while status is "draft".
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export const deleteStockCount = async (id) => {
  await apiClient.delete(`/stock-counts/${id}`);
};

/**
 * Start a stock count: draft -> in_progress.
 * Snapshots system_quantity on each item at this point.
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const startStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/start`);
  return data?.data;
};

/**
 * Complete a stock count: in_progress -> completed.
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const completeStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/complete`);
  return data?.data;
};

/**
 * Approve a stock count: completed -> approved.
 * Posts inventory adjustments for variance items (adjustment_created -> 1).
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const approveStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/approve`);
  return data?.data;
};

/**
 * Cancel a stock count. Can be called from any status.
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const cancelStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/cancel`);
  return data?.data;
};