import apiClient from "../../../shared/api/axiosClient.js"

export async function listUsers(params = {}) {
  const { data } = await apiClient.get("/users", { params })
  return data
}

export async function createUser(payload) {
  const { data } = await apiClient.post("/users", payload)
  return data.data
}

export async function getUser(id) {
  const { data } = await apiClient.get(`/users/${id}`)
  return data.data
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.put(`/users/${id}`, payload)
  return data.data
}

export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/users/${id}`)
  return data
}

export async function toggleUserStatus(id, status) {
  const { data } = await apiClient.post(`/users/${id}/toggle-status`, { status })
  return data.data
}

export async function assignRole(id, role) {
  const { data } = await apiClient.post(`/users/${id}/assign-role`, { role })
  return data.data
}

export async function removeRole(id, role) {
  const { data } = await apiClient.post(`/users/${id}/remove-role`, { role })
  return data.data
}