import { useState, useEffect, useCallback } from "react";
import * as unitsApi from "../api/unitsApi.js";

export const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await unitsApi.listUnits();
      setUnits(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load units of measure.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const createUnit = async (payload) => {
    const created = await unitsApi.createUnit(payload);
    setUnits((prev) => [...prev, created]);
    return created;
  };

  const updateUnit = async (id, payload) => {
    const updated = await unitsApi.updateUnit(id, payload);
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  const deleteUnit = async (id) => {
    await unitsApi.deleteUnit(id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleUnitStatus = async (id) => {
    const updated = await unitsApi.toggleUnitStatus(id);
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  return {
    units,
    isLoading,
    error,
    refetch: fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    toggleUnitStatus,
  };
};
