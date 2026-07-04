// Thin wrapper around the shared axios client.
// Lives in shared/api/ right next to axiosClient.js.
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
      // axios error — surface the API's message if present
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
  // Auth
  me: () => unwrap(apiClient.get("/auth/me")),

  // Items
  listItems: () => unwrap(apiClient.get("/items")),
  getItemStockBalance: (id) => unwrap(apiClient.get(`/items/${id}/stock-balance`)),
  getItemTransactions: (id) => unwrap(apiClient.get(`/items/${id}/transactions`)),

  // Categories
  listCategories: () => unwrap(apiClient.get("/categories")),

  // Suppliers
  listSuppliers: () => unwrap(apiClient.get("/suppliers")),

  // Users
  listUsers: () => unwrap(apiClient.get("/users")),
  createUser: (body) => unwrap(apiClient.post("/users", body)),
  updateUser: (id, body) => unwrap(apiClient.put(`/users/${id}`, body)),
  deleteUser: (id) => unwrap(apiClient.delete(`/users/${id}`)),
  toggleUserStatus: (id, status) =>
    unwrap(apiClient.post(`/users/${id}/toggle-status`, { status })),
  assignRole: (id, role) =>
    unwrap(apiClient.post(`/users/${id}/assign-role`, { roles: [role] })),
  removeRole: (id, role) =>
    unwrap(apiClient.post(`/users/${id}/remove-role`, { role })),

  // Roles & Permissions
  listRoles: () => unwrap(apiClient.get("/roles")),
  listPermissions: () => unwrap(apiClient.get("/permissions")),
};