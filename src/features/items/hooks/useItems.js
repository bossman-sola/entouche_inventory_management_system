import { useState, useEffect, useCallback } from "react";
import * as itemsApi from "../api/itemsApi.js";
import { mapApiItemToUiItem } from "../api/itemsMapper.js";

export const useItems = () => {
  const [rawItems, setRawItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { items } = await itemsApi.listItems();
      setRawItems(items);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load items.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // NOTE: the list endpoint doesn't return live stock quantities, so the
  // table shows 0 / "Out of Stock" until you open an item's details, which
  // fetches the real balance from GET /items/:id/stock-balance.
  const items = rawItems.map((item) => mapApiItemToUiItem(item));

  const createItem = async (payload, imageFile) => {
    const created = await itemsApi.createItem(payload);
    let withImage = created;
    if (imageFile) {
      try {
        withImage = await itemsApi.uploadItemImage(created.id, imageFile);
      } catch {
        // Item was created successfully even if the image upload failed;
        // surface nothing fatal here, the item just won't have a photo yet.
      }
    }
    setRawItems((prev) => [...prev, withImage]);
    return mapApiItemToUiItem(withImage);
  };

  const updateItem = async (id, payload) => {
    const updated = await itemsApi.updateItem(id, payload);
    setRawItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    return mapApiItemToUiItem(updated);
  };

  const deleteItem = async (id) => {
    await itemsApi.deleteItem(id);
    setRawItems((prev) => prev.filter((it) => it.id !== id));
  };

  const toggleItemStatus = async (id) => {
    const updated = await itemsApi.toggleItemStatus(id);
    setRawItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    return mapApiItemToUiItem(updated);
  };

  return {
    items,
    rawItems,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
  };
};
