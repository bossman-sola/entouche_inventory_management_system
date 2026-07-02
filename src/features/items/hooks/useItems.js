import { useCallback, useEffect, useState } from "react"
import * as itemsApi from "../api/itemsApi.js"
import { mapApiItemToUi } from "../api/itemsMapper.js"

export function useItems() {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const fetchItems = useCallback(async (targetPage = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      // per_page bumped up since filtering/search currently happens client-side
      const response = await itemsApi.listItems({ page: targetPage, per_page: 100 })
      setItems(response.data.map(mapApiItemToUi))
      setMeta(response.meta)
      setPage(targetPage)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load items.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems(1)
  }, [fetchItems])

  async function createItem(payload, imageFile) {
    let newItem = await itemsApi.createItem(payload)
    if (imageFile) {
      newItem = await itemsApi.uploadItemImage(newItem.id, imageFile)
    }
    const uiItem = mapApiItemToUi(newItem)
    setItems((prev) => [uiItem, ...prev])
    return uiItem
  }

  async function updateItem(id, payload) {
    const updated = await itemsApi.updateItem(id, payload)
    const uiItem = mapApiItemToUi(updated)
    setItems((prev) => prev.map((i) => (i.id === id ? uiItem : i)))
    return uiItem
  }

  async function deleteItem(id) {
    await itemsApi.deleteItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function toggleStatus(id) {
    const updated = await itemsApi.toggleItemStatus(id)
    const uiItem = mapApiItemToUi(updated)
    setItems((prev) => prev.map((i) => (i.id === id ? uiItem : i)))
    return uiItem
  }

  return {
    items,
    meta,
    isLoading,
    error,
    page,
    refetch: () => fetchItems(page),
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  }
}