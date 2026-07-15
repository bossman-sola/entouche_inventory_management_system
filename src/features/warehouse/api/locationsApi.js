import apiClient from '../../../shared/api/axiosClient.js';

async function unwrap(promise) {
  try {
    const { data } = await promise;
    return data?.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Request failed';
    const wrapped = new Error(message);
    wrapped.status = err.response?.status;
    wrapped.errors = err.response?.data?.errors ?? null;
    throw wrapped;
  }
}

export const locationsApi = {
  // PUT /api/v1/locations/{id}  - body: { name, code, type, ... }
  update(id, payload) {
    return unwrap(apiClient.put(`/locations/${id}`, payload));
  },

  // DELETE /api/v1/locations/{id}
  remove(id) {
    return unwrap(apiClient.delete(`/locations/${id}`));
  },

  // POST /api/v1/locations/{id}/toggle-status - body: { status: 'active' | 'inactive' }
  toggleStatus(id, status) {
    return unwrap(apiClient.post(`/locations/${id}/toggle-status`, { status }));
  },
};