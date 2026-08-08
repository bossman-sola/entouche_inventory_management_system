import { useCallback, useEffect, useState } from "react";
import * as StockCountApi from "../api/StockCountApi.js";

export function useStockCounts() {
  const [stockCounts, setStockCounts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [overview, setOverview] = useState(null);
  const [lookups, setLookups] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [countsResponse, overviewResponse, lookupResponse] =
          await Promise.all([
            StockCountApi.listStockCounts(),
            StockCountApi.getStockCountOverview(),
            StockCountApi.getStockCountLookups(),
          ]);

        if (cancelled) return;

        setStockCounts(countsResponse?.stockCounts ?? []);
        setMeta(countsResponse?.meta ?? null);
        setOverview(overviewResponse ?? null);
        setLookups(lookupResponse ?? null);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load stock counts."
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

  const reload = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const [countsResponse, overviewResponse] =
        await Promise.all([
          StockCountApi.listStockCounts(params),
          StockCountApi.getStockCountOverview(),
        ]);

      setStockCounts(countsResponse?.stockCounts ?? []);
      setMeta(countsResponse?.meta ?? null);
      setOverview(overviewResponse ?? null);

      return countsResponse;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load stock counts."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stockCounts,
    meta,
    overview,
    lookups,
    loading,
    error,
    reload,
  };
}