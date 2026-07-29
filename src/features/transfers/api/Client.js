import { useState, useCallback, useEffect } from "react";

export const API_BASE = "https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1";
const DEFAULT_EMAIL = "admin@inventory.local";
const DEFAULT_PASSWORD = "Admin@1234";

export function useAccessToken() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("connecting"); 
  const [error, setError] = useState("");

  const login = useCallback(async (email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) => {
    setStatus("connecting");
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        throw new Error(json?.message || `Login failed (${res.status})`);
      }
      setToken(json.data.access_token);
      setUser(json.data.user);
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not reach the API");
    }
  }, []);

  useEffect(() => { login(); }, [login]);

  return { token, user, status, error, retry: login };
}

export async function apiRequest(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let json = null;
  try { json = await res.json(); } catch { /* no body */ }
  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = json?.errors || null;
    throw err;
  }
  return json;
}


export async function fetchAllPages(path, token, maxPages = 20) {
  let page = 1;
  let all = [];
  while (page <= maxPages) {
    const json = await apiRequest(`${path}${path.includes("?") ? "&" : "?"}page=${page}`, token);
    const data = Array.isArray(json?.data) ? json.data : [];
    all = all.concat(data);
    const lastPage = json?.meta?.last_page || 1;
    if (page >= lastPage) break;
    page += 1;
  }
  return all;
}