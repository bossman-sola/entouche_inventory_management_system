import React, {
  useEffect,
  useState,
} from "react";
import {
  getTransfer,
} from "../../features/transfers/api/TransfersApi.js";

import {
  mapApiTransferApproved,
} from "../api/mappers.js";
import AlertDialog from "../layouts/dialogs/Alertdialog";
import ReceiptCompletedDialog from "../layouts/dialogs/ReceiptCompletedDialog";
import TransferApprovedDialog from "../layouts/dialogs/TransferApprovedDialog";
import TransferCompletedDialog from "../layouts/dialogs/TransferCompletedDialog";
import AdjustmentPendingDialog from "../layouts/dialogs/AdjustmentPendingDialog";
import StockCountVarianceDialog from "../layouts/dialogs/StockCountVarianceDialog";
import NewReceiptApprovalDialog from "../layouts/dialogs/NewReceiptApprovalDialog";
import UserCreatedDialog from "../layouts/dialogs/UserCreatedDialog";
import SystemMaintenanceDialog from "../layouts/dialogs/SystemMaintenanceDialog";
import ImportCompletedDialog from "../layouts/dialogs/ImportCompletedDialog";
import ImportFailedDialog from "../layouts/dialogs/ImportFailedDialog";
import StockCountEventDialog from "../layouts/dialogs/StockCountEventDialog";
import { api } from "../api/entoucheApi";

