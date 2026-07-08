// locationsApi.js
//
// There is currently NO /api/v1/locations group in the tested-endpoints
// reference (only Auth, Categories, Items, Roles, Suppliers, Units, Users
// are documented there). This file is written ahead of time, matching the
// exact request/response shape every other master-data resource in this
// API uses (Categories / Suppliers / Units all follow the same
// list / create / get / update / delete / toggle-status pattern).
//
// LocationsPage.jsx already calls these functions directly — there is no
// mock data anywhere in this feature. Until the backend ships the
// endpoint, every call below will fail (404) and the page will just show
// its empty state. The moment /api/v1/locations goes live, this starts
// working with zero code changes on either side.

const API_BASE_URL = 'https://entouche-staging-api-16910c236bc5.herokuapp.com/api/v1';

function getAuthToken() {
  // Match however the rest of the app stores the token from
  // POST /api/v1/auth/login (data.access_token).
  return localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.errors = json?.errors ?? null;
    throw error;
  }

  return json?.data;
}

export const locationsApi = {
  // GET /api/v1/locations?search=&warehouse_id=&status=
  list(params = {}) {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/locations${query ? `?${query}` : ''}`);
  },

  // GET /api/v1/locations/{id}
  get(id) {
    return request(`/locations/${id}`);
  },

  // POST /api/v1/locations
  create(payload) {
    return request('/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // PUT /api/v1/locations/{id}
  update(id, payload) {
    return request(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // DELETE /api/v1/locations/{id}
  remove(id) {
    return request(`/locations/${id}`, { method: 'DELETE' });
  },

  // POST /api/v1/locations/{id}/toggle-status
  toggleStatus(id, status) {
    return request(`/locations/${id}/toggle-status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};