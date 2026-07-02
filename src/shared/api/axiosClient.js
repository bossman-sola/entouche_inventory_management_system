import axios from "axios"

// Base URL for the Entouche staging API
export const BASE_URL = "https://entouche-staging-api-16910c236bc5.herokuapp.com"

const STORAGE_KEY = "inventorypro_access_token"

export const tokenStorage = {
  get: () => localStorage.getItem(STORAGE_KEY),
  set: (token) => localStorage.setItem(STORAGE_KEY, token),
  clear: () => localStorage.removeItem(STORAGE_KEY),
}

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    Accept: "application/json",
  },
})

// Attach the access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- 401 handling: try to refresh the token once, then retry the request ---
let isRefreshing = false
let pendingQueue = []

function resolveQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isAuthRoute = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh")

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // queue this request until the refresh call finishes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${tokenStorage.get()}`, Accept: "application/json" } }
        )
        const newToken = data?.data?.access_token
        tokenStorage.set(newToken)
        resolveQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        resolveQueue(refreshError, null)
        tokenStorage.clear()
        // hard redirect to login since auth state is no longer valid
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient