import { useState, useCallback, useEffect } from "react";
import {
  login as apiLogin,
  setAccessToken,
  getAccessToken,
  getCurrentUser,
  listCategories,
  listUnits,
  listUsers,
  requestRaw,
} from "./api";
import { normalizeName } from "./parsers";

const DEFAULT_EMAIL = "admin@inventory.local";
const DEFAULT_PASSWORD = "Admin@1234";

export function useInventoryApi() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("connecting");
  const [authError, setAuthError] = useState("");

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(null);
  const [usersTotal, setUsersTotal] = useState(null);
  const [refLoading, setRefLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setAuthStatus("connecting");
    setAuthError("");
    try {
      const data = await apiLogin(email, password);
      setAccessToken(data.access_token);
      setCurrentUser(data.user);
      setAuthStatus("ok");
    } catch (err) {
      setAuthStatus("error");
      setAuthError(err.message || "Could not reach the API");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const existingToken = getAccessToken();
      if (existingToken) {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
          setAuthStatus("ok");
          return;
        } catch {
          setAccessToken(null);
        }
      }
      login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    })();
    
  }, []);

  const loadReferenceData = useCallback(async () => {
    if (authStatus !== "ok") return;
    setRefLoading(true);
    try {
      const [cats, uns, usersList, itemsMeta, usersMeta] = await Promise.all([
        listCategories(),
        listUnits(),
        listUsers(),
        requestRaw("/items", { params: { per_page: 1 } }),
        requestRaw("/users", { params: { per_page: 1 } }),
      ]);
      setCategories(cats || []);
      setUnits(uns || []);
      setExistingUsers(usersList || []);
      setItemsTotal(itemsMeta?.meta?.total ?? null);
      setUsersTotal(usersMeta?.meta?.total ?? (usersList ? usersList.length : null));
    } catch (err) {
      setAuthError(err.message || "Failed to load reference data");
    } finally {
      setRefLoading(false);
    }
  }, [authStatus]);

  useEffect(() => { if (authStatus === "ok") loadReferenceData(); }, [authStatus, loadReferenceData]);

  const refData = {
    categories: new Map(categories.map(c => [normalizeName(c.name), c])),
    units: new Map(units.map(u => [normalizeName(u.name), u])),
    userEmails: new Set(existingUsers.map(u => u.email.toLowerCase())),
  };

  return {
    currentUser, authStatus, authError, login,
    refData, itemsTotal, usersTotal, refLoading, loadReferenceData,
  };
}

export { DEFAULT_EMAIL, DEFAULT_PASSWORD };