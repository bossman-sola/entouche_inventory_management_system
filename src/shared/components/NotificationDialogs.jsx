import React, {
  useEffect,
  useState,
} from "react";

import {
  getTransfer,
} from "../../features/transfers/api/TransfersApi.js";

import { api } from "../api/entoucheApi";

import {
  mapApiReceipt,
  mapApiReceiptForApproval,
  mapApiTransferApproved,
  mapApiAdjustmentPending,
} from "../api/mappers.js";

import AlertDialog from "../layouts/dialogs/Alertdialog";
import ReceiptCompletedDialog from "../layouts/dialogs/ReceiptCompletedDialog";
import ReceiptCancelledDialog from "../layouts/dialogs/ReceiptCancelledDialog";
import NewReceiptApprovalDialog from "../layouts/dialogs/NewReceiptApprovalDialog";
import ReceiptApprovedDialog from "../layouts/dialogs/ReceiptApprovedDialog";

import TransferApprovedDialog from "../layouts/dialogs/TransferApprovedDialog";
import TransferCompletedDialog from "../layouts/dialogs/TransferCompletedDialog";
import TransferRejectedDialog from "../layouts/dialogs/TransferRejectedDialog";
import TransferPendingApprovalDialog from "../layouts/dialogs/TransferPendingApprovalDialog";

import AdjustmentPendingDialog from "../layouts/dialogs/AdjustmentPendingDialog";
import AdjustmentApprovedDialog from "../layouts/dialogs/AdjustmentApprovedDialog";
import AdjustmentCancelledDialog from "../layouts/dialogs/AdjustmentCancelledDialog";
import AdjustmentRejectedDialog from "../layouts/dialogs/AdjustmentRejectedDialog";

import StockCountVarianceDialog from "../layouts/dialogs/StockCountVarianceDialog";
import StockCountEventDialog from "../layouts/dialogs/StockCountEventDialog";

import UserCreatedDialog from "../layouts/dialogs/UserCreatedDialog";
import SystemMaintenanceDialog from "../layouts/dialogs/SystemMaintenanceDialog";

import ImportCompletedDialog from "../layouts/dialogs/ImportCompletedDialog";
import ImportFailedDialog from "../layouts/dialogs/ImportFailedDialog";

