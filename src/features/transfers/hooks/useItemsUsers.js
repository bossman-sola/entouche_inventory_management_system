import {
  useCallback,
  useEffect,
  useState,
} from "react";

import apiClient from "../../../shared/api/axiosClient.js";


async function fetchAllPages(path, maxPages = 20) {
  let page = 1;
  let all = [];

  while (page <= maxPages) {
    const { data: json } = await apiClient.get(path, {
      params: { page },
    });

    const data = Array.isArray(json?.data)
      ? json.data
      : [];

    all = all.concat(data);

    const lastPage =
      json?.meta?.last_page ?? 1;

    if (page >= lastPage) {
      break;
    }

    page += 1;
  }

  return all;
}


function errorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}


/*
 * Transfers return raw foreign keys for items/users,
 * so these collections are loaded and used to resolve
 * IDs to display labels in the UI.
 */
async function fetchItemsUsers() {
  const [
    items,
    users,
  ] = await Promise.all([
    fetchAllPages("/items"),
    fetchAllPages("/users"),
  ]);

  return {
    items,
    users,
  };
}


export function useItemsUsers() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const data =
          await fetchItemsUsers();

        if (cancelled) {
          return;
        }

        setItems(data.items);
        setUsers(data.users);
        setError("");

      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          errorMessage(
            err,
            "Couldn't load items/users"
          )
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =======================================================
     MANUAL RELOAD
  ======================================================= */

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await fetchItemsUsers();

      setItems(data.items);
      setUsers(data.users);

      return data;

    } catch (err) {
      setError(
        errorMessage(
          err,
          "Couldn't load items/users"
        )
      );

      throw err;

    } finally {
      setLoading(false);
    }
  }, []);


  return {
    items,
    users,
    loading,
    error,
    reload,
  };
}