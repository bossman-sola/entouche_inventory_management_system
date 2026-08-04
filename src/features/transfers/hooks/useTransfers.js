import { useState, useCallback, useEffect } from "react";
import { apiRequest, fetchAllPages } from "../api/Client.js";
export function useTransfers(token) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try { 
      const data = await fetchAllPages("/transfers", token);
      setTransfers(data);
    } catch (err) {
      setError(err.message || "Couldn't load transfers");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const createTransfer = useCallback(async (payload) => {
    const json = await apiRequest("/transfers", token, { method: "POST", body: JSON.stringify(payload) });
    await load();
    return json?.data;
  }, [token, load]);

  const runAction = useCallback(async (id, action, body) => {
    const json = await apiRequest(`/transfers/${id}/${action}`, token, {
      method: "POST",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    await load();
    return json?.data;
  }, [token, load]);

  const removeTransfer = useCallback(async (id) => {
    await apiRequest(`/transfers/${id}`, token, { method: "DELETE" });
    await load();
  }, [token, load]);

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
