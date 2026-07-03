import apiClient from "../../../shared/api/axiosClient.js"

/**
 * GET /categories
 * @param {{page?: number, per_page?: number}} params
 */
export async function listCategories(params = {}) {
  const { data } = await apiClient.get("/categories", { params })
  return data 
}

/**
 * POST /categories
 * @param {{name: string, code: string, parent_id?: number|null, status?: string}} payload
 */
export async function createCategory(payload) {
  const { data } = await apiClient.post("/categories", payload)
  return data.data
}

/**
 * GET /categories/{id}
 */
export async function getCategory(id) {
  const { data } = await apiClient.get(`/categories/${id}`)
  return data.data
}

/**
 * PUT /categories/{id}
 */
export async function updateCategory(id, payload) {
  const { data } = await apiClient.put(`/categories/${id}`, payload)
  return data.data
}

/**
 * DELETE /categories/{id}
 */
export async function deleteCategory(id) {
  const { data } = await apiClient.delete(`/categories/${id}`)
  return data
}

/**
 * POST /categories/{id}/toggle-status
 * @param {number} id
 * @param {"active"|"inactive"} status - the status to set
 */
export async function toggleCategoryStatus(id, status) {
  const { data } = await apiClient.post(`/categories/${id}/toggle-status`, { status })
  return data.data
}