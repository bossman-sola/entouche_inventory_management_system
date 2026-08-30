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

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { maintenance } = useMaintenance();

  const handleSignOut = async () => {
    await logout();
    navigate("/signin", { replace: true });
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.unread) await markAsRead(notification);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    switch (notification.type) {
      case "low_stock_alert":
      case "reorder_level_reached":
      case "receipt_completed":
      case "transfer_completed":
      case "adjustment_pending":
      case "stock_count_variance":
      case "new_receipt_awaiting_approval":
      case "user_created":
      case "system_maintenance":
        setActiveDialog({ type: notification.type, data: DEMO_DIALOG_DATA[notification.type] });
        break;

      case "stock_count_submitted":
        setActiveDialog({
          type: "stock_count_submitted",
          data: {
            title: notification.title,
            description: notification.description,
            timeAgo: notification.timeAgo,
            stockCountId: notification.stockCountId,
          },
        });
        break;

      case "transfer_approved":
        await openTransferApproved(notification);
        break;

      case "import_completed":
        await openImportCompleted(notification);
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
          />

          <main className="flex-1 overflow-y-auto p-7 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Outlet />
          </main>
        </div>
      </div>

      <NotificationDialogs activeDialog={activeDialog} onClose={() => setActiveDialog(null)} onNavigate={navigate} />
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

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