export default function NotificationDialogs({
  activeDialog,
  onClose,
  onNavigate,
}) {
  const goTo = (path) => {
    onClose();
    onNavigate(path);
  };

  /**
  * ========================================================
  * HELPER: GET ADJUSTMENT ID FROM NOTIFICATION DIALOG
  * ========================================================
  */
  const getAdjustmentIdFromDialog = () =>
    activeDialog?.adjustmentId ??
    activeDialog?.adjustment_id ??
    activeDialog?.data?.adjustmentId ??
    activeDialog?.data?.adjustment_id ??
    activeDialog?.data?.data?.adjustmentId ??
    activeDialog?.data?.data?.adjustment_id ??
    null;

  const [
    rejectedAdjustmentData,
    setRejectedAdjustmentData,
  ] = useState(null);

  const [
    loadingRejectedAdjustment,
    setLoadingRejectedAdjustment,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRejectedAdjustment() {
      if (
        activeDialog?.type !==
        "adjustment_rejected"
      ) {
        setRejectedAdjustmentData(null);
        return;
      }

      const adjustmentId =
        getAdjustmentIdFromDialog();

      if (!adjustmentId) {
        console.error(
          "Adjustment Rejected notification is missing adjustment_id",
          activeDialog,
        );

        return;
      }

      try {
        setLoadingRejectedAdjustment(true);

        const adjustment =
          await api.getAdjustment(
            adjustmentId
          );

        if (cancelled) return;

        setRejectedAdjustmentData(
          adjustment
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load rejected adjustment:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRejectedAdjustment(
            false
          );
        }
      }
    }

    loadRejectedAdjustment();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.adjustmentId,
    activeDialog?.adjustment_id,
    activeDialog?.data?.adjustmentId,
    activeDialog?.data?.adjustment_id,
    activeDialog?.data?.data?.adjustmentId,
    activeDialog?.data?.data?.adjustment_id,
  ]);

  const [
    cancelledAdjustmentData,
    setCancelledAdjustmentData,
  ] = useState(null);

  const [
    loadingCancelledAdjustment,
    setLoadingCancelledAdjustment,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCancelledAdjustment() {
      if (
        activeDialog?.type !==
        "adjustment_cancelled"
      ) {
        setCancelledAdjustmentData(
          null
        );
        return;
      }

      const adjustmentId =
        getAdjustmentIdFromDialog();

      if (!adjustmentId) {
        console.error(
          "Adjustment Cancelled notification is missing adjustment_id",
          activeDialog,
        );

        return;
      }

      try {
        setLoadingCancelledAdjustment(
          true
        );

        const adjustment =
          await api.getAdjustment(
            adjustmentId
          );

        if (cancelled) return;

        setCancelledAdjustmentData(
          adjustment
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load cancelled adjustment:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCancelledAdjustment(
            false
          );
        }
      }
    }

    loadCancelledAdjustment();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.adjustmentId,
    activeDialog?.adjustment_id,
    activeDialog?.data?.adjustmentId,
    activeDialog?.data?.adjustment_id,
    activeDialog?.data?.data?.adjustmentId,
    activeDialog?.data?.data?.adjustment_id,
  ]);

  /**
   * ========================================================
   * APPROVED ADJUSTMENT STATE
   * 
   */
  const [
    approvedAdjustmentData,
    setApprovedAdjustmentData,
  ] = useState(null);

  const [
    loadingApprovedAdjustment,
    setLoadingApprovedAdjustment,
  ] = useState(false);


  /**
   * ========================================================
   * LOAD APPROVED ADJUSTMENT
   * ========================================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadApprovedAdjustment() {
      if (
        activeDialog?.type !==
        "adjustment_approved"
      ) {
        setApprovedAdjustmentData(null);
        return;
      }

      const adjustmentId =
        getAdjustmentIdFromDialog();

      if (!adjustmentId) {
        console.error(
          "Adjustment Approved notification is missing adjustment_id",
          activeDialog,
        );

        return;
      }

      try {
        setLoadingApprovedAdjustment(
          true,
        );

        const adjustment =
          await api.getAdjustment(
            adjustmentId,
          );

        if (cancelled) return;

        setApprovedAdjustmentData(
          adjustment,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load approved adjustment:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingApprovedAdjustment(
            false,
          );
        }
      }
    }

    loadApprovedAdjustment();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.adjustmentId,
    activeDialog?.adjustment_id,
    activeDialog?.data?.adjustmentId,
    activeDialog?.data?.adjustment_id,
    activeDialog?.data?.data?.adjustmentId,
    activeDialog?.data?.data?.adjustment_id,
  ]);

  /**
   * =========================================================
   * ADJUSTMENT PENDING APPROVAL STATE
   * =========================================================
   */
  const [
    pendingAdjustmentData,
    setPendingAdjustmentData,
  ] = useState(null);

  const [
    loadingPendingAdjustment,
    setLoadingPendingAdjustment,
  ] = useState(false);

  const [
    actioningPendingAdjustment,
    setActioningPendingAdjustment,
  ] = useState(false);

  /**
   * ========================================================
   * LOAD PENDING ADJUSTMENT
   * ========================================================ƒ
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPendingAdjustment() {
      if (
        activeDialog?.type !==
        "adjustment_pending"
      ) {
        setPendingAdjustmentData(null);
        return;
      }

      const adjustmentId =
        getAdjustmentIdFromDialog();

      if (!adjustmentId) {
        console.error(
          "Adjustment Pending notification is missing adjustment_id",
          activeDialog,
        );

        setPendingAdjustmentData(null);
        return;
      }

      try {
        setLoadingPendingAdjustment(true);

        const adjustment =
          await api.getAdjustment(
            adjustmentId,
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapApiAdjustmentPending(
            adjustment,
          );

        setPendingAdjustmentData(
          mapped,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load pending adjustment:",
            error,
          );

          setPendingAdjustmentData(
            null,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPendingAdjustment(
            false,
          );
        }
      }
    }

    loadPendingAdjustment();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.adjustmentId,
    activeDialog?.adjustment_id,
    activeDialog?.data?.adjustmentId,
    activeDialog?.data?.adjustment_id,
    activeDialog?.data?.data?.adjustmentId,
    activeDialog?.data?.data?.adjustment_id,
  ]);

  const getReceiptIdFromDialog = () =>
    activeDialog?.receiptId ??
    activeDialog?.receipt_id ??
    activeDialog?.data?.receiptId ??
    activeDialog?.data?.receipt_id ??
    activeDialog?.data?.data?.receiptId ??
    activeDialog?.data?.data?.receipt_id ??
    null;

  const [
    approvedReceiptData,
    setApprovedReceiptData,
  ] = useState(null);

  const [
    loadingApprovedReceipt,
    setLoadingApprovedReceipt,
  ] = useState(false);

  const [
    receivingApprovedReceipt,
    setReceivingApprovedReceipt,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadApprovedReceipt() {
      if (
        activeDialog?.type !==
        "receipt_approved"
      ) {
        setApprovedReceiptData(null);
        return;
      }

      const receiptId =
        getReceiptIdFromDialog();

      if (!receiptId) {
        console.error(
          "Receipt Approved notification is missing receipt_id",
          activeDialog
        );

        setApprovedReceiptData(null);
        return;
      }

      try {
        setLoadingApprovedReceipt(true);

        const receipt =
          await api.getReceipt(
            receiptId
          );

        if (cancelled) return;

        setApprovedReceiptData(
          receipt
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load approved receipt:",
            error
          );

          setApprovedReceiptData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingApprovedReceipt(
            false
          );
        }
      }
    }

    loadApprovedReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.receiptId,
    activeDialog?.receipt_id,
    activeDialog?.data?.receiptId,
    activeDialog?.data?.receipt_id,
    activeDialog?.data?.data?.receiptId,
    activeDialog?.data?.data?.receipt_id,
  ]);

  const [
    cancelledReceiptData,
    setCancelledReceiptData,
  ] = useState(null);

  const [
    loadingCancelledReceipt,
    setLoadingCancelledReceipt,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCancelledReceipt() {
      if (
        activeDialog?.type !==
        "receipt_cancelled"
      ) {
        setCancelledReceiptData(null);
        return;
      }

      const receiptId =
        getReceiptIdFromDialog();

      if (!receiptId) {
        console.error(
          "Receipt Cancelled notification is missing receipt_id",
          activeDialog
        );

        setCancelledReceiptData(null);
        return;
      }

      try {
        setLoadingCancelledReceipt(
          true
        );

        const receipt =
          await api.getReceipt(
            receiptId
          );

        if (cancelled) {
          return;
        }

        setCancelledReceiptData(
          receipt
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load cancelled receipt:",
            error
          );

          setCancelledReceiptData(
            null
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCancelledReceipt(
            false
          );
        }
      }
    }

    loadCancelledReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.receiptId,
    activeDialog?.receipt_id,
    activeDialog?.data?.receiptId,
    activeDialog?.data?.receipt_id,
    activeDialog?.data?.data?.receiptId,
    activeDialog?.data?.data?.receipt_id,
  ]);

  /*
   * =========================================================
   * RECEIPT COMPLETED STATE
   * =========================================================
   */

  const [
    completedReceiptData,
    setCompletedReceiptData,
  ] = useState(null);

  const [
    loadingCompletedReceipt,
    setLoadingCompletedReceipt,
  ] = useState(false);

  /*
   * =========================================================
   * RECEIPT AWAITING APPROVAL STATE
   * =========================================================
   */

  const [
    pendingReceiptData,
    setPendingReceiptData,
  ] = useState(null);

  const [
    loadingPendingReceipt,
    setLoadingPendingReceipt,
  ] = useState(false);

  /*
   * =========================================================
   * TRANSFER AWAITING APPROVAL STATE
   * ========================================================= 
   */

  const [
    pendingTransferData,
    setPendingTransferData,
  ] = useState(null);

  const [
    loadingPendingTransfer,
    setLoadingPendingTransfer,
  ] = useState(false);

  const [
    actioningPendingTransfer,
    setActioningPendingTransfer,
  ] = useState(false);

  /**
  * =========================================================
  * LOAD PENDING TRANSFER
  * =========================================================
  */
  useEffect(() => {
    let cancelled = false;

    async function loadPendingTransfer() {
      if (
        activeDialog?.type !==
        "transfer_pending"
      ) {
        setPendingTransferData(null);
        return;
      }

      const transferId =
        activeDialog?.transferId ??
        activeDialog?.data
          ?.transferId ??
        activeDialog?.data
          ?.transfer_id ??
        activeDialog?.data?.data
          ?.transferId ??
        activeDialog?.data?.data
          ?.transfer_id;

      if (!transferId) {
        console.error(
          "Transfer Pending Approval notification is missing transfer_id",
          activeDialog,
        );

        return;
      }

      try {
        setLoadingPendingTransfer(
          true,
        );

        const transfer =
          await getTransfer(
            transferId,
          );

        if (cancelled) {
          return;
        }

        setPendingTransferData(
          transfer,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load pending transfer:",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPendingTransfer(
            false,
          );
        }
      }
    }

    loadPendingTransfer();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.transferId,
    activeDialog?.data?.transferId,
    activeDialog?.data?.transfer_id,
    activeDialog?.data?.data
      ?.transferId,
    activeDialog?.data?.data
      ?.transfer_id,
  ]);


  /*
   * =========================================================
   * TRANSFER COMPLETED STATE
   * =========================================================
   */

  const [
    completedTransferData,
    setCompletedTransferData,
  ] = useState(null);

  const [
    loadingCompletedTransfer,
    setLoadingCompletedTransfer,
  ] = useState(false);

  /*
   * =========================================================
   * TRANSFER REJECTED STATE
   * =========================================================
   */

  const [
    rejectedTransferData,
    setRejectedTransferData,
  ] = useState(null);

  const [
    loadingRejectedTransfer,
    setLoadingRejectedTransfer,
  ] = useState(false);

  const getTransferIdFromDialog = () =>
    activeDialog?.transferId ??
    activeDialog?.data?.transferId ??
    activeDialog?.data?.transfer_id ??
    activeDialog?.data?.data?.transferId ??
    activeDialog?.data?.data?.transfer_id ??
    null;

  /*
   * =========================================================
   * IMPORT HELPERS
   * =========================================================
   */

  const getImportRecordId = () =>
    activeDialog?.data?.importData?.recordId ??
    activeDialog?.data?.importInfo?.recordId ??
    null;

  const handleViewImportLog = () => {
    const recordId =
      getImportRecordId();

    if (!recordId) {
      goTo("/data");
      return;
    }

    goTo(
      `/data?import=${recordId}`,
    );
  };

  const handleDownloadImportErrorReport =
    async () => {
      const recordId =
        getImportRecordId();

      if (!recordId) {
        console.error(
          "Cannot download error report: import ID is missing.",
        );
        return;
      }

      try {
        await api.downloadImportErrorReport(
          recordId,
        );
      } catch (error) {
        console.error(
          "Failed to download import error report:",
          error,
        );
      }
    };

  /*
   * =========================================================
   * COMPLETED RECEIPT DIALOG DATA
   * =========================================================
   */

  const completedReceiptDialogData =
    completedReceiptData
      ? {
        receipt: {
          number:
            completedReceiptData.no ||
            "—",

          completedOn:
            completedReceiptData.receivedAt ||
            "—",

          receivedBy:
            completedReceiptData.receivedBy ||
            "—",

          supplier:
            completedReceiptData.supplier ||
            "—",

          warehouse:
            completedReceiptData.warehouse ||
            "—",

          type:
            "Standard Receipt",
        },

        items: (
          completedReceiptData.items ||
          []
        ).map((item) => {
          const qty =
            Number(
              item.qty || 0,
            );

          const unitCost =
            Number(
              item.cost ??
              item.unitCost ??
              0,
            );

          return {
            id:
              item.id,

            name:
              item.name || "—",

            sku:
              item.sku || "—",

            cat:
              item.cat || "",

            qty,

            unit:
              item.unit || "",

            unitCost,

            totalCost:
              qty * unitCost,

            location:
              item.location || "",
          };
        }),

        totals: {
          items:
            completedReceiptData.items
              ?.length || 0,

          qty:
            (
              completedReceiptData.items ||
              []
            ).reduce(
              (sum, item) =>
                sum +
                Number(
                  item.qty || 0,
                ),
              0,
            ),

          amount:
            (
              completedReceiptData.items ||
              []
            ).reduce(
              (sum, item) =>
                sum +
                Number(
                  item.qty || 0,
                ) *
                Number(
                  item.cost ??
                  item.unitCost ??
                  0,
                ),
              0,
            ),
        },

        inventoryUpdates:
          (
            completedReceiptData.items ||
            []
          ).map((item) => ({
            location:
              item.location ||
              completedReceiptData.storageLocation ||
              completedReceiptData.receivingLocation ||
              "—",

            zone:
              completedReceiptData.warehouse ||
              "",

            received:
              Number(
                item.qty || 0,
              ),

            /*
             * These are intentionally unavailable
             * until we load the actual inventory
             * transaction balance_before /
             * balance_after values.
             */
            previousStock:
              null,

            newStock:
              null,
          })),

        notes:
          completedReceiptData.notes ||
          "",
      }
      : null;

  /*
   * =========================================================
   * LOAD COMPLETED RECEIPT
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCompletedReceipt() {
      if (
        activeDialog?.type !==
        "receipt_completed"
      ) {
        setCompletedReceiptData(
          null,
        );

        return;
      }

      const receiptId =
        activeDialog?.receiptId ??
        activeDialog?.data
          ?.receiptId ??
        activeDialog?.data
          ?.receipt_id ??
        activeDialog?.data?.data
          ?.receipt_id ??
        activeDialog?.data?.data
          ?.receiptId;

      if (!receiptId) {
        console.error(
          "Receipt Completed notification is missing receipt_id",
          activeDialog,
        );

        setCompletedReceiptData(
          null,
        );

        return;
      }

      try {
        setLoadingCompletedReceipt(
          true,
        );

        const receipt =
          await api.getReceipt(
            receiptId,
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapApiReceipt(receipt);

        setCompletedReceiptData(
          mapped,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load completed receipt:",
            error,
          );

          setCompletedReceiptData(
            null,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCompletedReceipt(
            false,
          );
        }
      }
    }

    loadCompletedReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.receiptId,
    activeDialog?.data?.receiptId,
    activeDialog?.data?.receipt_id,
    activeDialog?.data?.data
      ?.receipt_id,
    activeDialog?.data?.data
      ?.receiptId,
  ]);

  /*
   * =========================================================
   * LOAD RECEIPT AWAITING APPROVAL
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadPendingReceipt() {
      if (
        activeDialog?.type !==
        "new_receipt_awaiting_approval"
      ) {
        setPendingReceiptData(
          null,
        );

        return;
      }

      const receiptId =
        activeDialog?.receiptId ??
        activeDialog?.data
          ?.receiptId ??
        activeDialog?.data
          ?.receipt_id ??
        activeDialog?.data?.data
          ?.receiptId ??
        activeDialog?.data?.data
          ?.receipt_id;

      if (!receiptId) {
        console.error(
          "New Receipt Awaiting Approval notification is missing receipt_id",
          activeDialog,
        );

        setPendingReceiptData(
          null,
        );

        return;
      }

      try {
        setLoadingPendingReceipt(
          true,
        );

        /*
         * Fetch the complete receipt rather than
         * trying to populate the dialog from the
         * notification itself.
         */
        const receipt =
          await api.getReceipt(
            receiptId,
          );

        if (cancelled) {
          return;
        }

        /*
         * This mapper already returns exactly the
         * shape expected by NewReceiptApprovalDialog:
         *
         * {
         *   receipt,
         *   items,
         *   totals,
         *   reference,
         *   notes,
         *   workflowSteps
         * }
         */
        const mapped =
          mapApiReceiptForApproval(
            receipt,
          );

        setPendingReceiptData(
          mapped,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load receipt awaiting approval:",
            error,
          );

          setPendingReceiptData(
            null,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPendingReceipt(
            false,
          );
        }
      }
    }

    loadPendingReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.receiptId,
    activeDialog?.data?.receiptId,
    activeDialog?.data?.receipt_id,
    activeDialog?.data?.data
      ?.receiptId,
    activeDialog?.data?.data
      ?.receipt_id,
  ]);

  /*
   * =========================================================
   * LOAD COMPLETED TRANSFER
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCompletedTransfer() {
      if (
        activeDialog?.type !==
        "transfer_completed"
      ) {
        setCompletedTransferData(
          null,
        );

        return;
      }

      const transferId =
        activeDialog?.data
          ?.transferId ??
        activeDialog?.data
          ?.transfer_id ??
        activeDialog?.transferId ??
        null;

      if (!transferId) {
        console.error(
          "Transfer completed notification is missing transfer ID.",
          activeDialog,
        );

        setCompletedTransferData(
          null,
        );

        return;
      }

      setLoadingCompletedTransfer(
        true,
      );

      try {
        const transfer =
          await getTransfer(
            transferId,
          );

        if (cancelled) {
          return;
        }

        const mapped =
          mapApiTransferApproved(
            transfer,
          );

        setCompletedTransferData(
          mapped,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load completed transfer:",
            error,
          );

          setCompletedTransferData(
            null,
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCompletedTransfer(
            false,
          );
        }
      }
    }

    loadCompletedTransfer();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog,
  ]);

  /*
   * =========================================================
   * LOAD REJECTED TRANSFER
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadRejectedTransfer() {
      if (
        activeDialog?.type !==
        "transfer_rejected"
      ) {
        setRejectedTransferData(null);
        return;
      }

      const transferId =
        getTransferIdFromDialog();

      if (!transferId) {
        console.error(
          "Transfer Rejected notification is missing transfer_id",
          activeDialog,
        );

        setRejectedTransferData(null);
        return;
      }

      try {
        setLoadingRejectedTransfer(true);

        const transfer =
          await getTransfer(transferId);

        if (cancelled) {
          return;
        }

        setRejectedTransferData(
          transfer,
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load rejected transfer:",
            error,
          );

          setRejectedTransferData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingRejectedTransfer(false);
        }
      }
    }

    loadRejectedTransfer();

    return () => {
      cancelled = true;
    };
  }, [
    activeDialog?.type,
    activeDialog?.transferId,
    activeDialog?.data?.transferId,
    activeDialog?.data?.transfer_id,
    activeDialog?.data?.data?.transferId,
    activeDialog?.data?.data?.transfer_id,
  ]);


  /*
   * =========================================================
   * APPROVE RECEIPT FROM NOTIFICATION
   * =========================================================
   */

  const handleApprovePendingReceipt =
    async () => {
      const receiptId =
        activeDialog?.receiptId ??
        activeDialog?.data
          ?.receiptId ??
        activeDialog?.data
          ?.receipt_id ??
        activeDialog?.data?.data
          ?.receiptId ??
        activeDialog?.data?.data
          ?.receipt_id;

      if (!receiptId) {
        console.error(
          "Cannot approve receipt: receipt ID is missing.",
        );

        return;
      }

      try {
        setLoadingPendingReceipt(
          true,
        );

        await api.approveReceipt(
          receiptId,
        );

        /*
         * Close the notification dialog once
         * approval succeeds.
         */
        onClose();
      } catch (error) {
        console.error(
          "Failed to approve receipt:",
          error,
        );
      } finally {
        setLoadingPendingReceipt(
          false,
        );
      }
    };

  return (
    <>
      {/* LOW STOCK */}
      <AlertDialog
        isOpen={
          activeDialog?.type ===
          "low_stock_alert"
        }
        variant="low_stock"
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "low_stock_alert"
            ? activeDialog.data
            : {}
        )}
        onCreateReceipt={() =>
          goTo("/receipts")
        }
        onTransferStock={() =>
          goTo("/transfers")
        }
        onAdjustStock={() =>
          goTo("/adjustments")
        }
        onViewStockHistory={
          onClose
        }
      />

      {/* REORDER LEVEL */}
      <AlertDialog
        isOpen={
          activeDialog?.type ===
          "reorder_level_reached"
        }
        variant="reorder"
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "reorder_level_reached"
            ? activeDialog.data
            : {}
        )}
        onCreateReceipt={() =>
          goTo("/receipts")
        }
        onAdjustStock={() =>
          goTo("/adjustments")
        }
        onViewStockHistory={
          onClose
        }
      />

      <ReceiptApprovedDialog
        isOpen={
          activeDialog?.type ===
          "receipt_approved"
        }
        onClose={onClose}
        receipt={
          approvedReceiptData || {}
        }
        loading={
          loadingApprovedReceipt
        }
        onViewDetails={() => {
          const receiptId =
            getReceiptIdFromDialog();

          if (receiptId) {
            goTo(
              `/receipts?receipt=${receiptId}`
            );
          } else {
            goTo("/receipts");
          }
        }}
        onReceive={async () => {
          const receiptId =
            getReceiptIdFromDialog();

          if (!receiptId) {
            console.error(
              "Cannot receive receipt: receipt ID missing"
            );
            return;
          }

          try {
            setReceivingApprovedReceipt(
              true
            );

            await api.receiveReceipt(
              receiptId
            );

            onClose();
          } catch (error) {
            console.error(
              "Failed to receive receipt:",
              error
            );
          } finally {
            setReceivingApprovedReceipt(
              false
            );
          }
        }}
      />

      <ReceiptCancelledDialog
        isOpen={
          activeDialog?.type ===
          "receipt_cancelled"
        }
        onClose={onClose}
        receipt={
          cancelledReceiptData || {}
        }
        loading={
          loadingCancelledReceipt
        }
        previousStatus={
          activeDialog?.data
            ?.previousStatus ??
          activeDialog?.data
            ?.previous_status ??
          activeDialog?.data
            ?.data?.previous_status
        }
        onViewDetails={() => {
          const receiptId =
            getReceiptIdFromDialog();

          if (receiptId) {
            goTo(
              `/receipts?receipt=${receiptId}`
            );
          } else {
            goTo("/receipts");
          }
        }}
      />

      {/* RECEIPT COMPLETED */}
      <ReceiptCompletedDialog
        isOpen={
          activeDialog?.type ===
          "receipt_completed"
        }
        onClose={onClose}
        {...(
          completedReceiptDialogData ||
          {}
        )}
        loading={
          loadingCompletedReceipt
        }
        onViewReceiptDetails={() => {
          const id =
            completedReceiptData?.id;

          if (id) {
            goTo(
              `/receipts?receipt=${id}`,
            );
          } else {
            goTo("/receipts");
          }
        }}
        onViewInventory={() =>
          goTo("/items")
        }
      />

      {/* TRANSFER PENDING APPROVAL */}
      {/* TRANSFER PENDING APPROVAL */}
      <TransferPendingApprovalDialog
        isOpen={
          activeDialog?.type ===
          "transfer_pending"
        }
        onClose={onClose}
        transfer={
          pendingTransferData || {}
        }
        loading={
          loadingPendingTransfer
        }
        actionLoading={
          actioningPendingTransfer
        }
        onViewDetails={() => {
          const transferId =
            activeDialog?.data?.transferId ??
            activeDialog?.data?.transfer_id;

          if (transferId) {
            goTo(
              `/transfers?transfer=${transferId}`,
            );
          } else {
            goTo("/transfers");
          }
        }}
        onApprove={async () => {
          const transferId =
            activeDialog?.data?.transferId ??
            activeDialog?.data?.transfer_id;

          if (!transferId) {
            console.error(
              "Cannot approve transfer: transfer ID missing",
            );
            return;
          }

          try {
            setActioningPendingTransfer(
              true,
            );

            await api.approveTransfer(
              transferId,
            );

            onClose();
          } catch (error) {
            console.error(
              "Failed to approve transfer:",
              error,
            );
          } finally {
            setActioningPendingTransfer(
              false,
            );
          }
        }}
        onReject={() => {
          const transferId =
            activeDialog?.data?.transferId ??
            activeDialog?.data?.transfer_id;

          if (!transferId) {
            return;
          }

          onClose();

          onNavigate(
            `/transfers?transfer=${transferId}`,
          );
        }}
      />

      {/* TRANSFER APPROVED */}
      <TransferApprovedDialog
        isOpen={
          activeDialog?.type ===
          "transfer_approved"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "transfer_approved"
            ? activeDialog.data
            : {}
        )}
        onViewDetails={() =>
          goTo("/transfers")
        }
        onComplete={onClose}
        onPrintSlip={onClose}
      />

      {/* TRANSFER COMPLETED */}
      <TransferCompletedDialog
        isOpen={
          activeDialog?.type ===
          "transfer_completed"
        }
        onClose={onClose}
        {...(
          completedTransferData ||
          {}
        )}
        loading={
          loadingCompletedTransfer
        }
        onViewDetails={() => {
          const transferId =
            activeDialog?.data
              ?.transferId ??
            activeDialog?.data
              ?.transfer_id ??
            activeDialog?.transferId;

          if (transferId) {
            goTo(
              `/transfers?transfer=${transferId}`,
            );
          } else {
            goTo("/transfers");
          }
        }}
        onPrintSlip={onClose}
      />

      {/* TRANSFER REJECTED */}
      <TransferRejectedDialog
        isOpen={
          activeDialog?.type ===
          "transfer_rejected"
        }
        onClose={onClose}
        transfer={
          rejectedTransferData ||
          {}
        }
        loading={
          loadingRejectedTransfer
        }
        onViewDetails={() => {
          const transferId =
            getTransferIdFromDialog();

          if (transferId) {
            goTo(
              `/transfers?transfer=${transferId}`,
            );
          } else {
            goTo("/transfers");
          }
        }}
      />

      {/* ADJUSTMENT CANCELLED */}
      <AdjustmentCancelledDialog
        isOpen={
          activeDialog?.type ===
          "adjustment_cancelled"
        }
        onClose={onClose}
        adjustment={
          cancelledAdjustmentData ||
          {}
        }
        loading={
          loadingCancelledAdjustment
        }
        previousStatus={
          activeDialog?.data
            ?.previousStatus ??
          activeDialog?.data
            ?.previous_status ??
          activeDialog?.data?.data
            ?.previous_status
        }
        onViewDetails={() => {
          const adjustmentId =
            getAdjustmentIdFromDialog();

          if (adjustmentId) {
            goTo(
              `/adjustments?adjustment=${adjustmentId}`,
            );
          } else {
            goTo("/adjustments");
          }
        }}
        onViewInventory={() =>
          goTo("/items")
        }
      />

      <AdjustmentRejectedDialog
        isOpen={
          activeDialog?.type ===
          "adjustment_rejected"
        }
        onClose={onClose}
        adjustment={
          rejectedAdjustmentData || {}
        }
        loading={
          loadingRejectedAdjustment
        }
        rejectionReason={
          activeDialog?.data?.reason ??
          activeDialog?.data?.data?.reason ??
          rejectedAdjustmentData?.rejection_reason
        }
        onViewDetails={() => {
          const adjustmentId =
            getAdjustmentIdFromDialog();

          if (adjustmentId) {
            goTo(
              `/adjustments?adjustment=${adjustmentId}`
            );
          } else {
            goTo("/adjustments");
          }
        }}
      />

      {/* ADJUSTMENT PENDING */}
      <AdjustmentPendingDialog
        isOpen={
          activeDialog?.type ===
          "adjustment_pending"
        }

        onClose={onClose}

        {...(
          pendingAdjustmentData || {}
        )}

        loading={
          loadingPendingAdjustment
        }

        actionLoading={
          actioningPendingAdjustment
        }

        onViewDetails={() => {
          const adjustmentId =
            getAdjustmentIdFromDialog();

          if (adjustmentId) {
            goTo(
              `/adjustments?adjustment=${adjustmentId}`,
            );
          } else {
            goTo("/adjustments");
          }
        }}

        onApprove={async () => {
          const adjustmentId =
            getAdjustmentIdFromDialog();

          if (!adjustmentId) {
            console.error(
              "Cannot approve adjustment: adjustment ID missing",
            );

            return;
          }

          try {
            setActioningPendingAdjustment(
              true,
            );

            await api.approveAdjustment(
              adjustmentId,
            );

            onClose();
          } catch (error) {
            console.error(
              "Failed to approve adjustment:",
              error,
            );
          } finally {
            setActioningPendingAdjustment(
              false,
            );
          }
        }}
      />

      {/* ADJUSTMENT APPROVED */}
      <AdjustmentApprovedDialog
        isOpen={
          activeDialog?.type ===
          "adjustment_approved"
        }
        onClose={onClose}
        adjustment={
          approvedAdjustmentData || {}
        }
        loading={
          loadingApprovedAdjustment
        }
        onViewDetails={() => {
          const adjustmentId =
            getAdjustmentIdFromDialog();

          if (adjustmentId) {
            goTo(
              `/adjustments?adjustment=${adjustmentId}`,
            );
          } else {
            goTo("/adjustments");
          }
        }}
        onViewInventory={() =>
          goTo("/items")
        }
      />

      {/* STOCK COUNT CREATED */}
      <StockCountEventDialog
        isOpen={
          activeDialog?.type ===
          "stock_count_created"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "stock_count_created"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() => {
          const stockCountId =
            activeDialog?.data
              ?.stockCountId;

          if (!stockCountId) {
            goTo(
              "/stock-counts",
            );

            return;
          }

          goTo(
            `/stock-counts?count=${stockCountId}`,
          );
        }}
      />

      {/* STOCK COUNT SUBMITTED */}
      <StockCountEventDialog
        isOpen={
          activeDialog?.type ===
          "stock_count_submitted"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "stock_count_submitted"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() => {
          const stockCountId =
            activeDialog?.data
              ?.stockCountId;

          if (!stockCountId) {
            goTo(
              "/stock-counts",
            );

            return;
          }

          goTo(
            `/stock-counts?count=${stockCountId}`,
          );
        }}
      />

      {/* STOCK COUNT VARIANCE */}
      <StockCountVarianceDialog
        isOpen={
          activeDialog?.type ===
          "stock_count_variance"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "stock_count_variance"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() =>
          goTo("/stock-counts")
        }
        onRequestRecount={
          onClose
        }
        onReviewApprove={
          onClose
        }
      />

      {/* NEW RECEIPT AWAITING APPROVAL */}
      <NewReceiptApprovalDialog
        isOpen={
          activeDialog?.type ===
          "new_receipt_awaiting_approval"
        }
        onClose={onClose}
        {...(
          pendingReceiptData ||
          {}
        )}
        loading={
          loadingPendingReceipt
        }
        onViewDetails={() => {
          const receiptId =
            activeDialog?.receiptId ??
            activeDialog?.data
              ?.receiptId ??
            activeDialog?.data
              ?.receipt_id ??
            activeDialog?.data?.data
              ?.receiptId ??
            activeDialog?.data?.data
              ?.receipt_id;

          if (receiptId) {
            goTo(
              `/receipts?receipt=${receiptId}`,
            );
          } else {
            goTo("/receipts");
          }
        }}
        onPrint={() => {
          /*
           * You can replace this with your
           * receipt print logic later.
           */
          window.print();
        }}
        onApprove={
          handleApprovePendingReceipt
        }
      />

      {/* USER CREATED */}
      <UserCreatedDialog
        isOpen={
          activeDialog?.type ===
          "user_created"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "user_created"
            ? activeDialog.data
            : {}
        )}
        onViewUser={() =>
          goTo("/settings")
        }
        onAddAnotherUser={() =>
          goTo("/settings")
        }
      />

      {/* SYSTEM MAINTENANCE */}
      <SystemMaintenanceDialog
        isOpen={
          activeDialog?.type ===
          "system_maintenance"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "system_maintenance"
            ? activeDialog.data
            : {}
        )}
        onContactSupport={() => {
          const subject =
            encodeURIComponent(
              "Entouche IMS - Maintenance Support",
            );

          const body =
            encodeURIComponent(
              `Hello IT Support,

I need assistance regarding the scheduled system maintenance.

Maintenance ID: ${activeDialog?.data
                ?.maintenance?.id ||
              "N/A"
              }

Please assist.

Thank you.`,
            );

          const mailto =
            `mailto:sola@entoucheng.com?subject=${subject}&body=${body}`;

          window.location.assign(
            mailto,
          );
        }}
        onViewHistory={
          onClose
        }
      />

      {/* IMPORT COMPLETED */}
      <ImportCompletedDialog
        isOpen={
          activeDialog?.type ===
          "import_completed"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "import_completed"
            ? activeDialog.data
            : {}
        )}
        onDownloadErrorReport={
          handleDownloadImportErrorReport
        }
        onViewImportLog={
          handleViewImportLog
        }
      />

      {/* IMPORT FAILED */}
      <ImportFailedDialog
        isOpen={
          activeDialog?.type ===
          "import_failed"
        }
        onClose={onClose}
        {...(
          activeDialog?.type ===
            "import_failed"
            ? activeDialog.data
            : {}
        )}
        onViewImportLog={
          handleViewImportLog
        }
        onDownloadErrorReport={
          handleDownloadImportErrorReport
        }
      />

      {/* GENERIC STOCK COUNT EVENT */}
      {activeDialog?.type ===
        "stock_count_event" && (
          <StockCountEventDialog
            isOpen
            onClose={onClose}
            title={
              activeDialog.data
                ?.title
            }
            description={
              activeDialog.data
                ?.description
            }
            timeAgo={
              activeDialog.data
                ?.timeAgo
            }
            stockCountId={
              activeDialog.data
                ?.stockCountId
            }
            onViewFull={() => {
              const id =
                activeDialog.data
                  ?.stockCountId;

              if (!id) {
                return;
              }

              onClose();

              onNavigate(
                `/stock-counts?count=${id}`,
              );
            }}
          />
        )}
    </>
  );
}