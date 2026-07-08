const API_BASE = "https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1";

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok || (json && json.success === false)) {
    const msg = json?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = json?.errors;
    throw err;
  }
  return json;
}

export async function fetchAllPages(path, token, { maxPages = 10 } = {}) {
  let page = 1;
  let out = [];
  while (page <= maxPages) {
    const sep = path.includes("?") ? "&" : "?";
    const json = await apiRequest(`${path}${sep}page=${page}`, { token });
    const chunk = Array.isArray(json.data) ? json.data : [];
    out = out.concat(chunk);
    const meta = json.meta;
    if (!meta || meta.current_page >= meta.last_page) break;
    page += 1;
  }
  return out;
}
