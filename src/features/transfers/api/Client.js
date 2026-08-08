export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? "/api/v1"
    : "https://entouche-production-api-8db0aeb1236f.herokuapp.com/api/v1");

export async function apiRequest(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
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
    const json = await apiRequest(
      `${path}${path.includes("?") ? "&" : "?"}page=${page}`,
      token,
    );
    const data = Array.isArray(json?.data) ? json.data : [];
    all = all.concat(data);
    const lastPage = json?.meta?.last_page || 1;
    if (page >= lastPage) break;
    page += 1;
  }
  return all;
}
