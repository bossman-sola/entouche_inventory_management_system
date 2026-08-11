import {
  useState,
  useEffect,
  useCallback,
} from "react";

import * as itemsApi from "../api/itemsApi.js";
import { mapApiItemToUiItem } from "../api/itemsMapper.js";

export const useItems = (query = {}) => {
  const [rawItems, setRawItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [stats, setStats] = useState({
    total_items: 0,
    total_skus: 0,
    total_categories: 0,
    items_with_barcode: 0,
    barcode_percentage: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================================================
     FETCH ITEMS + GLOBAL STATS
  ======================================================= */

  const fetchItems = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        itemsResponse,
        statsResponse,
      ] = await Promise.all([
        itemsApi.listItems(params),
        itemsApi.getItemStats(),
      ]);

      setRawItems(
        itemsResponse?.items ?? []
      );

      setMeta(
        itemsResponse?.meta ?? null
      );

      setStats({
        total_items:
          Number(
            statsResponse?.total_items ?? 0
          ),

        total_skus:
          Number(
            statsResponse?.total_skus ?? 0
          ),

        total_categories:
          Number(
            statsResponse?.total_categories ?? 0
          ),

        items_with_barcode:
          Number(
            statsResponse?.items_with_barcode ?? 0
          ),

        barcode_percentage:
          Number(
            statsResponse?.barcode_percentage ?? 0
          ),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Couldn't load items."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(query);
  }, [fetchItems, JSON.stringify(query)]);

  /* =======================================================
     MAP API ITEMS TO UI ITEMS
  ======================================================= */

  const items = rawItems.map(
    (item) =>
      mapApiItemToUiItem(item)
  );

  /* =======================================================
     CREATE
  ======================================================= */

  const createItem = async (
    payload,
    imageFile
  ) => {
    const created =
      await itemsApi.createItem(payload);

    let withImage = created;

    if (imageFile) {
      try {
        withImage =
          await itemsApi.uploadItemImage(
            created.id,
            imageFile
          );
      } catch {
        // Item was created even if
        // the image upload failed.
      }
    }

    /*
     * Reload instead of manually appending.
     *
     * This keeps:
     * - pagination
     * - meta
     * - stats
     * - total_stock
     *
     * synchronized with the backend.
     */
    await fetchItems(query);

    return mapApiItemToUiItem(
      withImage
    );
  };

  /* =======================================================
     UPDATE
  ======================================================= */

  const updateItem = async (
    id,
    payload
  ) => {
    const updated =
      await itemsApi.updateItem(
        id,
        payload
      );

    await fetchItems(query);

    return mapApiItemToUiItem(
      updated
    );
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteItem = async (id) => {
    await itemsApi.deleteItem(id);

    await fetchItems(query);
  };

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  const toggleItemStatus = async (id) => {
    const updated =
      await itemsApi.toggleItemStatus(id);

    await fetchItems(query);

    return mapApiItemToUiItem(
      updated
    );
  };

  return {
    items,
    rawItems,
    meta,
    stats,

    isLoading,
    error,

    refetch: fetchItems,

    createItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
  };
};