import apiClient, {
  tokenStorage,
} from "../../../shared/api/axiosClient.js";

const ACCESS_TOKEN_KEY = "entouche_access_token"


/**
 * POST /auth/login
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{user: object, access_token: string, token_type: string}>}
 */
export async function login({ email, password }) {
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  const loginData = response.data?.data;

  if (!loginData?.access_token) {
    throw new Error(
      "Login succeeded, but no access token was returned.",
    );
  }

  tokenStorage.set(loginData.access_token);

  return loginData;
}

export async function logout() {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } finally {
    tokenStorage.clear();
  }
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