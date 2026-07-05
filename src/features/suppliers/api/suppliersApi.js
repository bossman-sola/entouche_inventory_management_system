import apiClient from "../../../shared/api/axiosClient.js";

export const listSuppliers = async (params = {}) => {
  const { data } = await apiClient.get("/suppliers", { params });
  return data?.data || [];
};

export const createSupplier = async (payload) => {
  const { data } = await apiClient.post("/suppliers", payload);
  return data?.data;
};

export const getSupplier = async (id) => {
  const { data } = await apiClient.get(`/suppliers/${id}`);
  return data?.data;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await apiClient.put(`/suppliers/${id}`, payload);
  return data?.data;
};

export const deleteSupplier = async (id) => {
  await apiClient.delete(`/suppliers/${id}`);
};

export const toggleSupplierStatus = async (id) => {
  const { data } = await apiClient.post(`/suppliers/${id}/toggle-status`);
  return data?.data;
};
