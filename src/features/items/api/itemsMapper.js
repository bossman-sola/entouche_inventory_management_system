import { resolveItemImageUrl } from "./itemsApi.js"

// ASSUMPTION: the API's `item_type` column only demonstrated "product" in the
// docs. Mapping the UI's two options to likely backend values below —
// confirm the real accepted enum values with your backend team and adjust
// this map if "consumable" isn't actually valid.
export const UI_TO_API_ITEM_TYPE = {
  "Stock Item": "product",
  Consumable: "consumable",
}

export const API_TO_UI_ITEM_TYPE = Object.fromEntries(
  Object.entries(UI_TO_API_ITEM_TYPE).map(([ui, api]) => [api, ui])
)

function sumStockBalances(stockBalances) {
  if (!Array.isArray(stockBalances) || stockBalances.length === 0) return 0
  return stockBalances.reduce((sum, b) => sum + Number(b.quantity ?? b.on_hand ?? 0), 0)
}

function formatDate(isoString) {
  if (!isoString) return "—"
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Converts a raw API item (as returned by GET /items, /items/{id}, etc.)
 * into the flat shape the existing Items UI already expects.
 */
export function mapApiItemToUi(apiItem) {
  const stock = sumStockBalances(apiItem.stock_balances)
  return {
    id: apiItem.id,
    name: apiItem.name,
    sku: apiItem.sku,
    barcode: apiItem.barcode || "",
    category: apiItem.category?.name || "Uncategorized",
    categoryId: apiItem.category_id,
    uom: apiItem.unit
      ? `${apiItem.unit.name} (${(apiItem.unit.abbreviation || "").toUpperCase()})`
      : "—",
    unitId: apiItem.unit_of_measure_id,
    supplierId: apiItem.supplier_id,
    type: API_TO_UI_ITEM_TYPE[apiItem.item_type] || "Stock Item",
    status: apiItem.status === "active" ? "Active" : "Inactive",
    stock,
    stockStatus: stock <= 0 ? "Out of Stock" : "In Stock",
    img: resolveItemImageUrl(apiItem.image_path) || "📦",
    brand: apiItem.brand || "",
    model: "", // not supported by the API — kept for UI compatibility only
    weight: "", // not supported by the API — kept for UI compatibility only
    description: apiItem.description || "",
    unitCost: apiItem.unit_cost,
    sellingPrice: apiItem.selling_price,
    reorderLevel: apiItem.reorder_level,
    addedOn: formatDate(apiItem.created_at),
    raw: apiItem,
  }
}

/**
 * Converts the Add/Edit item form state into the payload the API expects.
 * `categoryId`, `unitId`, `supplierId` should be real IDs selected from
 * dropdowns backed by the categories/units/suppliers endpoints.
 */
export function mapFormToApiPayload(form) {
  const payload = {
    name: form.name,
    category_id: form.categoryId ? Number(form.categoryId) : undefined,
    unit_of_measure_id: form.unitId ? Number(form.unitId) : undefined,
    item_type: UI_TO_API_ITEM_TYPE[form.itemType] || "product",
    status: "active",
  }

  if (form.supplierId) payload.supplier_id = Number(form.supplierId)
  if (form.barcode) payload.barcode = form.barcode
  if (form.brand) payload.brand = form.brand
  if (form.description) payload.description = form.description
  if (form.unitCost !== undefined && form.unitCost !== "") payload.unit_cost = Number(form.unitCost)
  if (form.sellingPrice !== undefined && form.sellingPrice !== "")
    payload.selling_price = Number(form.sellingPrice)
  if (form.reorderLevel !== undefined && form.reorderLevel !== "")
    payload.reorder_level = Number(form.reorderLevel)

  return payload
}