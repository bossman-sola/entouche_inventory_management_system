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

async function request(path, { method = 'GET', body, params, isForm = false, raw = false } = {}) {
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
  
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json?.errors);
  }

  if (raw) return json;
  return json ? json.data : null;
}


export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const logout = () => request('/auth/logout', { method: 'POST' });

export const refreshToken = () => request('/auth/refresh', { method: 'POST' });

export const getCurrentUser = () => request('/auth/me');


export const listCategories = () => request('/categories');
export const createCategory = (payload) => request('/categories', { method: 'POST', body: payload });
export const getCategory = (id) => request(`/categories/${id}`);
export const updateCategory = (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: payload });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });


export const listItems = (params) => request('/items', { params });
export const getItem = (id) => request(`/items/${id}`);
export const createItem = (payload) => request('/items', { method: 'POST', body: payload });
export const updateItem = (id, payload) => request(`/items/${id}`, { method: 'PUT', body: payload });
export const deleteItem = (id) => request(`/items/${id}`, { method: 'DELETE' });
export const getItemStockBalance = (id) => request(`/items/${id}/stock-balance`);

export const listSuppliers = () => request('/suppliers');
export const createSupplier = (payload) => request('/suppliers', { method: 'POST', body: payload });
export const getSupplier = (id) => request(`/suppliers/${id}`);
export const updateSupplier = (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload });


export const listUnits = () => request('/units');
export const createUnit = (payload) => request('/units', { method: 'POST', body: payload });


export const listUsers = () => request('/users');
export const getUser = (id) => request(`/users/${id}`);

export async function fetchAllPages(path, params = {}) {
  let page = 1;
  let lastPage = 1;
  const all = [];
  do {
    const json = await request(path, { params: { ...params, page }, raw: true });
    all.push(...(json?.data || []));
    lastPage = json?.meta?.last_page || 1;
    page += 1;
  } while (page <= lastPage);
  return all;
}

export const requestRaw = (path, opts) => request(path, { ...opts, raw: true });


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
  fetchAllPages,
  requestRaw,
  mapApiItem,
  mapApiSupplier,
  mapApiUser,
};