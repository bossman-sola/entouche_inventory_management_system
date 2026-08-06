import { useState, useCallback, useEffect } from "react";
import apiClient from "../../../shared/api/axiosClient.js";


async function fetchAllPages(path, maxPages = 20) {
  let page = 1;
  let all = [];
  while (page <= maxPages) {
    const { data: json } = await apiClient.get(
      `${path}${path.includes("?") ? "&" : "?"}page=${page}`,
    );
    const data = Array.isArray(json?.data) ? json.data : [];
    all = all.concat(data);
    const lastPage = json?.meta?.last_page || 1;
    if (page >= lastPage) break;
    page += 1;
  }
  return all;
}

function errorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllPages("/transfers");
      setTransfers(data);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load transfers"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTransfer = useCallback(
    async (payload) => {
      const { data: json } = await apiClient.post("/transfers", payload);
      await load();
      return json?.data;
    },
    [load],
  );

  const runAction = useCallback(
    async (id, action, body) => {
      const { data: json } = await apiClient.post(
        `/transfers/${id}/${action}`,
        body,
      );
      await load();
      return json?.data;
    },
    [load],
  );

  const removeTransfer = useCallback(
    async (id) => {
      await apiClient.delete(`/transfers/${id}`);
      await load();
    },
    [load],
  );

  return {
    transfers,
    loading,
    error,
    reload: load,
    createTransfer,
    submitTransfer: (id) => runAction(id, "submit"),
    approveTransfer: (id) => runAction(id, "approve"),
    rejectTransfer: (id, reason) => runAction(id, "reject", { reason }),
    completeTransfer: (id) => runAction(id, "complete"),
    cancelTransfer: (id) => runAction(id, "cancel"),
    removeTransfer,
  };
}