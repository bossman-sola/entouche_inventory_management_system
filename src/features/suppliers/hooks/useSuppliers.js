import { useCallback, useEffect, useState } from "react"
import * as suppliersApi from "../api/suppliersApi.js"

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSuppliers = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await suppliersApi.listSuppliers({ page, per_page: 100 })
      setSuppliers(response.data)
      setMeta(response.meta)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load suppliers.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuppliers(1)
  }, [fetchSuppliers])

  async function createSupplier(payload) {
    const created = await suppliersApi.createSupplier(payload)
    setSuppliers((prev) => [created, ...prev])
    return created
  }

  async function updateSupplier(id, payload) {
    const updated = await suppliersApi.updateSupplier(id, payload)
    setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  async function deleteSupplier(id) {
    await suppliersApi.deleteSupplier(id)
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  async function toggleStatus(supplier) {
    const nextStatus = supplier.status === "active" ? "inactive" : "active"
    const updated = await suppliersApi.toggleSupplierStatus(supplier.id, nextStatus)
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? updated : s)))
    return updated
  }

  return {
    suppliers,
    meta,
    isLoading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleStatus,
  }
}