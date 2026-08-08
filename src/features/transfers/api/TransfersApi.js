import apiClient from "../../../shared/api/axiosClient.js";

export const listTransfers = async (params = {}) => {
  const { data } = await apiClient.get("/transfers", {
    params,
  });

  return {
    transfers: data?.data ?? [],
    meta: data?.meta,
  };
};

export const getTransfer = async (id) => {
  const { data } = await apiClient.get(`/transfers/${id}`);
  return data?.data;
};

export const createTransfer = async (payload) => {
  const { data } = await apiClient.post("/transfers", payload);
  return data?.data;
};

export const updateTransfer = async (id, payload) => {
  const { data } = await apiClient.put(`/transfers/${id}`, payload);
  return data?.data;
};

export const deleteTransfer = async (id) => {
  await apiClient.delete(`/transfers/${id}`);
};

export const submitTransfer = async (id) => {
  const { data } = await apiClient.post(`/transfers/${id}/submit`);
  return data?.data;
};

export const approveTransfer = async (id) => {
  const { data } = await apiClient.post(`/transfers/${id}/approve`);
  return data?.data;
};

  export const completeTransfer = async (id) => {
  const { data } = await apiClient.post(
    `/transfers/${id}/complete`
  );

  return data?.data;
};

export const cancelTransfer = async (id) => {
  const { data } = await apiClient.post(
    `/transfers/${id}/cancel`
  );

  return data?.data;
};

export const rejectTransfer = async (id, reason) => {
  const { data } = await apiClient.post(`/transfers/${id}/reject`, {
    reason,
  });

  return data?.data;
};