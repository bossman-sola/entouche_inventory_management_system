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

export function useWarehouseLocations() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const whs = await fetchAllPages("/warehouses");
      setWarehouses(whs);

      const perWarehouse = await Promise.all(
        whs.map((w) =>
          apiClient
            .get(`/warehouses/${w.id}/locations`)
            .then(({ data: json }) =>
              (Array.isArray(json?.data) ? json.data : []).map((loc) => ({
                ...loc,
                warehouseId: w.id,
                warehouseName: w.name,
              })),
            )
            .catch(() => []),
        ),
      );
      setLocations(perWarehouse.flat());
    } catch (err) {
      setError(errorMessage(err, "Couldn't load warehouses"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { warehouses, locations, loading, error, reload: load };
}