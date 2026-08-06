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
 * @typedef {Object} CreateStockCountPayload
 * @property {number} warehouse_id
 * @property {number|null} [warehouse_location_id]
 * @property {"Cycle Count"|"Spot Check"|"Full Physical"|"Recount"} [count_type]
 * @property {"low"|"medium"|"high"} [priority]
 * @property {string} [count_date]                     - "YYYY-MM-DD", defaults to today server-side
 * @property {string} [start_time]                     - "HH:mm"
 * @property {number} [assigned_to]                     - user id; defaults to current user
 * @property {string} [notes]
 * @property {Array<{item_id: number, warehouse_location_id?: number|null}>} [items]
 *
 *
 */
/**
 * @typedef {Object} UpdateStockCountPayload
 * @property {string|null} [notes]
 * @property {string} [count_date]                     - "YYYY-MM-DD"
 */
/**
 * @typedef {Object} UpdateStockCountPayload
 * @property {number} [warehouse_id]
 * @property {number|null} [warehouse_location_id]
 * @property {"Cycle Count"|"Spot Check"|"Full Physical"|"Recount"} [count_type]
 * @property {"low"|"medium"|"high"} [priority]
 * @property {string} [count_date]                     - "YYYY-MM-DD"
 * @property {string} [start_time]                     - "HH:mm"
 * @property {number} [assigned_to]                     - reassigns the counter (server maps this to counted_by)
 * @property {string|null} [notes]

/**
 * @typedef {Object} AddStockCountItemPayload
 * @property {number} item_id
 * @property {number|null} [warehouse_location_id]
 *
 * NOTE: no quantity here — quantity is recorded afterward, per item,
 * via updateStockCountItem().
 */

/**
 * @typedef {Object} UpdateStockCountItemPayload
 * @property {number} counted_quantity
 * @property {string} [reason]                          - optional, explains a variance/edit
 */

/**
 * ─────────────────────────────────────────────────────────────
 * API CALLS — these paths/verbs are taken directly from
 * routes/api.php, not guessed from REST convention.
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
 * Server-computed overview stats (GET /stock-counts/overview).
 * Prefer this over deriving numbers client-side from a page of results.
 * @returns {Promise<Object>}
 */
export const getStockCountOverview = async () => {
  const { data } = await apiClient.get("/stock-counts/overview");
  return data?.data;
};

/**
 * Lookup lists for filters/forms — warehouses, locations, users, etc.
 * (GET /stock-counts/lookups).
 * @returns {Promise<Object>}
 */
export const getStockCountLookups = async () => {
  const { data } = await apiClient.get("/stock-counts/lookups");
  return data?.data;
};

/**
 * Calendar view of stock counts for a given month.
 * (GET /stock-counts/calendar). Both params are required by the backend.
 * @param {number} month - 1-12
 * @param {number} year  - e.g. 2026
 * @returns {Promise<Object>}
 */
export const getStockCountCalendar = async (month, year) => {
  const { data } = await apiClient.get("/stock-counts/calendar", {
    params: { month, year },
  });
  return data?.data;
};

/**
 * Search items to add to a stock count (GET /stock-counts/items/search).
 * @param {Object} [params] - e.g. { search, warehouse_id }
 * @returns {Promise<Array>}
 */
export const searchStockCountItems = async (params = {}) => {
  const { data } = await apiClient.get("/stock-counts/items/search", {
    params,
  });
  return data?.data || [];
};

/**
 * Export stock counts. Backend only supports xlsx/csv (no pdf), and
 * takes an `ids` array rather than a page/scope description.
 * @param {Object} [options]
 * @param {"xlsx"|"csv"} [options.format]
 * @param {Array<number|string>} [options.ids]
 * @returns {Promise<Blob>}
 */
export const exportStockCounts = async (options = {}) => {
  const params = { format: options.format || "xlsx" };
  if (options.ids && options.ids.length) params.ids = options.ids;
  const { data } = await apiClient.get("/stock-counts/export", {
    params,
    responseType: "blob",
  });
  return data;
};

/**
 * Create a new stock count (status starts as "draft"). Items are added
 * afterward via addStockCountItem().
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
 * Add an item to a stock count (no quantity yet — that's set per item via
 * updateStockCountItem()).
 * @param {number|string} stockCountId
 * @param {AddStockCountItemPayload} payload
 * @returns {Promise<StockCount>}
 */
export const addStockCountItem = async (stockCountId, payload) => {
  const { data } = await apiClient.post(
    `/stock-counts/${stockCountId}/items`,
    payload,
  );
  return data?.data;
};

/**
 * Record/update the counted quantity for a single line item.
 * @param {number|string} stockCountId
 * @param {number|string} itemId - the stock count item's id (not the catalog item_id)
 * @param {UpdateStockCountItemPayload} payload
 * @returns {Promise<StockCountItem>}
 */
export const updateStockCountItem = async (stockCountId, itemId, payload) => {
  const { data } = await apiClient.patch(
    `/stock-counts/${stockCountId}/items/${itemId}`,
    payload,
  );
  return data?.data;
};

/**
 * Remove a line item from a stock count.
 * @param {number|string} stockCountId
 * @param {number|string} itemId
 * @returns {Promise<void>}
 */
export const removeStockCountItem = async (stockCountId, itemId) => {
  await apiClient.delete(`/stock-counts/${stockCountId}/items/${itemId}`);
};

/**
 * Counting progress for a stock count (e.g. counted vs total items).
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getStockCountProgress = async (id) => {
  const { data } = await apiClient.get(`/stock-counts/${id}/progress`);
  return data?.data;
};

/**
 * Variance breakdown for a stock count.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getStockCountVariance = async (id) => {
  const { data } = await apiClient.get(`/stock-counts/${id}/variance`);
  return data?.data;
};

/**
 * Submit a stock count for approval (draft/in-progress -> completed,
 * per the real controller — there is no separate /start or /complete step).
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const submitStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/submit`);
  return data?.data;
};

/**
 * Approve a submitted stock count. Posts inventory adjustments for
 * variance items (adjustment_created -> 1).
 * @param {number|string} id
 * @returns {Promise<StockCount>}
 */
export const approveStockCount = async (id) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/approve`);
  return data?.data;
};

/**
 * Reject a submitted stock count. The backend expects a reason.
 * @param {number|string} id
 * @param {string} reason
 * @returns {Promise<StockCount>}
 */
export const rejectStockCount = async (id, reason) => {
  const { data } = await apiClient.post(`/stock-counts/${id}/reject`, {
    reason,
  });
  return data?.data;
};

/**
 * Ask for a recount instead of approving/rejecting outright.
 * @param {number|string} id
 * @param {string} [reason]
 * @returns {Promise<StockCount>}
 */
export const requestStockCountRecount = async (id, reason) => {
  const { data } = await apiClient.post(
    `/stock-counts/${id}/request-recount`,
    reason ? { reason } : undefined,
  );
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
