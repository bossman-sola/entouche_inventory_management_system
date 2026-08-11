import apiClient from "../../../shared/api/axiosClient.js";

/**
 * Normalize an axios error into the same shape the old fetch-based
 * apiRequest() threw, so existing callers (e.g. TransactionsPage's
 * `e.status === 422 && e.errors` check) keep working unchanged.
 * @param {import("axios").AxiosError} error
 * @returns {Error & { status?: number, errors?: object }}
 */
function toApiError(error) {
  const data = error?.response?.data;
  const message = data?.message || error.message || "Request failed";
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.errors = data?.errors;
  return apiError;
}

/**
 * Fetch every page of a paginated list endpoint and concatenate the
 * results. Same behavior as the old fetchAllPages() helper, but goes
 * through apiClient so the Authorization header and token refresh are
 * handled automatically instead of a token being threaded in manually.
 * @param {string} path - e.g. "/items"
 * @param {Object} [params] - extra query params merged into every page request
 * @param {Object} [options]
 * @param {number} [options.maxPages=10]
 * @returns {Promise<Array>}
 */
export async function fetchAllPages(path, params = {}, { maxPages = 10 } = {}) {
  let page = 1;
  let out = [];
  try {
    while (page <= maxPages) {
      const { data } = await apiClient.get(path, {
        params: { ...params, page },
      });
      const chunk = Array.isArray(data?.data) ? data.data : [];
      out = out.concat(chunk);
      const meta = data?.meta;
      if (!meta || meta.current_page >= meta.last_page) break;
      page += 1;
    }
    return out;
  } catch (error) {
    throw toApiError(error);
  }
}

/** GET /items - full paginated catalog list. */
export async function listAllItems() {
  return fetchAllPages("/items");
}

/** GET /suppliers - full paginated list. */
export async function listAllSuppliers() {
  return fetchAllPages("/suppliers");
}

/** GET /units - full paginated list. */
export async function listAllUnits() {
  return fetchAllPages("/units");
}

/** GET /warehouses - full paginated list. */
export async function listAllWarehouses() {
  return fetchAllPages("/warehouses");
}

/**
 * GET /transactions - the global, read-only ledger endpoint.
 * Filterable server-side by item_id, warehouse_id, transaction_type,
 * direction, date_from, date_to (not wired here - TransactionsPage
 * still filters client-side after fetching everything).
 * @param {number} [maxPages=50]
 * @returns {Promise<Array>}
 */
export async function listAllTransactions(maxPages = 50) {
  return fetchAllPages("/transactions", {}, { maxPages });
}

/**
 * GET /warehouses/{warehouseId}/locations
 * @param {number|string} warehouseId
 * @returns {Promise<Array>}
 */
export async function getWarehouseLocations(warehouseId) {
  try {
    const { data } = await apiClient.get(
      `/warehouses/${warehouseId}/locations`,
    );
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /receipts */
export async function createReceipt(body) {
  try {
    const { data } = await apiClient.post("/receipts", body);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /transfers */
export async function createTransfer(body) {
  try {
    const { data } = await apiClient.post("/transfers", body);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /adjustments */
export async function createAdjustment(body) {
  try {
    const { data } = await apiClient.post("/adjustments", body);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/** POST /stock-counts */
export async function createStockCount(body) {
  try {
    const { data } = await apiClient.post("/stock-counts", body);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Dispatches to the right creation endpoint for a transaction's apiType,
 * so callers (the New Transaction modal flow) don't need their own
 * endpoint-map/switch - that logic now lives in one place.
 * @param {"receipt"|"transfer"|"adjustment"|"stock_count"} apiType
 * @param {Object} body
 */
export async function createTransactionByType(apiType, body) {
  switch (apiType) {
    case "receipt":
      return createReceipt(body);
    case "transfer":
      return createTransfer(body);
    case "adjustment":
      return createAdjustment(body);
    case "stock_count":
      return createStockCount(body);
    default:
      throw new Error(`Unsupported transaction type: ${apiType}`);
  }
}

export async function listAllReceipts() {
  return fetchAllPages("/receipts");
}
export async function listAllTransfers() {
  return fetchAllPages("/transfers");
}
export async function listAllAdjustments() {
  return fetchAllPages("/adjustments");
}
export async function listAllStockCounts() {
  return fetchAllPages("/stock-counts");
}
