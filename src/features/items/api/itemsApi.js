import apiClient, { BASE_URL } from "../../../shared/api/axiosClient.js"

export async function listItems(params = {}) {
  const { data } = await apiClient.get("/items", { params })
  return data // { success, message, data: [...], meta, links }
}

export async function createItem(payload) {
  const { data } = await apiClient.post("/items", payload)
  return data.data
}

export async function getItem(id) {
  const { data } = await apiClient.get(`/items/${id}`)
  return data.data
}

export async function updateItem(id, payload) {
  const { data } = await apiClient.put(`/items/${id}`, payload)
  return data.data
}

export async function deleteItem(id) {
  const { data } = await apiClient.delete(`/items/${id}`)
  return data
}

// No request body — the API flips active/inactive on its own
export async function toggleItemStatus(id) {
  const { data } = await apiClient.post(`/items/${id}/toggle-status`)
  return data.data
}

export async function getItemStockBalance(id) {
  const { data } = await apiClient.get(`/items/${id}/stock-balance`)
  return data.data // { total_on_hand, total_reserved, total_available, by_location }
}

export async function getItemTransactions(id, params = {}) {
  const { data } = await apiClient.get(`/items/${id}/transactions`, { params })
  return data.data // Laravel paginator shape: { data: [...], current_page, last_page, ... }
}

export async function uploadItemImage(id, file) {
  const formData = new FormData()
  formData.append("image", file)
  const { data } = await apiClient.post(`/items/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data.data
}

export async function removeItemImage(id) {
  const { data } = await apiClient.delete(`/items/${id}/image`)
  return data.data
}

// Image paths returned by the API are relative (e.g. "items/3/abc.jpg").
// ASSUMPTION: they're served from Laravel's public storage disk at /storage/<path>.
// Confirm this with your backend team — adjust here if the real URL pattern differs.
export function resolveItemImageUrl(imagePath) {
  if (!imagePath) return null
  return `${BASE_URL}/storage/${imagePath}`
}