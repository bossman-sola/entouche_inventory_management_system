import { useState, useCallback, useEffect } from "react";
import { apiRequest, fetchAllPages } from "../api/Client.js";
export function useWarehouseLocations(token) {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const whs = await fetchAllPages("/warehouses", token);
      setWarehouses(whs);

      const perWarehouse = await Promise.all(
        whs.map(w =>
          apiRequest(`/warehouses/${w.id}/locations`, token)
            .then(json => (Array.isArray(json?.data) ? json.data : []).map(loc => ({
              ...loc,
              warehouseId: w.id,
              warehouseName: w.name,
            })))
            .catch(() => []) 
        )
      );
      setLocations(perWarehouse.flat());
    } catch (err) {
      setError(err.message || "Couldn't load warehouses");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return { warehouses, locations, loading, error, reload: load };
}