export default function NotificationDialogs({
  activeDialog,
  onClose,
  onNavigate,
}) {
  const goTo = (path) => {
    onClose();
    onNavigate(path);
  };
  const [
    completedTransferData,
    setCompletedTransferData,
  ] = useState(null);

  const [
    loadingCompletedTransfer,
    setLoadingCompletedTransfer,
  ] = useState(false);

  const getImportRecordId = () =>
    activeDialog?.data?.importData?.recordId ??
    activeDialog?.data?.importInfo?.recordId ??
    null;

  const handleViewImportLog = () => {
    const recordId = getImportRecordId();

    if (!recordId) {
      goTo("/data");
      return;
    }

    goTo(`/data?import=${recordId}`);
  };

  const handleDownloadImportErrorReport = async () => {
    const recordId = getImportRecordId();

    if (!recordId) {
      console.error(
        "Cannot download error report: import ID is missing."
      );
      return;
    }

    try {
      await api.downloadImportErrorReport(recordId);
    } catch (error) {
      console.error(
        "Failed to download import error report:",
        error
      );
    }
  };

  useEffect(() => {
  let cancelled = false;

  async function loadCompletedTransfer() {
    if (
      activeDialog?.type !== "transfer_completed"
    ) {
      setCompletedTransferData(null);
      return;
    }

    const transferId =
      activeDialog?.data?.transferId ??
      activeDialog?.data?.transfer_id ??
      activeDialog?.transferId ??
      null;

    if (!transferId) {
      console.error(
        "Transfer completed notification is missing transfer ID.",
        activeDialog,
      );

      setCompletedTransferData(null);
      return;
    }

    setLoadingCompletedTransfer(true);

    try {
      const transfer =
        await getTransfer(transferId);

      if (cancelled) return;

      const mapped =
        mapApiTransferApproved(transfer);

      setCompletedTransferData(mapped);
    } catch (error) {
      if (!cancelled) {
        console.error(
          "Failed to load completed transfer:",
          error,
        );

        setCompletedTransferData(null);
      }
    } finally {
      if (!cancelled) {
        setLoadingCompletedTransfer(false);
      }
    }
  }

  loadCompletedTransfer();

  return () => {
    cancelled = true;
  };
}, [activeDialog]);

  return (
    <>
      <AlertDialog
        isOpen={activeDialog?.type === "low_stock_alert"}
        variant="low_stock"
        onClose={onClose}
        {...(
          activeDialog?.type === "low_stock_alert"
            ? activeDialog.data
            : {}
        )}
        onCreateReceipt={() => goTo("/receipts")}
        onTransferStock={() => goTo("/transfers")}
        onAdjustStock={() => goTo("/adjustments")}
        onViewStockHistory={onClose}
      />

      <AlertDialog
        isOpen={activeDialog?.type === "reorder_level_reached"}
        variant="reorder"
        onClose={onClose}
        {...(
          activeDialog?.type === "reorder_level_reached"
            ? activeDialog.data
            : {}
        )}
        onCreateReceipt={() => goTo("/receipts")}
        onAdjustStock={() => goTo("/adjustments")}
        onViewStockHistory={onClose}
      />

      <ReceiptCompletedDialog
        isOpen={activeDialog?.type === "receipt_completed"}
        onClose={onClose}
        {...(
          activeDialog?.type === "receipt_completed"
            ? activeDialog.data
            : {}
        )}
        onViewReceiptDetails={() => goTo("/receipts")}
        onViewInventory={() => goTo("/items")}
      />

      <TransferApprovedDialog
        isOpen={activeDialog?.type === "transfer_approved"}
        onClose={onClose}
        {...(
          activeDialog?.type === "transfer_approved"
            ? activeDialog.data
            : {}
        )}
        onViewDetails={() => goTo("/transfers")}
        onComplete={onClose}
        onPrintSlip={onClose}
      />

   <TransferCompletedDialog
  isOpen={
    activeDialog?.type ===
    "transfer_completed"
  }
  onClose={onClose}
  {...(completedTransferData || {})}
  onViewDetails={() => {
    const transferId =
      activeDialog?.data?.transferId ??
      activeDialog?.data?.transfer_id ??
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

      <AdjustmentPendingDialog
        isOpen={activeDialog?.type === "adjustment_pending"}
        onClose={onClose}
        {...(
          activeDialog?.type === "adjustment_pending"
            ? activeDialog.data
            : {}
        )}
        onViewDetails={() => goTo("/adjustments")}
        onApprove={onClose}
      />

      <StockCountEventDialog
        isOpen={activeDialog?.type === "stock_count_created"}
        onClose={onClose}
        {...(
          activeDialog?.type === "stock_count_created"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() => {
          const stockCountId =
            activeDialog?.data?.stockCountId;

          if (!stockCountId) {
            goTo("/stock-counts");
            return;
          }

          goTo(`/stock-counts?count=${stockCountId}`);
        }}
      />

      <StockCountEventDialog
        isOpen={activeDialog?.type === "stock_count_submitted"}
        onClose={onClose}
        {...(
          activeDialog?.type === "stock_count_submitted"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() => {
          const stockCountId =
            activeDialog?.data?.stockCountId;

          if (!stockCountId) {
            goTo("/stock-counts");
            return;
          }

          goTo(`/stock-counts?count=${stockCountId}`);
        }}
      />

      <StockCountVarianceDialog
        isOpen={activeDialog?.type === "stock_count_variance"}
        onClose={onClose}
        {...(
          activeDialog?.type === "stock_count_variance"
            ? activeDialog.data
            : {}
        )}
        onViewFull={() => goTo("/stock-counts")}
        onRequestRecount={onClose}
        onReviewApprove={onClose}
      />

      <NewReceiptApprovalDialog
        isOpen={
          activeDialog?.type === "new_receipt_awaiting_approval"
        }
        onClose={onClose}
        {...(
          activeDialog?.type === "new_receipt_awaiting_approval"
            ? activeDialog.data
            : {}
        )}
        onViewDetails={() => goTo("/receipts")}
        onPrint={onClose}
        onApprove={onClose}
      />

      <UserCreatedDialog
        isOpen={activeDialog?.type === "user_created"}
        onClose={onClose}
        {...(
          activeDialog?.type === "user_created"
            ? activeDialog.data
            : {}
        )}
        onViewUser={() => goTo("/settings")}
        onAddAnotherUser={() => goTo("/settings")}
      />

      <SystemMaintenanceDialog
        isOpen={activeDialog?.type === "system_maintenance"}
        onClose={onClose}
        {...(
          activeDialog?.type === "system_maintenance"
            ? activeDialog.data
            : {}
        )}
        onContactSupport={() => {
          const subject = encodeURIComponent(
            "Entouche IMS - Maintenance Support"
          );

          const body = encodeURIComponent(
            `Hello IT Support,

I need assistance regarding the scheduled system maintenance.

Maintenance ID: ${activeDialog?.data?.maintenance?.id || "N/A"
            }

Please assist.

Thank you.`
          );

          const mailto =
            `mailto:sola@entoucheng.com?subject=${subject}&body=${body}`;

          window.location.assign(mailto);
        }}
        onViewHistory={onClose}
      />

      <ImportCompletedDialog
        isOpen={activeDialog?.type === "import_completed"}
        onClose={onClose}
        {...(
          activeDialog?.type === "import_completed"
            ? activeDialog.data
            : {}
        )}
        onDownloadErrorReport={
          handleDownloadImportErrorReport
        }
        onViewImportLog={handleViewImportLog}
      />

      <ImportFailedDialog
        isOpen={activeDialog?.type === "import_failed"}
        onClose={onClose}
        {...(
          activeDialog?.type === "import_failed"
            ? activeDialog.data
            : {}
        )}
        onViewImportLog={handleViewImportLog}
        onDownloadErrorReport={
          handleDownloadImportErrorReport
        }
      />

      {activeDialog?.type === "stock_count_event" && (
        <StockCountEventDialog
          isOpen
          onClose={onClose}
          title={activeDialog.data?.title}
          description={activeDialog.data?.description}
          timeAgo={activeDialog.data?.timeAgo}
          stockCountId={activeDialog.data?.stockCountId}
          onViewFull={() => {
            const id = activeDialog.data?.stockCountId;

            if (!id) return;

            onClose();

            onNavigate(
              `/stock-counts?count=${id}`
            );
          }}
        />
      )}
    </>
  );
}