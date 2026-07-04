/**
 * Entouche API client
 * ---------------------------------------------------------------------------
 * Thin wrapper around fetch() for the endpoints documented in
 * `api-tested-endpoints.md`. Every function returns the *unwrapped*
 * `data` payload from the API's `{ success, message, data, errors }`
 * envelope, and throws an Error (with `.status` and `.errors` attached)
 * when `success` is false or the HTTP call fails.
 *
 * Auth: the API uses a Bearer JWT. We keep it in localStorage under
 * ACCESS_TOKEN_KEY. Wire this up to your real login screen — call
 * `setAccessToken(token)` after a successful `login()`.
 */

const BASE_URL = 'https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1';
const ACCESS_TOKEN_KEY = 'entouche_access_token';

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore (SSR / private mode) */
  }
}

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || null;
  }
}

async function request(path, { method = 'GET', body, params, isForm = false } = {}) {
  let url = `${BASE_URL}${path}`;

  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const qsString = qs.toString();
    if (qsString) url += `?${qsString}`;
  }

  const headers = { Accept: 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new ApiError('Network error — could not reach the API. Please check your connection.', 0, null);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json?.errors);
  }

  return json ? json.data : null;
}

/* ───────────────────────── Authentication ───────────────────────── */

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const logout = () => request('/auth/logout', { method: 'POST' });

export const refreshToken = () => request('/auth/refresh', { method: 'POST' });

export const getCurrentUser = () => request('/auth/me');

/* ───────────────────────── Categories ───────────────────────── */

export const listCategories = () => request('/categories');
export const createCategory = (payload) => request('/categories', { method: 'POST', body: payload });
export const getCategory = (id) => request(`/categories/${id}`);
export const updateCategory = (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: payload });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });

/* ───────────────────────── Items ───────────────────────── */

export const listItems = (params) => request('/items', { params });
export const getItem = (id) => request(`/items/${id}`);
export const createItem = (payload) => request('/items', { method: 'POST', body: payload });
export const updateItem = (id, payload) => request(`/items/${id}`, { method: 'PUT', body: payload });
export const deleteItem = (id) => request(`/items/${id}`, { method: 'DELETE' });
export const getItemStockBalance = (id) => request(`/items/${id}/stock-balance`);

/* ───────────────────────── Suppliers ───────────────────────── */

export const listSuppliers = () => request('/suppliers');
export const createSupplier = (payload) => request('/suppliers', { method: 'POST', body: payload });
export const getSupplier = (id) => request(`/suppliers/${id}`);
export const updateSupplier = (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload });

/* ───────────────────────── Units of Measure ───────────────────────── */

export const listUnits = () => request('/units');
export const createUnit = (payload) => request('/units', { method: 'POST', body: payload });

/* ───────────────────────── Users ───────────────────────── */

export const listUsers = () => request('/users');
export const getUser = (id) => request(`/users/${id}`);

/* ───────────────────────── Mapping helpers ───────────────────────── */

/**
 * The Items API returns category/unit/supplier as nested objects with
 * different field names than the receipt UI historically used (which came
 * from static mock data). This normalizes an API item into the shape the
 * Receipts components expect: { id, name, sku, cat, unit, cost, ... }
 */
export function mapApiItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    barcode: item.barcode || '',
    cat: item.category?.name || 'Uncategorized',
    categoryId: item.category_id ?? item.category?.id ?? null,
    unit: item.unit?.abbreviation ? `${item.unit.name} (${item.unit.abbreviation})` : (item.unit?.name || '—'),
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
  return { id: s.id, name: s.name, code: s.code, email: s.email, phone: s.phone, address: s.address, status: s.status };
}

export function mapApiUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, status: u.status };
}

export { ApiError };

export default {
  getAccessToken,
  setAccessToken,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  listCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemStockBalance,
  listSuppliers,
  createSupplier,
  getSupplier,
  updateSupplier,
  listUnits,
  createUnit,
  listUsers,
  getUser,
  mapApiItem,
  mapApiSupplier,
  mapApiUser,
};