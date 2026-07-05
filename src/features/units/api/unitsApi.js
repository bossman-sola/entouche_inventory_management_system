import apiClient from "../../../shared/api/axiosClient.js";

export const listUnits = async (params = {}) => {
  const { data } = await apiClient.get("/units", { params });
  return data?.data || [];
};

export const createUnit = async (payload) => {
  const { data } = await apiClient.post("/units", payload);
  return data?.data;
};

export const getUnit = async (id) => {
  const { data } = await apiClient.get(`/units/${id}`);
  return data?.data;
};

export const updateUnit = async (id, payload) => {
  const { data } = await apiClient.put(`/units/${id}`, payload);
  return data?.data;
};

export const deleteUnit = async (id) => {
  await apiClient.delete(`/units/${id}`);
};

export const toggleUnitStatus = async (id) => {
  const { data } = await apiClient.post(`/units/${id}/toggle-status`);
  return data?.data;
};
