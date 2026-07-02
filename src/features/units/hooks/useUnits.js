import { useCallback, useEffect, useState } from "react"
import * as unitsApi from "../api/unitsApi.js"

export function useUnits() {
  const [units, setUnits] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUnits = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await unitsApi.listUnits({ page, per_page: 100 })
      setUnits(response.data)
      setMeta(response.meta)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load units.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnits(1)
  }, [fetchUnits])

  async function createUnit(payload) {
    const created = await unitsApi.createUnit(payload)
    setUnits((prev) => [created, ...prev])
    return created
  }

  async function updateUnit(id, payload) {
    const updated = await unitsApi.updateUnit(id, payload)
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)))
    return updated
  }

  async function deleteUnit(id) {
    await unitsApi.deleteUnit(id)
    setUnits((prev) => prev.filter((u) => u.id !== id))
  }

  async function toggleStatus(unit) {
    const nextStatus = unit.status === "active" ? "inactive" : "active"
    const updated = await unitsApi.toggleUnitStatus(unit.id, nextStatus)
    setUnits((prev) => prev.map((u) => (u.id === unit.id ? updated : u)))
    return updated
  }

  return {
    units,
    meta,
    isLoading,
    error,
    refetch: fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    toggleStatus,
  }
}