import {
  useCallback,
  useEffect,
  useState,
} from "react";

import apiClient from "../../../shared/api/axiosClient.js";


async function fetchAllPages(
  path,
  maxPages = 20
) {
  let page = 1;
  let all = [];

  while (page <= maxPages) {
    const { data: json } =
      await apiClient.get(path, {
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


async function fetchWarehouseLocations() {
  const warehouses =
    await fetchAllPages("/warehouses");

  const perWarehouse =
    await Promise.all(
      warehouses.map(async (warehouse) => {
        try {
          const { data: json } =
            await apiClient.get(
              `/warehouses/${warehouse.id}/locations`
            );

          const locations =
            Array.isArray(json?.data)
              ? json.data
              : [];

          return locations.map((location) => ({
            ...location,

            warehouseId:
              warehouse.id,

            warehouseName:
              warehouse.name,
          }));
        } catch {
          return [];
        }
      })
    );

  return {
    warehouses,
    locations: perWarehouse.flat(),
  };
}


export function useWarehouseLocations() {
  const [warehouses, setWarehouses] =
    useState([]);

  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* Initial load */
  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const data =
          await fetchWarehouseLocations();

        if (cancelled) {
          return;
        }

        setWarehouses(
          data.warehouses
        );

        setLocations(
          data.locations
        );

        setError("");

      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          errorMessage(
            err,
            "Couldn't load warehouses"
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


  /* Manual reload */
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await fetchWarehouseLocations();

      setWarehouses(
        data.warehouses
      );

      setLocations(
        data.locations
      );

      return data;

    } catch (err) {
      setError(
        errorMessage(
          err,
          "Couldn't load warehouses"
        )
      );

      throw err;

    } finally {
      setLoading(false);
    }
  }, []);


  return {
    warehouses,
    locations,
    loading,
    error,
    reload,
  };
}