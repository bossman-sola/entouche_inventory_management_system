import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

/*
 * Use the same storage key everywhere in the application.
 * Your other API helper already uses "entouche_access_token".
 */
const ACCESS_TOKEN_KEY = "entouche_access_token";

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token) {
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  },

  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  },
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/*
 * Attach the access token to every outgoing request.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
 * Prevent several failed requests from making several refresh calls
 * at the same time.
 */
let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  refreshQueue = [];
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";

    const isLoginRequest = requestUrl.includes("/auth/login");
    const isRefreshRequest = requestUrl.includes("/auth/refresh");
    const isAuthRequest = isLoginRequest || isRefreshRequest;

    /*
     * Leave non-401 errors and login/refresh failures untouched.
     */
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    const currentToken = tokenStorage.get();

    /*
     * A protected request failed but there is no stored token.
     * Refreshing is impossible, so send the user to login.
     */
    if (!currentToken) {
      tokenStorage.clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    /*
     * Wait for an already-running refresh request.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /*
       * Use plain axios here so the refresh request does not trigger
       * this apiClient response interceptor again.
       */
      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      const newToken = response.data?.data?.access_token;

      if (!newToken) {
        throw new Error(
          "Token refresh succeeded, but no access token was returned.",
        );
      }

      tokenStorage.set(newToken);
      processRefreshQueue(null, newToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError);
      tokenStorage.clear();
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;