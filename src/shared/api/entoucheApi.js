import apiClient from "./axiosClient";

async function unwrap(promise) {
  try {
    const { data: json } = await promise;
    if (json && json.success === false) {
      const err = new Error(json.message || "Request failed");
      err.errors = json.errors;
      throw err;
    }
    return json ? json.data : null;
  } catch (e) {
    if (e.response) {
      const json = e.response.data;
      const err = new Error(json?.message || `Request failed (${e.response.status})`);
      err.status = e.response.status;
      err.errors = json?.errors;
      throw err;
    }
    throw e;
  }
}

export const api = {
  // ─── Authentication ───
  login: (email, password) => unwrap(apiClient.post("/auth/login", { email, password })),
  logout: () => unwrap(apiClient.post("/auth/logout")),
  refresh: () => unwrap(apiClient.post("/auth/refresh")),
  me: () => unwrap(apiClient.get("/auth/me")),

  // ─── Categories ───
  listCategories: (params) => unwrap(apiClient.get("/categories", { params })),
  createCategory: (body) => unwrap(apiClient.post("/categories", body)),
  getCategory: (id) => unwrap(apiClient.get(`/categories/${id}`)),
  updateCategory: (id, body) => unwrap(apiClient.put(`/categories/${id}`, body)),
  deleteCategory: (id) => unwrap(apiClient.delete(`/categories/${id}`)),
  toggleCategoryStatus: (id, status) =>
    unwrap(apiClient.post(`/categories/${id}/toggle-status`, { status })),

  // ─── Items ───
  listItems: (params) => unwrap(apiClient.get("/items", { params })),
  createItem: (body) => unwrap(apiClient.post("/items", body)),
  getItem: (id) => unwrap(apiClient.get(`/items/${id}`)),
  updateItem: (id, body) => unwrap(apiClient.put(`/items/${id}`, body)),
  deleteItem: (id) => unwrap(apiClient.delete(`/items/${id}`)),
  toggleItemStatus: (id, status) =>
    unwrap(apiClient.post(`/items/${id}/toggle-status`, { status })),
  getItemStockBalance: (id) => unwrap(apiClient.get(`/items/${id}/stock-balance`)),
  getItemTransactions: (id, params) => unwrap(apiClient.get(`/items/${id}/transactions`, { params })),
  uploadItemImage: (id, file) => {
    const form = new FormData();
    form.append("image", file);
    return unwrap(apiClient.post(`/items/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },
  removeItemImage: (id) => unwrap(apiClient.delete(`/items/${id}/image`)),

  // ─── Roles & Permissions ───
  listRoles: () => unwrap(apiClient.get("/roles")),
  getRole: (id) => unwrap(apiClient.get(`/roles/${id}`)),
  listPermissions: () => unwrap(apiClient.get("/permissions")),

  // ─── Suppliers ───
  listSuppliers: (params) => unwrap(apiClient.get("/suppliers", { params })),
  createSupplier: (body) => unwrap(apiClient.post("/suppliers", body)),
  getSupplier: (id) => unwrap(apiClient.get(`/suppliers/${id}`)),
  updateSupplier: (id, body) => unwrap(apiClient.put(`/suppliers/${id}`, body)),
  deleteSupplier: (id) => unwrap(apiClient.delete(`/suppliers/${id}`)),
  toggleSupplierStatus: (id, status) =>
    unwrap(apiClient.post(`/suppliers/${id}/toggle-status`, { status })),

  // ─── Units of Measure ───
  listUnits: (params) => unwrap(apiClient.get("/units", { params })),
  createUnit: (body) => unwrap(apiClient.post("/units", body)),
  getUnit: (id) => unwrap(apiClient.get(`/units/${id}`)),
  updateUnit: (id, body) => unwrap(apiClient.put(`/units/${id}`, body)),
  deleteUnit: (id) => unwrap(apiClient.delete(`/units/${id}`)),
  toggleUnitStatus: (id, status) =>
    unwrap(apiClient.post(`/units/${id}/toggle-status`, { status })),

  // ─── Users ───
  listUsers: (params) => unwrap(apiClient.get("/users", { params })),
  createUser: (body) => unwrap(apiClient.post("/users", body)),
  getUser: (id) => unwrap(apiClient.get(`/users/${id}`)),
  updateUser: (id, body) => unwrap(apiClient.put(`/users/${id}`, body)),
  deleteUser: (id) => unwrap(apiClient.delete(`/users/${id}`)),
  toggleUserStatus: (id, status) =>
    unwrap(apiClient.post(`/users/${id}/toggle-status`, { status })),
  assignRole: (id, role) =>
    unwrap(apiClient.post(`/users/${id}/assign-role`, { roles: [role] })),
  removeRole: (id, role) =>
    unwrap(apiClient.post(`/users/${id}/remove-role`, { role })),

  // ─── Warehouses ───
  listWarehouses: (params) => unwrap(apiClient.get("/warehouses", { params })),
  createWarehouse: (body) => unwrap(apiClient.post("/warehouses", body)),
  getWarehouse: (id) => unwrap(apiClient.get(`/warehouses/${id}`)),
  updateWarehouse: (id, body) => unwrap(apiClient.put(`/warehouses/${id}`, body)),
  deleteWarehouse: (id) => unwrap(apiClient.delete(`/warehouses/${id}`)),
  toggleWarehouseStatus: (id, status) =>
    unwrap(apiClient.post(`/warehouses/${id}/toggle-status`, { status })),
  listWarehouseLocations: (warehouseId) => unwrap(apiClient.get(`/warehouses/${warehouseId}/locations`)),
  createWarehouseLocation: (warehouseId, body) =>
    unwrap(apiClient.post(`/warehouses/${warehouseId}/locations`, body)),
  getWarehouseStockSummary: (warehouseId) =>
    unwrap(apiClient.get(`/warehouses/${warehouseId}/stock-summary`)),

  // ─── Locations ───
  updateLocation: (id, body) => unwrap(apiClient.put(`/locations/${id}`, body)),
  deleteLocation: (id) => unwrap(apiClient.delete(`/locations/${id}`)),
  toggleLocationStatus: (id, status) =>
    unwrap(apiClient.post(`/locations/${id}/toggle-status`, { status })),

  // ─── Receipts ───
  listReceipts: (params) => unwrap(apiClient.get("/receipts", { params })),
  createReceipt: (body) => unwrap(apiClient.post("/receipts", body)),
  getReceipt: (id) => unwrap(apiClient.get(`/receipts/${id}`)),
  updateReceipt: (id, body) => unwrap(apiClient.put(`/receipts/${id}`, body)),
  deleteReceipt: (id) => unwrap(apiClient.delete(`/receipts/${id}`)),
  receiveReceipt: (id) => unwrap(apiClient.post(`/receipts/${id}/receive`)), // ★ moves stock
  approveReceipt: (id) => unwrap(apiClient.post(`/receipts/${id}/approve`)), // ★ alias for receive
  cancelReceipt: (id) => unwrap(apiClient.post(`/receipts/${id}/cancel`)),

  // ─── Transfers ───
  listTransfers: (params) => unwrap(apiClient.get("/transfers", { params })),
  createTransfer: (body) => unwrap(apiClient.post("/transfers", body)),
  getTransfer: (id) => unwrap(apiClient.get(`/transfers/${id}`)),
  updateTransfer: (id, body) => unwrap(apiClient.put(`/transfers/${id}`, body)), // draft only
  deleteTransfer: (id) => unwrap(apiClient.delete(`/transfers/${id}`)), // draft only
  submitTransfer: (id) => unwrap(apiClient.post(`/transfers/${id}/submit`)),
  approveTransfer: (id) => unwrap(apiClient.post(`/transfers/${id}/approve`)),
  rejectTransfer: (id, reason) => unwrap(apiClient.post(`/transfers/${id}/reject`, { reason })),
  completeTransfer: (id) => unwrap(apiClient.post(`/transfers/${id}/complete`)), // ★ moves stock
  cancelTransfer: (id) => unwrap(apiClient.post(`/transfers/${id}/cancel`)),

  // ─── Adjustments ───
  listAdjustments: (params) => unwrap(apiClient.get("/adjustments", { params })),
  createAdjustment: (body) => unwrap(apiClient.post("/adjustments", body)),
  getAdjustment: (id) => unwrap(apiClient.get(`/adjustments/${id}`)),
  updateAdjustment: (id, body) => unwrap(apiClient.put(`/adjustments/${id}`, body)), // draft only
  deleteAdjustment: (id) => unwrap(apiClient.delete(`/adjustments/${id}`)), // draft only
  submitAdjustment: (id) => unwrap(apiClient.post(`/adjustments/${id}/submit`)),
  approveAdjustment: (id) => unwrap(apiClient.post(`/adjustments/${id}/approve`)), // ★ moves stock
  rejectAdjustment: (id, reason) => unwrap(apiClient.post(`/adjustments/${id}/reject`, { reason })),
  cancelAdjustment: (id) => unwrap(apiClient.post(`/adjustments/${id}/cancel`)),

  // ─── Stock Counts ───
  listStockCounts: (params) => unwrap(apiClient.get("/stock-counts", { params })),
  createStockCount: (body) => unwrap(apiClient.post("/stock-counts", body)),
  getStockCount: (id) => unwrap(apiClient.get(`/stock-counts/${id}`)),
  updateStockCount: (id, body) => unwrap(apiClient.put(`/stock-counts/${id}`, body)), // draft only
  deleteStockCount: (id) => unwrap(apiClient.delete(`/stock-counts/${id}`)), // draft only
  startStockCount: (id) => unwrap(apiClient.post(`/stock-counts/${id}/start`)),
  completeStockCount: (id) => unwrap(apiClient.post(`/stock-counts/${id}/complete`)),
  approveStockCount: (id) => unwrap(apiClient.post(`/stock-counts/${id}/approve`)), // ★ moves stock
  cancelStockCount: (id) => unwrap(apiClient.post(`/stock-counts/${id}/cancel`)),

  // ─── Transactions (read-only ledger) ───
  listTransactions: (params) => unwrap(apiClient.get("/transactions", { params })),
  getTransaction: (id) => unwrap(apiClient.get(`/transactions/${id}`)),

  // ─── Reports ───
  getDashboardStats: () => unwrap(apiClient.get("/reports/dashboard-stats")),
  getStockSummaryReport: (params) => unwrap(apiClient.get("/reports/stock-summary", { params })),
  getMovementReport: (params) => unwrap(apiClient.get("/reports/movement-report", { params })),
  getLowStockReport: () => unwrap(apiClient.get("/reports/low-stock")),

  // ─── Imports ───
  listImports: (params) => unwrap(apiClient.get("/imports", { params })),
  uploadImport: (file, importType) => {
    const form = new FormData();
    form.append("file", file);
    form.append("import_type", importType); // items | inventory | users | categories | suppliers
    return unwrap(apiClient.post("/imports", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },
  getImport: (id) => unwrap(apiClient.get(`/imports/${id}`)),
  downloadImportTemplate: (type) =>
    apiClient.get(`/imports/templates/${type}`, { responseType: "blob" }).then((res) => res.data),

  // ─── Audit Logs ───
  listAuditLogs: (params) => unwrap(apiClient.get("/audit-logs", { params })),
  getAuditLog: (id) => unwrap(apiClient.get(`/audit-logs/${id}`)),

  // ─── Settings ───
  listSettings: () => unwrap(apiClient.get("/settings")),
  bulkUpdateSettings: (settings) => unwrap(apiClient.put("/settings", { settings })),
  getSetting: (key) => unwrap(apiClient.get(`/settings/${key}`)),
};