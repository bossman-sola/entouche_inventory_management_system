import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { api } from "../api/entoucheApi";
import { mapApiTransferApproved } from "../api/mappers";
import { useMaintenance } from "../hooks/useMaintenance";
import { useNotifications } from "../hooks/useNotifications";
import { DEMO_DIALOG_DATA } from "../data/demoDialogData";

import AppHeader from "../components/AppHeader";
import AppSidebar from "../components/AppSidebar";
import NotificationDialogs from "../components/NotificationDialogs";
import MaintenanceBanner from "../components/MaintenanceBanner";

export default function MainLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loadMore,
    hasMore,
    loadingMore } = useNotifications();
  const { maintenance } = useMaintenance();

  const handleSignOut = async () => {
    await logout();
    navigate("/signin", { replace: true });
  };

  const handleNotificationClick = async (notification) => {
    console.log(
      "CLICKED NOTIFICATION:",
      notification
    );

    console.log(
      "CLICKED TYPE:",
      notification?.type
    );


    try {
      if (notification.unread) await markAsRead(notification);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    switch (notification.type) {
      case "low_stock_alert":
        setActiveDialog({
          type: "low_stock_alert",
          data: notification,
        });
        break;

      case "reorder_level_reached":
        setActiveDialog({
          type: "reorder_level_reached",
          data: notification,
        });
        break;

      case "receipt_completed":
        setActiveDialog({
          type: "receipt_completed",
          data: notification,
        });
        break;
      case "receipt_cancelled":
        setActiveDialog({
          type: "receipt_cancelled",
          data: {
            ...notification,

            receiptId:
              notification.receiptId ??
              notification.receipt_id ??
              notification.data?.receiptId ??
              notification.data?.receipt_id,

            receipt_id:
              notification.receipt_id ??
              notification.receiptId ??
              notification.data?.receipt_id ??
              notification.data?.receiptId,

            previousStatus:
              notification.previousStatus ??
              notification.previous_status ??
              notification.data?.previousStatus ??
              notification.data?.previous_status,
          },
        });

        break;
      case "receipt_approved":
        setActiveDialog({
          type: "receipt_approved",
          data: {
            ...notification,

            receiptId:
              notification.receiptId ??
              notification.receipt_id ??
              notification.data?.receiptId ??
              notification.data?.receipt_id,

            receipt_id:
              notification.receipt_id ??
              notification.receiptId ??
              notification.data?.receipt_id ??
              notification.data?.receiptId,
          },
        });

        break;
      
      case "adjustment_pending":
        setActiveDialog({
          type: "adjustment_pending",
          data: {
            title: notification.title,
            description: notification.description,
            timeAgo: notification.timeAgo,
            adjustmentId: notification.adjustmentId,
            ...notification.data,
          },
        });
        break;
      case "adjustment_approved":
        setActiveDialog({
          type: "adjustment_approved",
          data: {
            ...notification,

            adjustmentId:
              notification.adjustmentId ??
              notification.adjustment_id ??
              notification.data?.adjustmentId ??
              notification.data?.adjustment_id,

            adjustment_id:
              notification.adjustment_id ??
              notification.adjustmentId ??
              notification.data?.adjustment_id ??
              notification.data?.adjustmentId,
          },
        });
        break;
      case "adjustment_cancelled":
        setActiveDialog({
          type: "adjustment_cancelled",
          data: {
            ...notification,

            adjustmentId:
              notification.adjustmentId ??
              notification.adjustment_id ??
              notification.data?.adjustmentId ??
              notification.data?.adjustment_id,

            adjustment_id:
              notification.adjustment_id ??
              notification.adjustmentId ??
              notification.data?.adjustment_id ??
              notification.data?.adjustmentId,

            previousStatus:
              notification.previousStatus ??
              notification.previous_status ??
              notification.data?.previousStatus ??
              notification.data?.previous_status,
          },
        });
        break;
      case "adjustment_rejected":
        setActiveDialog({
          type: "adjustment_rejected",
          data: {
            ...notification,

            adjustmentId:
              notification.adjustmentId ??
              notification.adjustment_id ??
              notification.data?.adjustmentId ??
              notification.data?.adjustment_id,

            adjustment_id:
              notification.adjustment_id ??
              notification.adjustmentId ??
              notification.data?.adjustment_id ??
              notification.data?.adjustmentId,

            reason:
              notification.reason ??
              notification.data?.reason,
          },
        });
        break;

      case "stock_count_requested":
      case "stock_count_started":
      case "stock_count_submitted":
      case "stock_count_pending_review":
      case "stock_count_approved":
      case "stock_count_rejected":
      case "stock_count_cancelled":
      case "stock_count_recount_requested":
      case "stock_count_variance":
        setActiveDialog({
          type: "stock_count_event",
          data: {
            notificationType: notification.type,
            title: notification.title,
            description: notification.description,
            timeAgo: notification.timeAgo,

            stockCountId:
              notification.stockCountId ??
              notification.stock_count_id ??
              notification.data?.stock_count_id,

            ...notification.data,
          },
        });
        break;

      case "new_receipt_awaiting_approval":
        setActiveDialog({
          type: "new_receipt_awaiting_approval",
          data: notification,
        });
        break;

      case "user_created":
        setActiveDialog({
          type: "user_created",
          data: notification,
        });
        break;
      case "maintenance_scheduled":
      case "maintenance_cancelled": {
        const isCancelled =
          notification.type === "maintenance_cancelled";

        const start = notification.startsAt
          ? new Date(notification.startsAt)
          : null;

        const end = notification.endsAt
          ? new Date(notification.endsAt)
          : null;

        const formatLocal = (date) => {
          if (!date || Number.isNaN(date.getTime())) {
            return "Not available";
          }

          return date.toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        };

        const durationMs =
          start && end ? end.getTime() - start.getTime() : 0;

        const durationMinutes = Math.max(
          0,
          Math.round(durationMs / 60000)
        );

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        const durationLabel =
          hours && minutes
            ? `${hours} hr ${minutes} min`
            : hours
              ? `${hours} ${hours === 1 ? "hour" : "hours"}`
              : `${minutes} min`;

        setActiveDialog({
          type: "system_maintenance",

          data: {
            maintenance: {
              startsAt: formatLocal(start),
              endsAt: formatLocal(end),

              id: notification.maintenanceId
                ? `MAINT-${notification.maintenanceId}`
                : "N/A",

              initiatedBy: "System Administrator",

              reason: isCancelled
                ? `The maintenance window "${notification.maintenanceTitle || "Scheduled Maintenance"
                }" scheduled for ${formatLocal(start)} was cancelled.`
                : `The maintenance window "${notification.maintenanceTitle || "Scheduled Maintenance"
                }" is scheduled from ${formatLocal(start)} to ${formatLocal(end)}.`,

              impactLevel: isCancelled
                ? "Cancelled"
                : "Scheduled",

              durationLabel,

              status: isCancelled
                ? "cancelled"
                : "scheduled",

              statusNote: isCancelled
                ? "This scheduled maintenance window has been cancelled."
                : "Scheduled maintenance is planned. Some features may be unavailable during this time.",

              affectedService:
                notification.affectedService,
            },

            features:
              DEMO_DIALOG_DATA.system_maintenance.features,

            actionItems: isCancelled
              ? [
                "This maintenance window has been cancelled.",
                "No maintenance interruption is expected during this period.",
              ]
              : DEMO_DIALOG_DATA.system_maintenance.actionItems,
          },
        });

        break;
      }

      case "transfer_pending":
        setActiveDialog({
          type: "transfer_pending",
          data: {
            ...notification,

            transferId:
              notification.transferId ??
              notification.transfer_id ??
              notification.data?.transferId ??
              notification.data?.transfer_id,

            transfer_id:
              notification.transfer_id ??
              notification.transferId ??
              notification.data?.transfer_id ??
              notification.data?.transferId,
          },
        });
        break;
      case "transfer_completed":
        setActiveDialog({
          type: "transfer_completed",
          data: notification,
        });
        break;
      case "transfer_approved":
        await openTransferApproved(notification);
        break;
      case "transfer_rejected":
        setActiveDialog({
          type: "transfer_rejected",
          data: {
            ...notification,

            transferId:
              notification.transferId ??
              notification.transfer_id ??
              notification.data?.transferId ??
              notification.data?.transfer_id,

            transfer_id:
              notification.transfer_id ??
              notification.transferId ??
              notification.data?.transfer_id ??
              notification.data?.transferId,
          },
        });
        break;

      case "import_completed":
        await openImportCompleted(notification);
        break;
      case "import_failed":
        await openImportFailed(notification);
        break;

      default:
        break;
    }
  };

  const openTransferApproved = async (notification) => {
    if (!notification.transferId) {
      console.error("Transfer notification is missing transfer_id", notification);
      return;
    }
    try {
      const data = await buildTransferApprovedDialogData(notification.transferId);
      setActiveDialog({ type: "transfer_approved", data });
    } catch (error) {
      console.error("Failed to load transfer notification details:", error);
    }
  };

  const openImportCompleted = async (notification) => {
    if (!notification.importId) {
      console.error("Import notification is missing import_id", notification);
      return;
    }
    try {
      const importRecord = await api.getImport(notification.importId);
      setActiveDialog({ type: "import_completed", data: buildImportCompletedDialogData(importRecord) });
    } catch (error) {
      console.error("Failed to load import details:", error);
    }
  };

  const openImportFailed = async (notification) => {
    if (!notification.importId) {
      console.error(
        "Import failed notification is missing import_id",
        notification
      );
      return;
    }

    try {
      const importRecord = await api.getImport(notification.importId);

      setActiveDialog({
        type: "import_failed",
        data: buildImportFailedDialogData(importRecord),
      });
    } catch (error) {
      console.error("Failed to load failed import details:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-['Inter'] text-[#1E2740] overflow-hidden selection:bg-indigo-100">
      <MaintenanceBanner maintenance={maintenance} onViewDetails={() => navigate("/settings")} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <AppHeader
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            deleteNotification={deleteNotification}
            onNotificationClick={handleNotificationClick}
            onSignOut={handleSignOut}
            onNavigate={navigate}
            dialogOpen={Boolean(activeDialog)}
            onLoadMoreNotifications={loadMore}
            hasMoreNotifications={hasMore}
            loadingMoreNotifications={loadingMore}
          />

          <main className="flex-1 overflow-y-auto p-7 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Outlet />
          </main>
        </div>
      </div>

      <NotificationDialogs
        activeDialog={activeDialog}
        onClose={() => setActiveDialog(null)}
        onNavigate={navigate}
      />
    </div>
  );
}

async function buildTransferApprovedDialogData(transferId) {
  const [transfer, items, warehouses] = await Promise.all([
    api.getTransfer(transferId),
    api.listItems(),
    api.listWarehouses(),
  ]);

  const itemRows = Array.isArray(items) ? items : [];
  const warehouseRows = Array.isArray(warehouses) ? warehouses : [];
  const itemsById = Object.fromEntries(itemRows.map((item) => [String(item.id), item]));
  const warehousesById = Object.fromEntries(warehouseRows.map((warehouse) => [String(warehouse.id), warehouse]));

  const locationGroups = await Promise.all(
    warehouseRows.map(async (warehouse) => {
      try {
        const locations = await api.listWarehouseLocations(warehouse.id);
        return (Array.isArray(locations) ? locations : []).map((location) => ({
          ...location,
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
        }));
      } catch {
        return [];
      }
    }),
  );

  const locationsById = Object.fromEntries(locationGroups.flat().map((location) => [String(location.id), location]));
  return mapApiTransferApproved(transfer, itemsById, locationsById, warehousesById);
}

function buildImportCompletedDialogData(importRecord) {
  const successful = Number(importRecord.successful_rows ?? importRecord.imported_rows ?? 0);
  const updated = Number(importRecord.updated_rows ?? 0);
  const skipped = Number(importRecord.skipped_rows ?? 0);
  const failed = Number(importRecord.failed_rows ?? 0);
  const total = Number(importRecord.total_rows ?? successful + updated + skipped + failed);
  const pct = (value) => total ? Number(((Number(value || 0) / total) * 100).toFixed(1)) : 0;

  return {
    importInfo: {
      id: importRecord.import_number ?? `IMP-${String(importRecord.id).padStart(6, "0")}`,
      type: importRecord.import_type ?? "—",
      fileName: importRecord.file_name ?? importRecord.original_filename ?? "—",
      source: "File Upload",
      importedBy: importRecord.uploader?.name ?? "—",
      importedByRole: importRecord.uploader?.roles?.[0]?.name ?? "",
      warehouse: importRecord.warehouse?.name ?? "—",
      completedOn: formatDateTime(importRecord.completed_at ?? importRecord.updated_at),
      totalRows: total,
      durationLabel: importRecord.duration_label ?? "—",
    },
    stats: { imported: successful, importedPct: pct(successful), updated, updatedPct: pct(updated), skipped, skippedPct: pct(skipped), failed, failedPct: pct(failed) },
    summaryRows: [
      { kind: "imported", status: "Successfully Imported", description: "Rows imported successfully", count: successful, pct: pct(successful) },
      { kind: "updated", status: "Updated", description: "Existing records updated", count: updated, pct: pct(updated) },
      { kind: "skipped", status: "Skipped", description: "Rows skipped during import", count: skipped, pct: pct(skipped) },
      { kind: "failed", status: "Failed", description: "Rows that could not be imported", count: failed, pct: pct(failed) },
    ],
    fileSummary: {
      fileSize: importRecord.file_size_label ?? importRecord.file_size ?? "—",
      fileType: importRecord.file_type ?? importRecord.mime_type ?? "—",
      sheetsProcessed: importRecord.sheets_processed ?? "—",
      itemsPerSheet: total || "—",
    },
    nextSteps: failed > 0
      ? ["Review the failed rows.", "Correct the spreadsheet data.", "Upload only the corrected failed rows again."]
      : ["Import completed successfully.", "Review the import log for details."],
  };
}

function buildImportFailedDialogData(importRecord) {
  const successful = Number(
    importRecord.successful_rows ??
    importRecord.imported_rows ??
    0
  );

  const updated = Number(importRecord.updated_rows ?? 0);
  const skipped = Number(importRecord.skipped_rows ?? 0);
  const failed = Number(importRecord.failed_rows ?? 0);

  const total = Number(
    importRecord.total_rows ??
    successful + updated + skipped + failed
  );

  /*
   * Aggregate identical errors.
   *
   * Example:
   * "Item name is required." x 12
   * instead of 12 separate "Import error" rows.
   */
  const groupedErrors = {};

  const rawErrors = Array.isArray(importRecord.errors)
    ? importRecord.errors
    : [];

  rawErrors.forEach((error) => {
    const label =
      error.error_message ||
      error.message ||
      error.error_type ||
      "Import error";

    if (!groupedErrors[label]) {
      groupedErrors[label] = {
        label,
        count: 0,
      };
    }

    groupedErrors[label].count += 1;
  });

  const errorTypes = Object.values(groupedErrors)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  /*
   * Determine primary issue from actual errors first.
   */
  const primaryIssue =
    errorTypes[0]?.label ||
    importRecord.error_summary ||
    "One or more rows failed validation.";

  return {
    importData: {
      /*
       * Display identifier.
       */
      id:
        importRecord.import_number ??
        `IMP-${String(importRecord.id).padStart(6, "0")}`,

      /*
       * Actual DB identifier used by API/navigation.
       */
      recordId: importRecord.id,

      importType:
        importRecord.import_type === "items"
          ? "Items"
          : importRecord.import_type === "inventory"
            ? "Inventory"
            : importRecord.import_type ?? "—",

      uploadedBy:
        importRecord.uploader?.name ?? "—",

      uploadedByRole:
        importRecord.uploader?.roles?.[0]?.name ?? "",

      /*
       * Items imports do not require a warehouse.
       */
      warehouse:
        importRecord.warehouse?.name ??
        (importRecord.import_type === "items"
          ? "Not applicable"
          : "—"),

      failedOn: formatDateTime(
        importRecord.completed_at ??
        importRecord.failed_at ??
        importRecord.updated_at
      ),

      /*
       * Your backend calls this `original_name`.
       * `file_name` is the random stored filename.
       */
      fileName:
        importRecord.original_name ??
        importRecord.original_filename ??
        importRecord.file_name ??
        "—",

      fileSize:
        importRecord.file_size_label ??
        formatFileSize(importRecord.file_size),

      totalRows: total,
      importedRows: successful,
      updatedRows: updated,
      failedRows: failed,
      skippedRows: skipped,

      failureReason:
        importRecord.error_summary ??
        (
          successful > 0
            ? "The import was partially completed. Some rows could not be processed."
            : "The import could not be completed successfully."
        ),

      primaryIssue,

      expectedColumns:
        importRecord.import_type === "items"
          ? [
            "name",
            "category",
            "unit",
            "item_type",
            "barcode",
            "reorder_level",
            "unit_cost",
            "description",
            "brand",
            "supplier",
          ]
          : [],
    },

    errorTypes,
  };
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!size || Number.isNaN(size)) {
    return "—";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}