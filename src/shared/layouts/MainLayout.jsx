import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Logo from "../../assets/icons/Logo.svg?react";
import DashboardIcon from "../../assets/icons/Dashboard.svg?react";
import HomeIcon from "../../assets/icons/Home.svg?react";
import ItemsIcon from "../../assets/icons/Items.svg?react";
import ReportIcon from "../../assets/icons/Report.svg?react";
import DataIcon from "../../assets/icons/Data.svg?react";
import UsersIcon from "../../assets/icons/Users.svg?react";
import WarehouseIcon from "../../assets/icons/Warehouse.svg?react";
import AuditIcon from "../../assets/icons/Audit.svg?react";
import SettingsIcon from "../../assets/icons/Settings.svg?react";
import Notifications from "./Notifications";
import AlertDialog from "./dialogs/Alertdialog";
import ReceiptCompletedDialog from "./dialogs/ReceiptCompletedDialog";
import TransferApprovedDialog from "./dialogs/TransferApprovedDialog";
import TransferCompletedDialog from "./dialogs/TransferCompletedDialog";
import AdjustmentPendingDialog from "./dialogs/AdjustmentPendingDialog";
import StockCountVarianceDialog from "./dialogs/StockCountVarianceDialog";
import NewReceiptApprovalDialog from "./dialogs/NewReceiptApprovalDialog";
import UserCreatedDialog from "./dialogs/UserCreatedDialog";
import SystemMaintenanceDialog from "./dialogs/SystemMaintenanceDialog";
import ImportCompletedDialog from "./dialogs/ImportCompletedDialog";
import { RefreshCw as RefreshCwIcon, Boxes as BoxesIcon, FileBarChart2 as FileBarChart2Icon, PlugZap as PlugZapIcon } from "lucide-react";

import {
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Settings as SettingsGear,
  LogOut,
} from "lucide-react";


const DEMO_NOTIFICATIONS = [
  {
    id: "n1",
    type: "low_stock_alert",
    title: "Low Stock Alert",
    description: "Dell Latitude 5440 is low on stock at Storage Area.",
    timeAgo: "2 min ago",
    unread: true,
    itemId: "LAP-001",
  },
  {
    id: "n2",
    type: "receipt_completed",
    title: "Receipt Completed",
    description: "Receipt RCPT-000156 has been completed and added to inventory.",
    timeAgo: "15 min ago",
    unread: true,
    receiptId: "RCPT-000156",
  },
  {
    id: "n3",
    type: "transfer_approved",
    title: "Transfer Approved",
    description: "Transfer TRF-000089 has been approved and is ready for completion.",
    timeAgo: "32 min ago",
    unread: true,
    transferId: "TRF-000089",
  },
  {
    id: "n4",
    type: "reorder_level_reached",
    title: "Reorder Level Reached",
    description: "HP LaserJet Pro has reached reorder level at Storage Area.",
    timeAgo: "1 hr ago",
    unread: true,
    itemId: "HPLJ-M404",
  },
  {
    id: "n5",
    type: "adjustment_pending",
    title: "Adjustment Pending",
    description: "Adjustment ADJ-000045 for item iPhone 13 is awaiting approval.",
    timeAgo: "1 hr ago",
    unread: true,
    adjustmentId: "ADJ-000045",
  },
  {
    id: "n6",
    type: "stock_count_variance",
    title: "Stock Count Variance",
    description: "Stock Count SC-000123 has variance exceeding the allowed limit.",
    timeAgo: "2 hr ago",
    unread: false,
    stockCountId: "SC-000123",
  },
  {
    id: "n7",
    type: "system_maintenance",
    title: "System Maintenance Scheduled",
    description: "System maintenance planned for July 25, 2026 at 02:00 AM.",
    timeAgo: "2 hr ago",
    unread: false,
  },
  {
    id: "n8",
    type: "new_receipt_awaiting_approval",
    title: "New Receipt Awaiting Approval",
    description: "Receipt RCPT-000157 has been submitted and is awaiting approval.",
    timeAgo: "3 hr ago",
    unread: false,
    receiptId: "RCPT-000157",
  },
  {
    id: "n9",
    type: "import_completed",
    title: "Import Completed",
    description: "Import IMP-000045 has been completed successfully. 245 items were imported.",
    timeAgo: "Just now",
    unread: true,
  },
  {
    id: "n10",
    type: "user_created",
    title: "User Created",
    description: "New user Michael Johnson has been created and account is active.",
    timeAgo: "5 min ago",
    unread: true,
  },
];

