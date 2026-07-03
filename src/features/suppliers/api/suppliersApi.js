import apiClient from "../../../shared/api/axiosClient.js"

export async function listSuppliers(params = {}) {
  const { data } = await apiClient.get("/suppliers", { params })
  return data
}

export async function createSupplier(payload) {
  const { data } = await apiClient.post("/suppliers", payload)
  return data.data
}

export async function getSupplier(id) {
  const { data } = await apiClient.get(`/suppliers/${id}`)
  return data.data
}

export async function updateSupplier(id, payload) {
  const { data } = await apiClient.put(`/suppliers/${id}`, payload)
  return data.data
}

export async function deleteSupplier(id) {
  const { data } = await apiClient.delete(`/suppliers/${id}`)
  return data
}

export async function toggleSupplierStatus(id, status) {
  const { data } = await apiClient.post(`/suppliers/${id}/toggle-status`, { status })
  return data.data
}