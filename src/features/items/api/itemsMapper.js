import apiClient from "../../../shared/api/axiosClient.js";


const API_BASE_URL = (apiClient.defaults.baseURL || "").replace(/\/api\/v1\/?$/, "");


export const ITEM_TYPE_MAP = {
  "Stock Item": "stock_item",
  Consumable: "consumable",
};

export const ITEM_TYPE_REVERSE_MAP = {
  stock_item: "Stock Item",
  consumable: "Consumable",
  product: "Stock Item", 
};

export const toApiItemType = (label) => ITEM_TYPE_MAP[label] || "stock_item";
export const toUiItemType = (value) => ITEM_TYPE_REVERSE_MAP[value] || value;


export const mapFormToApiPayload = (formData) => ({
  name: formData.name,
  category_id: formData.categoryId ? Number(formData.categoryId) : undefined,
  unit_of_measure_id: formData.unitId ? Number(formData.unitId) : undefined,
  supplier_id: formData.supplierId ? Number(formData.supplierId) : undefined,
  barcode: formData.barcode || undefined,
  item_type: toApiItemType(formData.itemType),
  brand: formData.brand || undefined,
  description: formData.description || undefined,
  unit_cost: formData.unitCost !== "" && formData.unitCost != null ? Number(formData.unitCost) : undefined,
  selling_price:
    formData.sellingPrice !== "" && formData.sellingPrice != null ? Number(formData.sellingPrice) : undefined,
  reorder_level:
    formData.reorderLevel !== "" && formData.reorderLevel != null ? Number(formData.reorderLevel) : undefined,
  status: "active",
});


export const mapApiItemToUiItem = (apiItem, { stockBalance } = {}) => {
  const stock = stockBalance?.total_on_hand ?? 0;
  const reorderLevel = apiItem.reorder_level != null ? Number(apiItem.reorder_level) : null;

  let stockStatus = "In Stock";
  if (stock <= 0) stockStatus = "Out of Stock";
  else if (reorderLevel != null && stock <= reorderLevel) stockStatus = "Low Stock";

  return {
    id: apiItem.id,
    name: apiItem.name,
    sku: apiItem.sku || "",
    barcode: apiItem.barcode || "",
    category: apiItem.category?.name || "",
    categoryId: apiItem.category_id ?? apiItem.category?.id ?? "",
    uom: apiItem.unit ? `${apiItem.unit.name} (${(apiItem.unit.abbreviation || "").toUpperCase()})` : "",
    unitId: apiItem.unit_of_measure_id ?? apiItem.unit?.id ?? "",
    supplierId: apiItem.supplier_id ?? apiItem.supplier?.id ?? "",
    type: toUiItemType(apiItem.item_type),
    status: apiItem.status === "active" ? "Active" : "Inactive",
    brand: apiItem.brand || "",
    description: apiItem.description || "",
    unitCost: apiItem.unit_cost != null ? Number(apiItem.unit_cost) : null,
    sellingPrice: apiItem.selling_price != null ? Number(apiItem.selling_price) : null,
    reorderLevel,
    img: apiItem.image_path ? `${API_BASE_URL}/storage/${apiItem.image_path}` : null,
    stock,
    stockStatus,
    addedOn: apiItem.created_at
      ? new Date(apiItem.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "",
    raw: apiItem,
  };
};
