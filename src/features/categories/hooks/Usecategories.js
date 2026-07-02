import { useCallback, useEffect, useState } from "react"
import * as categoriesApi from "../api/categoriesApi.js"

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const fetchCategories = useCallback(async (targetPage = page) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await categoriesApi.listCategories({ page: targetPage })
      setCategories(response.data)
      setMeta(response.meta)
      setPage(targetPage)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories.")
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchCategories(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createCategory(payload) {
    const newCategory = await categoriesApi.createCategory(payload)
    setCategories((prev) => [newCategory, ...prev])
    return newCategory
  }

  async function updateCategory(id, payload) {
    const updated = await categoriesApi.updateCategory(id, payload)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  async function deleteCategory(id) {
    await categoriesApi.deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  async function toggleStatus(category) {
    const nextStatus = category.status === "active" ? "inactive" : "active"
    const updated = await categoriesApi.toggleCategoryStatus(category.id, nextStatus)
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)))
    return updated
  }

  return {
    categories,
    meta,
    isLoading,
    error,
    page,
    goToPage: fetchCategories,
    refetch: () => fetchCategories(page),
    createCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
  }
}