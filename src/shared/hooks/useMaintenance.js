import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/entoucheApi";

export function useMaintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMaintenance = useCallback(async () => {
    try {
      setError(null);
      const data = await api.listMaintenance();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load maintenance:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaintenance();

    const interval = window.setInterval(
      loadMaintenance,
      60_000
    );

    return () => window.clearInterval(interval);
  }, [loadMaintenance]);

  const maintenance = useMemo(() => {
    if (!records.length) return null;

    const now = new Date();

    // Current maintenance takes priority
    const inProgress = records.find(
      (item) => item.status === "in_progress"
    );

    if (inProgress) return inProgress;

    // Otherwise use the nearest upcoming maintenance
    const scheduled = records
      .filter(
        (item) =>
          item.status === "scheduled" &&
          new Date(item.starts_at) > now
      )
      .sort(
        (a, b) =>
          new Date(a.starts_at) -
          new Date(b.starts_at)
      )[0];

    return scheduled ?? null;
  }, [records]);

  return {
    maintenance,
    records,
    loading,
    error,
    refreshMaintenance: loadMaintenance,
  };
}