import apiClient from "../../../shared/api/axiosClient.js"

/**
 * POST /auth/login
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{user: object, access_token: string, token_type: string}>}
 */
export async function login({ email, password }) {
  const { data } = await apiClient.post("/auth/login", { email, password })
  return data.data // { user, access_token, token_type }
}

/**
 * POST /auth/logout
 */
export async function logout() {
  const { data } = await apiClient.post("/auth/logout")
  return data
}

/**
 * POST /auth/refresh
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function refreshToken() {
  const { data } = await apiClient.post("/auth/refresh")
  return data.data
}

/**
 * GET /auth/me
 * @returns {Promise<object>} the current authenticated user
 */
export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me")
  return data.data
}