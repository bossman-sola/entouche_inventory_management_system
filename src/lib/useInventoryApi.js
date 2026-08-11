import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  api,
  fetchAllPages,
} from "../shared/api/entoucheApi";

import apiClient, {
  tokenStorage,
} from "../shared/api/axiosClient";

import { normalizeName } from "./parsers";


const {
  login: apiLogin,
  me: apiMe,
  listCategories,
  listUnits,
  listUsers,
  listWarehouses,
} = api;


/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(
  err,
  fallback
) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}


/* =========================================================
   FETCH REFERENCE DATA
========================================================= */

async function fetchReferenceData() {
  const [
    categories,
    units,
    usersList,
    usersMeta,
    itemsList,
    warehouses,
  ] = await Promise.all([
    listCategories(),

    listUnits(),

    listUsers(),

    apiClient
      .get("/users", {
        params: {
          per_page: 1,
        },
      })
      .then((response) =>
        response.data
      ),

    fetchAllPages("/items"),

    listWarehouses(),
  ]);

  return {
    categories:
      Array.isArray(categories)
        ? categories
        : [],

    units:
      Array.isArray(units)
        ? units
        : [],

    users:
      Array.isArray(usersList)
        ? usersList
        : [],

    items:
      Array.isArray(itemsList)
        ? itemsList
        : [],

    warehouses:
      Array.isArray(warehouses)
        ? warehouses
        : [],

    usersTotal:
      usersMeta?.meta?.total ??
      (
        Array.isArray(usersList)
          ? usersList.length
          : null
      ),

    itemsTotal:
      Array.isArray(itemsList)
        ? itemsList.length
        : null,
  };
}


/* =========================================================
   HOOK
========================================================= */

export function useInventoryApi() {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    authStatus,
    setAuthStatus,
  ] = useState("connecting");

  const [
    authError,
    setAuthError,
  ] = useState("");


  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    units,
    setUnits,
  ] = useState([]);

  const [
    existingUsers,
    setExistingUsers,
  ] = useState([]);

  const [
    items,
    setItems,
  ] = useState([]);

  const [
    warehouses,
    setWarehouses,
  ] = useState([]);

  const [
    itemsTotal,
    setItemsTotal,
  ] = useState(null);

  const [
    usersTotal,
    setUsersTotal,
  ] = useState(null);

  const [
    refLoading,
    setRefLoading,
  ] = useState(false);


  /* =======================================================
     APPLY REFERENCE DATA
  ======================================================= */

  const applyReferenceData =
    useCallback((data) => {
      setCategories(
        data.categories
      );

      setUnits(
        data.units
      );

      setExistingUsers(
        data.users
      );

      setItems(
        data.items
      );

      setWarehouses(
        data.warehouses
      );

      setItemsTotal(
        data.itemsTotal
      );

      setUsersTotal(
        data.usersTotal
      );
    }, []);


  /* =======================================================
     LOAD REFERENCE DATA
  ======================================================= */

  const loadReferenceData =
    useCallback(async () => {
      try {
        setRefLoading(true);
        setAuthError("");

        const data =
          await fetchReferenceData();

        applyReferenceData(
          data
        );

        return data;

      } catch (err) {
        const message =
          getErrorMessage(
            err,
            "Failed to load reference data"
          );

        setAuthError(message);

        throw err;

      } finally {
        setRefLoading(false);
      }
    }, [applyReferenceData]);


  /* =======================================================
     INITIAL AUTH BOOTSTRAP
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token =
        tokenStorage.get?.();

      /*
       * No saved token means this hook
       * cannot authenticate automatically.
       */
      if (!token) {
        if (!cancelled) {
          setAuthStatus("error");

          setAuthError(
            "You are not authenticated."
          );
        }

        return;
      }

      try {
        /*
         * axiosClient adds the stored
         * bearer token automatically.
         */
        const user =
          await apiMe();

        if (cancelled) {
          return;
        }

        setCurrentUser(user);
        setAuthStatus("ok");
        setAuthError("");

        /*
         * Load all Data Import reference
         * information after auth succeeds.
         */
        setRefLoading(true);

        const referenceData =
          await fetchReferenceData();

        if (cancelled) {
          return;
        }

        applyReferenceData(
          referenceData
        );

      } catch (err) {
        if (cancelled) {
          return;
        }

        setCurrentUser(null);
        setAuthStatus("error");

        setAuthError(
          getErrorMessage(
            err,
            "Could not restore your session."
          )
        );

      } finally {
        if (!cancelled) {
          setRefLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applyReferenceData]);


  /* =======================================================
     MANUAL LOGIN
  ======================================================= */

  const login =
    useCallback(
      async (
        email,
        password
      ) => {
        try {
          setAuthStatus(
            "connecting"
          );

          setAuthError("");

          const data =
            await apiLogin(
              email,
              password
            );

          tokenStorage.set(
            data.access_token
          );

          setCurrentUser(
            data.user
          );

          setAuthStatus("ok");

          await loadReferenceData();

          return data;

        } catch (err) {
          setCurrentUser(null);

          setAuthStatus(
            "error"
          );

          setAuthError(
            getErrorMessage(
              err,
              "Could not reach the API"
            )
          );

          throw err;
        }
      },
      [loadReferenceData]
    );


  /* =======================================================
     REFERENCE MAPS
  ======================================================= */

  const refData =
    useMemo(
      () => ({
        categories:
          new Map(
            categories.map(
              (category) => [
                normalizeName(
                  category.name
                ),
                category,
              ]
            )
          ),

        units:
          new Map(
            units.map(
              (unit) => [
                normalizeName(
                  unit.name
                ),
                unit,
              ]
            )
          ),

        userEmails:
          new Set(
            existingUsers
              .filter(
                (user) =>
                  user?.email
              )
              .map(
                (user) =>
                  user.email.toLowerCase()
              )
          ),

        itemsBySku:
          new Map(
            items
              .filter(
                (item) =>
                  item?.sku
              )
              .map(
                (item) => [
                  normalizeName(
                    item.sku
                  ),
                  item,
                ]
              )
          ),
      }),
      [
        categories,
        units,
        existingUsers,
        items,
      ]
    );


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