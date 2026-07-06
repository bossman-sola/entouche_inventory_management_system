import { useState, useEffect, useCallback } from "react";
import * as suppliersApi from "../api/suppliersApi.js";

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await suppliersApi.listSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load suppliers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (payload) => {
    const created = await suppliersApi.createSupplier(payload);
    setSuppliers((prev) => [...prev, created]);
    return created;
  };

  const updateSupplier = async (id, payload) => {
    const updated = await suppliersApi.updateSupplier(id, payload);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteSupplier = async (id) => {
    await suppliersApi.deleteSupplier(id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSupplierStatus = async (id) => {
    const updated = await suppliersApi.toggleSupplierStatus(id);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  return {
    suppliers,
    isLoading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
  };
};
