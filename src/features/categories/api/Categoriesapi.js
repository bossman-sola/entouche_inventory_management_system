import apiClient from "../../../shared/api/axiosClient.js";

export const listCategories = async (params = {}) => {
  const { data } = await apiClient.get("/categories", { params });
  return data?.data || [];
};

export const createCategory = async (payload) => {
  const { data } = await apiClient.post("/categories", payload);
  return data?.data;
};

export const getCategory = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}`);
  return data?.data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await apiClient.put(`/categories/${id}`, payload);
  return data?.data;
};

export const deleteCategory = async (id) => {
  await apiClient.delete(`/categories/${id}`);
};

export const toggleCategoryStatus = async (id) => {
  const { data } = await apiClient.post(`/categories/${id}/toggle-status`);
  return data?.data;
};
