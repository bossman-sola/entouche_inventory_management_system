import { useState, useCallback, useEffect } from "react";
import apiClient from "../../../shared/api/axiosClient.js";

async function fetchAllPages(path, maxPages = 20) {
  let page = 1;
  let all = [];
  while (page <= maxPages) {
    const { data: json } = await apiClient.get(
      `${path}${path.includes("?") ? "&" : "?"}page=${page}`,
    );
    const data = Array.isArray(json?.data) ? json.data : [];
    all = all.concat(data);
    const lastPage = json?.meta?.last_page || 1;
    if (page >= lastPage) break;
    page += 1;
  }
  return all;
}

function errorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

// The transfers list/detail endpoints only ever return raw FKs (item_id,
// requested_by, approved_by, created_by) — never the eager-loaded relation
// objects the UI was originally written against. Same shape of problem as
// from_location_id/to_location_id, so this mirrors useWarehouseLocations.js:
// fetch everything once up front, resolve ids to labels locally.
export function useItemsUsers() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsData, usersData] = await Promise.all([
        fetchAllPages("/items"),
        fetchAllPages("/users"),
      ]);
      setItems(itemsData);
      setUsers(usersData);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load items/users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, users, loading, error, reload: load };
}
