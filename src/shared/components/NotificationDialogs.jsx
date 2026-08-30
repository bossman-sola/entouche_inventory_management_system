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

export default function NotificationDialogs({ activeDialog, onClose, onNavigate }) {
  const goTo = (path) => {
    onClose();
    onNavigate(path);
  };

  return (
    <>
      <AlertDialog isOpen={activeDialog?.type === "low_stock_alert"} variant="low_stock" onClose={onClose} {...(activeDialog?.type === "low_stock_alert" ? activeDialog.data : {})} onCreateReceipt={() => goTo("/receipts")} onTransferStock={() => goTo("/transfers")} onAdjustStock={() => goTo("/adjustments")} onViewStockHistory={onClose} />
      <AlertDialog isOpen={activeDialog?.type === "reorder_level_reached"} variant="reorder" onClose={onClose} {...(activeDialog?.type === "reorder_level_reached" ? activeDialog.data : {})} onCreateReceipt={() => goTo("/receipts")} onAdjustStock={() => goTo("/adjustments")} onViewStockHistory={onClose} />
      <ReceiptCompletedDialog isOpen={activeDialog?.type === "receipt_completed"} onClose={onClose} {...(activeDialog?.type === "receipt_completed" ? activeDialog.data : {})} onViewReceiptDetails={() => goTo("/receipts")} onViewInventory={() => goTo("/items")} />
      <TransferApprovedDialog isOpen={activeDialog?.type === "transfer_approved"} onClose={onClose} {...(activeDialog?.type === "transfer_approved" ? activeDialog.data : {})} onViewDetails={() => goTo("/transfers")} onComplete={onClose} onPrintSlip={onClose} />
      <TransferCompletedDialog isOpen={activeDialog?.type === "transfer_completed"} onClose={onClose} {...(activeDialog?.type === "transfer_completed" ? activeDialog.data : {})} onViewDetails={() => goTo("/transfers")} onPrintSlip={onClose} />
      <AdjustmentPendingDialog isOpen={activeDialog?.type === "adjustment_pending"} onClose={onClose} {...(activeDialog?.type === "adjustment_pending" ? activeDialog.data : {})} onViewDetails={() => goTo("/adjustments")} onApprove={onClose} />
      <StockCountVarianceDialog isOpen={activeDialog?.type === "stock_count_variance"} onClose={onClose} {...(activeDialog?.type === "stock_count_variance" ? activeDialog.data : {})} onViewFull={() => goTo("/stock-counts")} onRequestRecount={onClose} onReviewApprove={onClose} />
      <NewReceiptApprovalDialog isOpen={activeDialog?.type === "new_receipt_awaiting_approval"} onClose={onClose} {...(activeDialog?.type === "new_receipt_awaiting_approval" ? activeDialog.data : {})} onViewDetails={() => goTo("/receipts")} onPrint={onClose} onApprove={onClose} />
      <UserCreatedDialog isOpen={activeDialog?.type === "user_created"} onClose={onClose} {...(activeDialog?.type === "user_created" ? activeDialog.data : {})} onViewUser={() => goTo("/settings")} onAddAnotherUser={() => goTo("/settings")} />
      <SystemMaintenanceDialog isOpen={activeDialog?.type === "system_maintenance"} onClose={onClose} {...(activeDialog?.type === "system_maintenance" ? activeDialog.data : {})} onContactSupport={onClose} onViewHistory={onClose} />
      <ImportCompletedDialog isOpen={activeDialog?.type === "import_completed"} onClose={onClose} {...(activeDialog?.type === "import_completed" ? activeDialog.data : {})} onDownloadErrorReport={onClose} onViewImportLog={() => goTo("/data")} />
    </>
  );
}
