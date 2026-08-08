import {
  useCallback,
  useEffect,
  useState,
} from "react";

import * as TransferApi from "../api/TransfersApi.js";

function errorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const response =
          await TransferApi.listTransfers();

        if (cancelled) {
          return;
        }

        setTransfers(
          response?.transfers ?? []
        );

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          errorMessage(
            err,
            "Couldn't load transfers"
          )
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     RELOAD
  ======================================================= */

  const reload = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await TransferApi.listTransfers(params);

      setTransfers(
        response?.transfers ?? []
      );

      return response;
    } catch (err) {
      setError(
        errorMessage(
          err,
          "Couldn't load transfers"
        )
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  const createTransfer = useCallback(
    async (payload) => {
      const created =
        await TransferApi.createTransfer(
          payload
        );

      await reload();

      return created;
    },
    [reload]
  );

  /* =======================================================
     SUBMIT
  ======================================================= */

  const submitTransfer = useCallback(
    async (id) => {
      const result =
        await TransferApi.submitTransfer(id);

      await reload();

      return result;
    },
    [reload]
  );

  /* =======================================================
     APPROVE
  ======================================================= */

  const approveTransfer = useCallback(
    async (id) => {
      const result =
        await TransferApi.approveTransfer(id);

      await reload();

      return result;
    },
    [reload]
  );

  /* =======================================================
     REJECT
  ======================================================= */

  const rejectTransfer = useCallback(
    async (id, reason) => {
      const result =
        await TransferApi.rejectTransfer(
          id,
          reason
        );

      await reload();

      return result;
    },
    [reload]
  );

  /* =======================================================
     COMPLETE
  ======================================================= */

  const completeTransfer = useCallback(
    async (id) => {
      const result =
        await TransferApi.completeTransfer(id);

      await reload();

      return result;
    },
    [reload]
  );

  /* =======================================================
     CANCEL
  ======================================================= */

  const cancelTransfer = useCallback(
    async (id) => {
      const result =
        await TransferApi.cancelTransfer(id);

      await reload();

      return result;
    },
    [reload]
  );

  /* =======================================================
     DELETE
  ======================================================= */

  const removeTransfer = useCallback(
    async (id) => {
      await TransferApi.deleteTransfer(id);

      await reload();
    },
    [reload]
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    transfers,
    loading,
    error,
    reload,

    createTransfer,
    submitTransfer,
    approveTransfer,
    rejectTransfer,
    completeTransfer,
    cancelTransfer,
    removeTransfer,
  };
}