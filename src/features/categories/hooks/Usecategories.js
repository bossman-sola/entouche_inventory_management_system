import { useState, useEffect, useCallback } from "react";
import * as categoriesApi from "../api/categoriesApi.js";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.listCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (payload) => {
    const created = await categoriesApi.createCategory(payload);
    setCategories((prev) => [...prev, created]);
    return created;
  };

  const updateCategory = async (id, payload) => {
    const updated = await categoriesApi.updateCategory(id, payload);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id) => {
    await categoriesApi.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCategoryStatus = async (id) => {
    const updated = await categoriesApi.toggleCategoryStatus(id);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
};
