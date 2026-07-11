import { useCallback, useEffect, useState } from "react";
import { api } from "../../../shared/api/entoucheApi.js";

const PER_PAGE = 20;
export function useAdjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async (pageArg) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listAdjustments({ page: pageArg, per_page: PER_PAGE });
      setAdjustments(Array.isArray(result) ? result : result?.data ?? []);
    } catch (err) {
      setError(err.message || "Couldn't load adjustments.");
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const reload = useCallback(() => load(page), [load, page]);

  async function runAction(actionFn, successMessage) {
    setActionError(null);
    try {
      await actionFn();
      await reload();
      return { ok: true, message: successMessage };
    } catch (err) {
      const message = err.message || "That action failed.";
      setActionError(message);
      return { ok: false, message };
    }
  }

  const submitAdjustment = (id) => runAction(() => api.submitAdjustment(id), "Adjustment submitted for approval");
  const approveAdjustment = (id) => runAction(() => api.approveAdjustment(id), "Adjustment approved — stock updated");
  const rejectAdjustment = (id, reason) => runAction(() => api.rejectAdjustment(id, reason), "Adjustment rejected");
  const cancelAdjustment = (id) => runAction(() => api.cancelAdjustment(id), "Adjustment cancelled");
  const deleteAdjustment = (id) => runAction(() => api.deleteAdjustment(id), "Draft adjustment deleted");
  const createAdjustment = (payload) => api.createAdjustment(payload); // caller reloads after modal closes

  const hasNextPage = adjustments.length === PER_PAGE;

  return {
    adjustments,
    loading,
    error,
    actionError,
    page,
    setPage,
    hasNextPage,
    reload,
    createAdjustment,
    submitAdjustment,
    approveAdjustment,
    rejectAdjustment,
    cancelAdjustment,
    deleteAdjustment,
  };
}

export function useAdjustmentFormData() {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [locations, setLocations] = useState([]); // flattened, each tagged with warehouseId/warehouseName
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(null);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError(null);
    try {
      const result = await api.listItems({ per_page: 100 });
      setItems(Array.isArray(result) ? result : result?.data ?? []);
    } catch (err) {
      setItemsError(err.message || "Couldn't load items.");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const result = await api.listUsers();
      setUsers(Array.isArray(result) ? result : result?.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    setLocationsError(null);
    try {
      const warehouseResult = await api.listWarehouses({ per_page: 100 });
      const warehouses = Array.isArray(warehouseResult) ? warehouseResult : warehouseResult?.data ?? [];
      const settled = await Promise.allSettled(
        warehouses.map((w) => api.listWarehouseLocations(w.id))
      );
      const flattened = settled.flatMap((r, idx) => {
        if (r.status !== "fulfilled") return [];
        const locs = Array.isArray(r.value) ? r.value : r.value?.data ?? [];
        return locs.map((loc) => ({ ...loc, warehouseId: warehouses[idx].id, warehouseName: warehouses[idx].name }));
      });
      setLocations(flattened);
    } catch (err) {
      setLocationsError(err.message || "Couldn't load locations.");
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchUsers();
    fetchLocations();
  }, [fetchItems, fetchUsers, fetchLocations]);

  return {
    items, itemsLoading, itemsError, fetchItems,
    users, usersLoading, fetchUsers,
    locations, locationsLoading, locationsError, fetchLocations,
  };
}