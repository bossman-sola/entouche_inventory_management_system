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
    throw new ApiError('Network error - could not reach the API. Please check your connection.', 0, null);
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


export const listWarehouses = (params) => request('/warehouses', { params });
export const getWarehouse = (id) => request(`/warehouses/${id}`);
export const createWarehouse = (payload) => request('/warehouses', { method: 'POST', body: payload });
export const updateWarehouse = (id, payload) => request(`/warehouses/${id}`, { method: 'PUT', body: payload });
export const deleteWarehouse = (id) => request(`/warehouses/${id}`, { method: 'DELETE' });
export const getWarehouseStockSummary = (id) => request(`/warehouses/${id}/stock-summary`);


export const listWarehouseLocations = (warehouseId) => request(`/warehouses/${warehouseId}/locations`);
export const createWarehouseLocation = (warehouseId, payload) =>
  request(`/warehouses/${warehouseId}/locations`, { method: 'POST', body: payload });
export const updateLocation = (id, payload) => request(`/locations/${id}`, { method: 'PUT', body: payload });
export const deleteLocation = (id) => request(`/locations/${id}`, { method: 'DELETE' });


export const listReceipts = (params) => request('/receipts', { params });
export const getReceipt = (id) => request(`/receipts/${id}`);
export const createReceipt = (payload) => request('/receipts', { method: 'POST', body: payload });
export const updateReceipt = (id, payload) => request(`/receipts/${id}`, { method: 'PUT', body: payload });
export const deleteReceipt = (id) => request(`/receipts/${id}`, { method: 'DELETE' });
export const receiveReceipt = (id) => request(`/receipts/${id}/receive`, { method: 'POST' });
export const cancelReceipt = (id) => request(`/receipts/${id}/cancel`, { method: 'POST' });


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
    unit: item.unit?.abbreviation ? `${item.unit.name} (${item.unit.abbreviation})` : (item.unit?.name || '-'),
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

export function mapApiWarehouse(w) {
  if (!w) return null;
  return { id: w.id, name: w.name, code: w.code, city: w.city, state: w.state, status: w.status };
}

export function mapApiLocation(l) {
  if (!l) return null;
  return { id: l.id, name: l.name, code: l.code, type: l.type, status: l.status };
}


const PO_PREFIX = /^PO:\s*(.*)\n?/;

export function packReceiptNotes(poNumber, notes) {
  const cleanNotes = (notes || '').trim();
  if (!poNumber) return cleanNotes;
  return `PO: ${poNumber}${cleanNotes ? '\n' + cleanNotes : ''}`;
}

export function unpackReceiptNotes(rawNotes) {
  const raw = rawNotes || '';
  const m = PO_PREFIX.exec(raw);
  if (!m) return { poNumber: '', notes: raw };
  return { poNumber: m[1].trim(), notes: raw.slice(m[0].length) };
}

function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h}:${mm} ${ampm}`;
}

export const RECEIPT_STATUS_LABEL = { draft: 'Draft', received: 'Received', cancelled: 'Cancelled' };

export function mapApiReceiptItem(it) {
  if (!it) return null;
  const item = it.item || {};
  return {
    id: it.item_id ?? item.id,
    lineId: it.id,
    name: item.name || it.item_name || 'Unknown item',
    sku: item.sku || '',
    cat: item.category?.name || 'Uncategorized',
    unit: item.unit?.abbreviation ? `${item.unit.name} (${item.unit.abbreviation})` : (item.unit?.name || '-'),
    qty: Number(it.quantity || 0),
    cost: Number(it.unit_cost || 0),
    warehouseLocationId: it.warehouse_location_id ?? null,
  };
}

export function mapApiReceipt(r) {
  if (!r) return null;
  const items = (r.items || []).map(mapApiReceiptItem);
  const qty = items.reduce((a, it) => a + Number(it.qty || 0), 0);
  const val = items.reduce((a, it) => a + Number(it.qty || 0) * Number(it.cost || 0), 0);
  const { poNumber, notes } = unpackReceiptNotes(r.notes);

  const timeline = [];
  if (r.status === 'cancelled') {
    timeline.push({ title: 'Receipt Cancelled', date: fmtDateTime(r.updated_at), status: 'done' });
  }
  if (r.received_at) {
    timeline.push({ title: 'Stock Received', date: fmtDateTime(r.received_at), by: r.receiver?.name, status: 'done' });
  }
  timeline.push({ title: 'Receipt Created', date: fmtDateTime(r.created_at), by: r.creator?.name, status: 'done' });
  if (r.status === 'draft') {
    timeline.unshift({ title: 'Awaiting Receiving', date: fmtDateTime(r.created_at), status: 'pending' });
  }

  return {
    id: r.id,
    no: r.receipt_number || (r.id ? `RCPT-${String(r.id).padStart(6, '0')}` : '-'),
    status: RECEIPT_STATUS_LABEL[r.status] || r.status || 'Draft',
    apiStatus: r.status,
    date: r.receipt_date || '',
    supplier: r.supplier?.name || '',
    supplierId: r.supplier_id ?? r.supplier?.id ?? null,
    by: r.creator?.name || '',
    receivedById: r.created_by ?? null,
    warehouse: r.warehouse?.name || '',
    warehouseId: r.warehouse_id ?? r.warehouse?.id ?? null,
    receivingLocation: r.receiving_location?.name || '',
    receivingLocationId: r.receiving_location_id ?? r.receiving_location?.id ?? null,
    storageLocation: r.receiving_location?.name || '',
    ref: poNumber || '-',
    poNumber,
    notes,
    qty,
    val: '₦' + Math.round(val).toLocaleString('en-NG'),
    deliveryNoteNo: r.receipt_number || '-',
    deliveryDate: r.receipt_date || '',
    discount: 0,
    otherCharges: 0,
    attachments: [],
    items,
    timeline,
    receivedAt: r.received_at || null,
    canEdit: r.status === 'draft',
    canDelete: r.status === 'draft',
    canReceive: r.status === 'draft',
    canCancel: r.status === 'draft',
  };
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
  listWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStockSummary,
  listWarehouseLocations,
  createWarehouseLocation,
  updateLocation,
  deleteLocation,
  listReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  receiveReceipt,
  cancelReceipt,
  fetchAllPages,
  requestRaw,
  mapApiItem,
  mapApiSupplier,
  mapApiUser,
  mapApiWarehouse,
  mapApiLocation,
  mapApiReceipt,
  mapApiReceiptItem,
  packReceiptNotes,
  unpackReceiptNotes,
  RECEIPT_STATUS_LABEL,
};