const DEMO_DIALOG_DATA = {
  low_stock_alert: {
    item: { name: "Dell Latitude 5440", sku: "LAP-001", category: "Laptops", brand: "Dell", unit: "PCS", status: "Active" },
    locations: [
      { name: "Receiving Area", zone: "Receiving Zone", onHand: 0, reserved: 0, available: 0, status: "Out of Stock" },
      { name: "Storage Area", zone: "Storage Zone A", onHand: 15, reserved: 0, available: 15, status: "Low Stock" },
      { name: "Dispatch Area", zone: "Dispatch Zone", onHand: 2, reserved: 0, available: 2, status: "In Stock" },
      { name: "Damaged Goods Area", zone: "Damage Zone", onHand: 0, reserved: 0, available: 0, status: "Out of Stock" },
    ],
    stats: { totalAvailable: 17, reorderLevel: 20, shortage: 3, leadTimeDays: 5 },
  },
  reorder_level_reached: {
    item: { name: "HP LaserJet Pro M404dn", sku: "HPLJ-M404", category: "Printers", brand: "HP", unit: "PCS", status: "Active" },
    locations: [
      { name: "Receiving Area", zone: "Receiving Zone", onHand: 0, reserved: 0, available: 0, status: "Out of Stock" },
      { name: "Storage Area", zone: "Storage Zone A", onHand: 10, reserved: 0, available: 10, status: "Reorder Level" },
      { name: "Dispatch Area", zone: "Dispatch Zone", onHand: 3, reserved: 0, available: 3, status: "In Stock" },
      { name: "Damaged Goods Area", zone: "Damage Zone", onHand: 0, reserved: 0, available: 0, status: "Out of Stock" },
    ],
    stats: { totalAvailable: 10, reorderLevel: 10, leadTimeDays: 3 },
  },
  receipt_completed: {
    receipt: { number: "RCPT-000156", completedOn: "May 20, 2025 10:15 AM", receivedBy: "John Michael", supplier: "Dell Technologies", warehouse: "Main Warehouse", type: "Purchase Receipt" },
    items: [{ name: "Dell Latitude 5440", cat: "Laptops", sku: "DL-5440", qty: 20, unit: "PCS", unitCost: 650000, totalCost: 13000000 }],
    totals: { items: 1, qty: "20 PCS", amount: 13000000 },
    inventoryUpdates: [{ location: "Storage Area", zone: "Storage Zone A", previous: "10 PCS", received: "20 PCS", newStock: "30 PCS" }],
    notes: "Dell laptop delivery for Q2 purchase order.",
  },
  transfer_approved: {
    transfer: { number: "TRF-000089", approvedOn: "May 20, 2025 9:42 AM", approvedBy: "Michael Johnson", approvedByRole: "Warehouse Manager", fromLocation: "Receiving Area", fromZone: "Receiving Zone", toLocation: "Storage Area A", toZone: "Storage Zone A", purpose: "Regular Stock Transfer" },
    items: [
      { name: "Dell Latitude 5440", cat: "Laptops", sku: "DL-5440", qty: 15, unit: "PCS" },
      { name: 'Dell 24" Monitor', cat: "Monitors", sku: "DM-24", qty: 5, unit: "PCS" },
    ],
    totals: { items: 2, qty: "20 PCS", type: "Stock Transfer" },
    details: { requestedOn: "May 20, 2025 8:55 AM", requestedBy: "John Michael", requestedByRole: "Inventory Officer", reference: "PO-REF-2025-048", status: "Approved" },
  },
  transfer_completed: {
    transfer: { number: "TRF-000089", completedOn: "May 20, 2025 10:28 AM", completedBy: "John Michael", completedByRole: "Inventory Officer", fromLocation: "Receiving Area", fromZone: "Receiving Zone", toLocation: "Storage Area A", toZone: "Storage Zone A", purpose: "Regular Stock Transfer" },
    items: [
      { name: "Dell Latitude 5440", cat: "Laptops", sku: "DL-5440", qty: 15, unit: "PCS" },
      { name: 'Dell 24" Monitor', cat: "Monitors", sku: "DM-24", qty: 5, unit: "PCS" },
    ],
    totals: { items: 2, qty: "20 PCS" },
    summary: { previousLocation: "Receiving Area", previousStock: "25 PCS", transferredOut: "20 PCS", transferredIn: "20 PCS", newLocation: "Storage Area A", newStock: "120 PCS" },
    notes: "Transfer completed and inventory updated successfully.",
  },
  adjustment_pending: {
    adjustment: { number: "ADJ-000045", submittedOn: "May 20, 2025 11:35 AM", submittedBy: "John Michael", submittedByRole: "Inventory Officer", type: "Decrease", reason: "Damaged Goods", approvalFrom: "Michael Johnson", approvalFromRole: "Warehouse Manager" },
    items: [{ name: "iPhone 13", cat: "Mobile Phones", sku: "IP13-128", location: "Storage Area A", zone: "Storage Zone A", qtyChange: "-2", unit: "PCS" }],
    stockSummary: { previous: "10 PCS", adjustment: "-2 PCS", expected: "8 PCS" },
    details: { reasonDetails: "2 units damaged beyond repair during handling.", reference: "DAM-2025-005", affectedBy: "Handling Damage", attachment: "damage_photo.jpg" },
    workflowSteps: [
      { label: "Submitted", status: "done", date: "May 20, 2025 11:35 AM", by: "John Michael" },
      { label: "Pending Approval", status: "current", by: "Michael Johnson", byRole: "Warehouse Manager" },
      { label: "Approved", status: "pending" },
    ],
  },
  stock_count_variance: {
    count: { number: "SC-000123", countedOn: "May 20, 2025 2:45 PM", location: "Storage Area A", zone: "Storage Zone A", countType: "Cycle Count", countedBy: "John Michael", countedByRole: "Inventory Officer", approvalFrom: "Michael Johnson", approvalFromRole: "Warehouse Manager" },
    summary: { itemsCounted: 25, totalVarianceQty: "-15 PCS", totalVarianceValue: 215000, variancePct: 5.62 },
    varianceLevels: [
      { level: "Critical", range: "> 10%", items: 2, qty: "-8 PCS", value: 130000 },
      { level: "High", range: "5% - 10%", items: 3, qty: "-5 PCS", value: 85000 },
      { level: "Low", range: "2% - 5%", items: 6, qty: "-2 PCS", value: 25000 },
      { level: "Within Limit", range: "≤ 2%", items: 14, qty: "0 PCS", value: 0 },
    ],
    topVariances: [
      { name: "Dell Latitude 5440", cat: "Laptops", sku: "DL-5440", systemQty: "20 PCS", countedQty: "15 PCS", variance: "-5 PCS", variancePct: -25.0 },
      { name: "iPhone 13", cat: "Mobile Phones", sku: "IP13-128", systemQty: "10 PCS", countedQty: "6 PCS", variance: "-4 PCS", variancePct: -40.0 },
      { name: 'Dell 24" Monitor', cat: "Monitors", sku: "DM-24", systemQty: "8 PCS", countedQty: "7 PCS", variance: "-1 PCS", variancePct: -12.5 },
    ],
  },
  new_receipt_awaiting_approval: {
    receipt: { number: "RCPT-000157", submittedOn: "May 22, 2025 9:18 AM", submittedBy: "John Michael", submittedByRole: "Inventory Officer", supplier: "Dell Technologies", warehouse: "Main Warehouse", type: "Purchase Receipt", expectedDeliveryDate: "May 22, 2025" },
    items: [
      { name: "Dell Latitude 5440", cat: "Laptops", sku: "DL-5440", qty: 20, unit: "PCS", unitCost: 650000, totalCost: 13000000 },
      { name: 'Dell 24" Monitor', cat: "Monitors", sku: "DM-24", qty: 10, unit: "PCS", unitCost: 120000, totalCost: 1200000 },
      { name: "Dell Wireless Mouse", cat: "Accessories", sku: "WM-500", qty: 25, unit: "PCS", unitCost: 15000, totalCost: 375000 },
    ],
    totals: { items: 3, qty: "55 PCS", amount: 14575000, taxPct: 7.5, taxAmount: 1093125 },
    reference: { poNumber: "PO-2025-05-078", invoiceNumber: "INV-2025-05078", deliveryNote: "DN-2025-05078" },
    notes: "New laptops for Q2 project deployment.",
    workflowSteps: [
      { label: "Submitted", status: "done", date: "May 22, 2025 9:18 AM", by: "John Michael" },
      { label: "Pending Approval", status: "current", by: "Michael Johnson", byRole: "Warehouse Manager" },
      { label: "Approved", status: "pending" },
    ],
  },
  system_maintenance: {
    maintenance: {
      startsAt: "May 24, 2025 11:00 PM",
      endsAt: "May 25, 2025 02:00 AM",
      id: "MAINT-2025-05-24-001",
      initiatedBy: "System Administrator",
      reason: "Database optimization, security updates and system performance improvements.",
      impactLevel: "Medium",
      durationLabel: "3 hours",
      statusNote: "The system will remain accessible, but some operations may be slower than usual.",
    },
    features: [
      { icon: RefreshCwIcon, label: "Transactions", note: "May be delayed" },
      { icon: BoxesIcon, label: "Inventory Updates", note: "May be restricted" },
      { icon: FileBarChart2Icon, label: "Reporting", note: "May be unavailable" },
      { icon: PlugZapIcon, label: "Integrations", note: "May be limited" },
    ],
    actionItems: [
      "Wrap up important transactions before the maintenance window.",
      "Avoid initiating large imports or exports during this period.",
      "Saved data will not be affected.",
      "We appreciate your patience and understanding.",
    ],
  },
  import_completed: {
    importInfo: {
      id: "IMP-000045",
      type: "Items",
      fileName: "items_import_2025-05-24.xlsx",
      source: "Excel File Upload",
      importedBy: "Ayomide Ajayi",
      importedByRole: "System Administrator",
      warehouse: "Main Warehouse",
      completedOn: "May 24, 2025 02:45 PM",
      totalRows: 262,
      durationLabel: "1 min 32 sec",
    },
    stats: { imported: 245, importedPct: 93.5, updated: 8, updatedPct: 3.1, skipped: 6, skippedPct: 2.3, failed: 3, failedPct: 1.1 },
    summaryRows: [
      { kind: "imported", status: "Successfully Imported", description: "New items added to inventory", count: 245, pct: 93.5 },
      { kind: "updated", status: "Updated", description: "Existing items updated", count: 8, pct: 3.1 },
      { kind: "skipped", status: "Skipped", description: "Duplicates or unchanged items", count: 6, pct: 2.3 },
      { kind: "failed", status: "Failed", description: "Errors during import", count: 3, pct: 1.1 },
    ],
    fileSummary: { fileSize: "125.6 KB", fileType: "Microsoft Excel (.xlsx)", sheetsProcessed: 1, itemsPerSheet: 262 },
    nextSteps: [
      "All valid items have been imported to inventory.",
      "You can review the import log for details.",
      "Download the error report to fix failed rows.",
    ],
  },
  user_created: {
    user: {
      name: "Michael Johnson",
      role: "Inventory Officer",
      status: "Active",
      email: "michael.johnson@delltech.com",
      phone: "+234 801 234 5678",
    },
    details: {
      userId: "USR-000248",
      username: "michael.johnson",
      role: "Inventory Officer",
      status: "Active",
      department: "Warehouse Operations",
      dateCreated: "May 22, 2025 10:15 AM",
      warehouseAccess: "Main Warehouse, Storage Zone A",
      lastLogin: "Never",
      createdBy: "Ayomide Ajayi",
      createdByRole: "System Administrator",
      temporaryPassword: "Auto-generated (Email Sent)",
    },
  },
};

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [warehouseOpen, setWarehouseOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [activeDialog, setActiveDialog] = useState(null); // { type, data } | null
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/signin", { replace: true });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleDeleteNotification = (notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  };

  const handleViewAllNotifications = () => {
    setNotifOpen(false);
    navigate("/notifications");
  };

  const handleNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
    );
    setNotifOpen(false);

    switch (notification.type) {
      case "low_stock_alert":
        setActiveDialog({ type: "low_stock_alert", data: DEMO_DIALOG_DATA.low_stock_alert });
        break;
      case "reorder_level_reached":
        setActiveDialog({ type: "reorder_level_reached", data: DEMO_DIALOG_DATA.reorder_level_reached });
        break;
      case "receipt_completed":
        setActiveDialog({ type: "receipt_completed", data: DEMO_DIALOG_DATA.receipt_completed });
        break;
      case "transfer_approved":
        setActiveDialog({ type: "transfer_approved", data: DEMO_DIALOG_DATA.transfer_approved });
        break;
      case "transfer_completed":
        setActiveDialog({ type: "transfer_completed", data: DEMO_DIALOG_DATA.transfer_completed });
        break;
      case "adjustment_pending":
        setActiveDialog({ type: "adjustment_pending", data: DEMO_DIALOG_DATA.adjustment_pending });
        break;
      case "stock_count_variance":
        setActiveDialog({ type: "stock_count_variance", data: DEMO_DIALOG_DATA.stock_count_variance });
        break;
      case "new_receipt_awaiting_approval":
        setActiveDialog({ type: "new_receipt_awaiting_approval", data: DEMO_DIALOG_DATA.new_receipt_awaiting_approval });
        break;
      case "user_created":
        setActiveDialog({ type: "user_created", data: DEMO_DIALOG_DATA.user_created });
        break;
      case "system_maintenance":
        setActiveDialog({ type: "system_maintenance", data: DEMO_DIALOG_DATA.system_maintenance });
        break;
      case "import_completed":
        setActiveDialog({ type: "import_completed", data: DEMO_DIALOG_DATA.import_completed });
        break;
      case "import_failed":
        break;
      default:
        break;
    }
  };

  const closeDialog = () => setActiveDialog(null);
  const goTo = (path) => { closeDialog(); navigate(path); };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-['Inter'] text-[#1E2740] overflow-hidden selection:bg-indigo-100">
      <motion.aside
        animate={{ width: isCollapsed ? 70 : 190 }}
        transition={{ duration: 0.3, ease: "circOut" }}
        className="bg-[#1E2740] text-white flex flex-col h-full z-20 flex-shrink-0"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 overflow-hidden whitespace-nowrap border-b border-slate-700/20">
          <div className="min-w-[32px] h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center shadow-inner">
            <Logo className="text-white w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight">
                Entouche
              </span>
              <span className="text-[9px] text-[#6B7591] font-semibold tracking-wider">
                Enterprise Inventory
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Menu */}
          <div>
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-[#6B7591] mb-3 px-3 tracking-[0.15em] uppercase">
                Menu
              </p>
            )}
            <div className="space-y-1">
              <SidebarLink
                to="/"
                icon={<DashboardIcon className="w-[18px] h-[18px]" />}
                label="Dashboard"
                isCollapsed={isCollapsed}
                end={true}
              />
              <SidebarLink
                to="/items"
                icon={<ItemsIcon className="w-[18px] h-[18px]" />}
                label="Items"
                isCollapsed={isCollapsed}
              />
            </div>
          </div>

          {/* Inventory section */}
          <div>
            {!isCollapsed && (
              <button
                onClick={() => setInventoryOpen((o) => !o)}
                className="flex justify-between items-center px-3 mb-3 w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-3.5 h-3.5 text-[#6B7591]" />
                  <p className="text-[10px] font-bold text-[#6B7591] tracking-[0.15em] uppercase">
                    Inventory
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: inventoryOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} className="text-[#6B7591]" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(inventoryOpen || isCollapsed) && (
                <motion.div
                  key="inventory"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <SidebarLink
                      to="/transactions"
                      label="Transactions"
                      isCollapsed={isCollapsed}
                    />
                    <SidebarLink
                      to="/receipts"
                      label="Receipts"
                      isCollapsed={isCollapsed}
                    />
                    <SidebarLink
                      to="/transfers"
                      label="Transfers"
                      isCollapsed={isCollapsed}
                    />
                    <SidebarLink
                      to="/adjustments"
                      label="Adjustments"
                      isCollapsed={isCollapsed}
                    />
                    <SidebarLink
                      to="/stock-counts"
                      label="Stock Counts"
                      isCollapsed={isCollapsed}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Warehouse section */}
          <div>
            {!isCollapsed && (
              <button
                onClick={() => setWarehouseOpen((o) => !o)}
                className="flex justify-between items-center px-3 mb-3 w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="w-3.5 h-3.5 text-[#6B7591]" />
                  <p className="text-[10px] font-bold text-[#6B7591] tracking-[0.15em] uppercase">
                    Warehouse
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: warehouseOpen ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} className="text-[#6B7591]" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(warehouseOpen || isCollapsed) && (
                <motion.div
                  key="warehouse"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <SidebarLink
                      to="/overview"
                      label="Overview"
                      isCollapsed={isCollapsed}
                    />
                    <SidebarLink
                      to="/locations"
                      label="Locations"
                      isCollapsed={isCollapsed}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom links */}
          <div className="pt-4 border-t border-slate-700/30 space-y-1">
            <SidebarLink
              to="/reports"
              icon={<ReportIcon className="w-[18px] h-[18px]" />}
              label="Reports"
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/user"
              icon={<UsersIcon className="w-[18px] h-[18px]" />}
              label="Users & Roles"
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/data"
              icon={<DataIcon className="w-[18px] h-[18px]" />}
              label="Data Import"
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/audit"
              icon={<AuditIcon className="w-[18px] h-[18px]" />}
              label="Audit Logs"
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/settings"
              icon={<SettingsIcon className="w-[18px] h-[18px]" />}
              label="Settings"
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className="p-4 border-t border-slate-700/30 bg-[#1E2740]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 px-3 py-2 text-[#6B7591] hover:text-white text-sm w-full transition-all overflow-hidden whitespace-nowrap"
          >
            <div className="min-w-[18px]">
              {isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </div>
            {!isCollapsed && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search items, transactions, users..."
              className="w-full bg-[#F3F4F6] border-none rounded-lg py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-[#4F46E5] outline-none text-gray-500 placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <div
                onClick={() => setNotifOpen((o) => !o)}
                className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <Bell size={18} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 border-2 border-white text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <Notifications
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onNotificationClick={handleNotificationClick}
                onToggleRead={handleToggleRead}
                onDelete={handleDeleteNotification}
                onViewAll={handleViewAllNotifications}
              />
            </div>

            <HelpCircle size={18} className="text-gray-500 cursor-pointer" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-[11px]">
                  {initials}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold text-[#1E2740] group-hover:text-indigo-600 transition-colors">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-[#6B7591] font-semibold uppercase tracking-tight">
                    {user?.roles?.[0]?.name
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} className="text-gray-400" />
                </motion.div>
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-30 origin-top-right"
                  >
                    <div className="py-1">
                      <DropdownItem
                        icon={<User size={16} />}
                        label="My Profile"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/settings");
                        }}
                      />
                      <DropdownItem
                        icon={<SettingsGear size={16} />}
                        label="Account Settings"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/settings");
                        }}
                      />
                    </div>

                    <div className="border-t border-gray-100 my-1" />

                    <div className="py-1">
                      <DropdownItem
                        icon={<LogOut size={16} />}
                        label="Sign Out"
                        onClick={handleSignOut}
                        danger
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-7 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Notification detail dialogs */}
      <AlertDialog
        isOpen={activeDialog?.type === "low_stock_alert"}
        variant="low_stock"
        onClose={closeDialog}
        {...(activeDialog?.type === "low_stock_alert" ? activeDialog.data : {})}
        onCreateReceipt={() => goTo("/receipts")}
        onTransferStock={() => goTo("/transfers")}
        onAdjustStock={() => goTo("/adjustments")}
        onViewStockHistory={closeDialog}
      />
      <AlertDialog
        isOpen={activeDialog?.type === "reorder_level_reached"}
        variant="reorder"
        onClose={closeDialog}
        {...(activeDialog?.type === "reorder_level_reached" ? activeDialog.data : {})}
        onCreateReceipt={() => goTo("/receipts")}
        onAdjustStock={() => goTo("/adjustments")}
        onViewStockHistory={closeDialog}
      />
      <ReceiptCompletedDialog
        isOpen={activeDialog?.type === "receipt_completed"}
        onClose={closeDialog}
        {...(activeDialog?.type === "receipt_completed" ? activeDialog.data : {})}
        onViewReceiptDetails={() => goTo("/receipts")}
        onViewInventory={() => goTo("/items")}
      />
      <TransferApprovedDialog
        isOpen={activeDialog?.type === "transfer_approved"}
        onClose={closeDialog}
        {...(activeDialog?.type === "transfer_approved" ? activeDialog.data : {})}
        onViewDetails={() => goTo("/transfers")}
        onComplete={closeDialog}
        onPrintSlip={closeDialog}
      />
      <TransferCompletedDialog
        isOpen={activeDialog?.type === "transfer_completed"}
        onClose={closeDialog}
        {...(activeDialog?.type === "transfer_completed" ? activeDialog.data : {})}
        onViewDetails={() => goTo("/transfers")}
        onPrintSlip={closeDialog}
      />
      <AdjustmentPendingDialog
        isOpen={activeDialog?.type === "adjustment_pending"}
        onClose={closeDialog}
        {...(activeDialog?.type === "adjustment_pending" ? activeDialog.data : {})}
        onViewDetails={() => goTo("/adjustments")}
        onApprove={closeDialog}
      />
      <StockCountVarianceDialog
        isOpen={activeDialog?.type === "stock_count_variance"}
        onClose={closeDialog}
        {...(activeDialog?.type === "stock_count_variance" ? activeDialog.data : {})}
        onViewFull={() => goTo("/stock-counts")}
        onRequestRecount={closeDialog}
        onReviewApprove={closeDialog}
      />
      <NewReceiptApprovalDialog
        isOpen={activeDialog?.type === "new_receipt_awaiting_approval"}
        onClose={closeDialog}
        {...(activeDialog?.type === "new_receipt_awaiting_approval" ? activeDialog.data : {})}
        onViewDetails={() => goTo("/receipts")}
        onPrint={closeDialog}
        onApprove={closeDialog}
      />
      <UserCreatedDialog
        isOpen={activeDialog?.type === "user_created"}
        onClose={closeDialog}
        {...(activeDialog?.type === "user_created" ? activeDialog.data : {})}
        onViewUser={() => goTo("/settings")}
        onAddAnotherUser={() => goTo("/settings")}
      />
      <SystemMaintenanceDialog
        isOpen={activeDialog?.type === "system_maintenance"}
        onClose={closeDialog}
        {...(activeDialog?.type === "system_maintenance" ? activeDialog.data : {})}
        onContactSupport={closeDialog}
        onViewHistory={closeDialog}
      />
      <ImportCompletedDialog
        isOpen={activeDialog?.type === "import_completed"}
        onClose={closeDialog}
        {...(activeDialog?.type === "import_completed" ? activeDialog.data : {})}
        onDownloadErrorReport={closeDialog}
        onViewImportLog={() => goTo("/data-import")}
      />
    </div>
  );
};

const SidebarLink = ({ to, icon, label, isCollapsed, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
        isActive
          ? "bg-[#4F46E5] text-white shadow-xl shadow-indigo-900/40"
          : "text-[#6B7591] hover:bg-slate-800 hover:text-white"
      }`
    }
  >
    {icon && <div className="min-w-[18px]">{icon}</div>}
    {!isCollapsed && (
      <span
        className={`text-[13.5px] font-medium whitespace-nowrap overflow-hidden tracking-tight ${!icon ? "pl-7" : ""}`}
      >
        {label}
      </span>
    )}
  </NavLink>
);

const DropdownItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13.5px] font-medium transition-colors text-left ${
      danger
        ? "text-red-500 hover:bg-red-50"
        : "text-[#1E2740] hover:bg-gray-50"
    }`}
  >
    <span className={danger ? "text-red-500" : "text-gray-400"}>{icon}</span>
    {label}
  </button>
);

export default MainLayout;