import apiClient from "../../../shared/api/axiosClient.js";

export const listItems = async (params = {}) => {
  const { data } = await apiClient.get("/items", { params });
  return { items: data?.data || [], meta: data?.meta };
};

export const createItem = async (payload) => {
  const { data } = await apiClient.post("/items", payload);
  return data?.data;
};

export const getItem = async (id) => {
  const { data } = await apiClient.get(`/items/${id}`);
  return data?.data;
};

export const updateItem = async (id, payload) => {
  const { data } = await apiClient.put(`/items/${id}`, payload);
  return data?.data;
};

export const deleteItem = async (id) => {
  await apiClient.delete(`/items/${id}`);
};

export const toggleItemStatus = async (id) => {
  const { data } = await apiClient.post(`/items/${id}/toggle-status`);
  return data?.data;
};


export const getItemStockBalance = async (id) => {
  const { data } = await apiClient.get(`/items/${id}/stock-balance`);
  return data?.data;
};


export const getItemTransactions = async (id) => {
  const { data } = await apiClient.get(`/items/${id}/transactions`);
  return data?.data;
};

export const uploadItemImage = async (id, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post(`/items/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data;
};

export const removeItemImage = async (id) => {
  const { data } = await apiClient.delete(`/items/${id}/image`);
  return data?.data;
};
