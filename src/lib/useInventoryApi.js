import { useState, useCallback } from "react";
import { api, fetchAllPages } from "../shared/api/entoucheApi";
import apiClient, { tokenStorage } from "../shared/api/axiosClient";
import { normalizeName } from "./parsers";

const {
  login: apiLogin,
  listCategories,
  listUnits,
  listUsers,
  listWarehouses,
} = api;

export function useInventoryApi() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting");
  const [authError, setAuthError] = useState("");

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(null);
  const [usersTotal, setUsersTotal] = useState(null);
  const [refLoading, setRefLoading] = useState(false);

  // Loads all reference data. Callers invoke this only after auth succeeds,
  // so no authStatus guard is needed and the callback has no reactive deps.
  const loadReferenceData = useCallback(async () => {
    setRefLoading(true);
    try {
      const [cats, uns, usersList, usersMeta, itemsList, whs] =
        await Promise.all([
          listCategories(),
          listUnits(),
          listUsers(),
          apiClient
            .get("/users", { params: { per_page: 1 } })
            .then((r) => r.data),
          fetchAllPages("/items"),
          listWarehouses(),
        ]);
      setCategories(cats || []);
      setUnits(uns || []);
      setExistingUsers(usersList || []);
      setItems(itemsList || []);
      setWarehouses(whs || []);
      setItemsTotal(itemsList ? itemsList.length : null);
      setUsersTotal(
        usersMeta?.meta?.total ?? (usersList ? usersList.length : null),
      );
    } catch (err) {
      setAuthError(err.message || "Failed to load reference data");
    } finally {
      setRefLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      setAuthStatus("connecting");
      setAuthError("");
      try {
        const data = await apiLogin(email, password);
        tokenStorage.set(data.access_token);
        setCurrentUser(data.user);
        setAuthStatus("ok");
        loadReferenceData(); // chained directly after successful auth
      } catch (err) {
        setAuthStatus("error");
        setAuthError(err.message || "Could not reach the API");
      }
    },
    [loadReferenceData],
  );

  const refData = {
    categories: new Map(categories.map((c) => [normalizeName(c.name), c])),
    units: new Map(units.map((u) => [normalizeName(u.name), u])),
    userEmails: new Set(existingUsers.map((u) => u.email.toLowerCase())),
    itemsBySku: new Map(
      items.filter((it) => it.sku).map((it) => [normalizeName(it.sku), it]),
    ),
  };

  return {
    currentUser,
    authStatus,
    authError,
    login,
    refData,
    warehouses,
    itemsTotal,
    usersTotal,
    refLoading,
    loadReferenceData,
  };
}
