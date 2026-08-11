import apiClient from "../../../shared/api/axiosClient.js";

const API_BASE_URL = (apiClient.defaults.baseURL || "").replace(
  /\/api\/v1\/?$/,
  ""
);

/* =======================================================
   ITEM TYPE HELPERS
======================================================= */

export const toApiItemType = (itemType) =>
  itemType ? itemType.toLowerCase() : undefined;

export const formatItemType = (itemType) => {
  switch (itemType) {
    case "stock_item":
      return "Stock Item";

    case "consumable":
      return "Consumable";

    default:
      return "Uncategorized";
  }
};

/* =======================================================
   FORM -> API
======================================================= */

export const mapFormToApiPayload = (formData) => ({
  name: formData.name,

  category_id: formData.categoryId
    ? Number(formData.categoryId)
    : undefined,

  unit_of_measure_id: formData.unitId
    ? Number(formData.unitId)
    : undefined,

  supplier_id: formData.supplierId
    ? Number(formData.supplierId)
    : undefined,

  barcode: formData.barcode || undefined,

  item_type: toApiItemType(formData.itemType),

  brand: formData.brand || undefined,

  model_number: formData.model || undefined,

  manufacturer: formData.manufacturer || undefined,

  description: formData.description || undefined,

  unit_cost:
    formData.unitCost !== "" &&
    formData.unitCost != null
      ? Number(formData.unitCost)
      : undefined,

  selling_price:
    formData.sellingPrice !== "" &&
    formData.sellingPrice != null
      ? Number(formData.sellingPrice)
      : undefined,

  reorder_level:
    formData.reorderLevel !== "" &&
    formData.reorderLevel != null
      ? Number(formData.reorderLevel)
      : undefined,

  status: "active",
});

/* =======================================================
   API -> UI
======================================================= */

export const mapApiItemToUiItem = (
  apiItem,
  { stockBalance } = {}
) => {
  const stock = Number(
    stockBalance?.total_on_hand ??
      apiItem.total_stock ??
      0
  );

  const reorderLevel =
    apiItem.reorder_level != null
      ? Number(apiItem.reorder_level)
      : null;

  let stockStatus = "In Stock";

  if (stock <= 0) {
    stockStatus = "Out of Stock";
  } else if (
    reorderLevel != null &&
    stock <= reorderLevel
  ) {
    stockStatus = "Low Stock";
  }

  return {
    id: apiItem.id,

    name: apiItem.name,

    sku: apiItem.sku || "",

    barcode: apiItem.barcode || "",

    category:
      apiItem.category?.name || "",

    categoryId:
      apiItem.category_id ??
      apiItem.category?.id ??
      "",

    uom: apiItem.unit
      ? `${apiItem.unit.name} (${(
          apiItem.unit.abbreviation || ""
        ).toUpperCase()})`
      : "",

    unitId:
      apiItem.unit_of_measure_id ??
      apiItem.unit?.id ??
      "",

    supplierId:
      apiItem.supplier_id ??
      apiItem.supplier?.id ??
      "",

    // IMPORTANT:
    // Item type comes from item_type,
    // NOT from the unit of measure.
    type: formatItemType(apiItem.item_type),

    itemType:
      apiItem.item_type || "",

    status:
      apiItem.status === "active"
        ? "Active"
        : "Inactive",

    brand:
      apiItem.brand || "",

    model:
      apiItem.model_number || "",

    manufacturer:
      apiItem.manufacturer || "",

    description:
      apiItem.description || "",

    unitCost:
      apiItem.unit_cost != null
        ? Number(apiItem.unit_cost)
        : null,

    sellingPrice:
      apiItem.selling_price != null
        ? Number(apiItem.selling_price)
        : null,

    reorderLevel,

    img: apiItem.image_path
      ? `${API_BASE_URL}/storage/${apiItem.image_path}`
      : null,

    stock,

    stockStatus,

    addedOn: apiItem.created_at
      ? new Date(
          apiItem.created_at
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",

    raw: apiItem,
  };
};