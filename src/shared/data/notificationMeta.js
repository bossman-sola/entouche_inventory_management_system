import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ArrowLeftRight,
  RefreshCw,
  Package,
  UserPlus,
  ShieldAlert,
  Download,
  XCircle,
} from "lucide-react";

export const NOTIFICATION_META = {
  low_stock_alert: {
    label: "Low Stock Alert",
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconFg: "text-red-500",
    dot: "bg-red-500",
  },

  reorder_level_reached: {
    label: "Reorder Level Reached",
    icon: AlertCircle,
    iconBg: "bg-orange-50",
    iconFg: "text-orange-500",
    dot: "bg-orange-500",
  },

  receipt_completed: {
    label: "Receipt Completed",
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconFg: "text-green-500",
    dot: "bg-green-500",
  },

  transfer_approved: {
    label: "Transfer Approved",
    icon: ArrowLeftRight,
    iconBg: "bg-blue-50",
    iconFg: "text-blue-500",
    dot: "bg-blue-500",
  },

  transfer_completed: {
    label: "Transfer Completed",
    icon: RefreshCw,
    iconBg: "bg-teal-50",
    iconFg: "text-teal-600",
    dot: "bg-teal-500",
  },

  adjustment_pending: {
    label: "Adjustment Pending",
    icon: AlertCircle,
    iconBg: "bg-amber-50",
    iconFg: "text-amber-600",
    dot: "bg-amber-500",
  },

  stock_count_variance: {
    label: "Stock Count Variance",
    icon: AlertTriangle,
    iconBg: "bg-orange-50",
    iconFg: "text-orange-500",
    dot: "bg-orange-500",
  },

  new_receipt_awaiting_approval: {
    label: "New Receipt Awaiting Approval",
    icon: Package,
    iconBg: "bg-amber-50",
    iconFg: "text-amber-600",
    dot: "bg-amber-500",
  },

  user_created: {
    label: "User Created",
    icon: UserPlus,
    iconBg: "bg-indigo-50",
    iconFg: "text-indigo-500",
    dot: "bg-indigo-500",
  },

  system_maintenance: {
    label: "System Maintenance",
    icon: ShieldAlert,
    iconBg: "bg-purple-50",
    iconFg: "text-purple-500",
    dot: "bg-purple-500",
  },

  import_completed: {
    label: "Import Completed",
    icon: Download,
    iconBg: "bg-emerald-50",
    iconFg: "text-emerald-500",
    dot: "bg-emerald-500",
  },

  import_failed: {
    label: "Import Failed",
    icon: XCircle,
    iconBg: "bg-red-50",
    iconFg: "text-red-500",
    dot: "bg-red-500",
  },

  stock_count_created: {
    label: "Stock Count Created",
    icon: AlertCircle,
    iconBg: "bg-indigo-50",
    iconFg: "text-indigo-500",
    dot: "bg-indigo-500",
  },

  stock_count_updated: {
    label: "Stock Count Updated",
    icon: AlertCircle,
    iconBg: "bg-blue-50",
    iconFg: "text-blue-500",
    dot: "bg-blue-500",
  },

  stock_count_submitted: {
    label: "Stock Count Pending Review",
    icon: AlertCircle,
    iconBg: "bg-amber-50",
    iconFg: "text-amber-600",
    dot: "bg-amber-500",
  },

  stock_count_completed: {
    label: "Stock Count Completed",
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconFg: "text-green-500",
    dot: "bg-green-500",
  },

  stock_count_cancelled: {
    label: "Stock Count Cancelled",
    icon: XCircle,
    iconBg: "bg-gray-50",
    iconFg: "text-gray-500",
    dot: "bg-gray-400",
  },

  stock_count_requested: {
    label: "Stock Count Requested",
    icon: AlertTriangle,
    iconBg: "bg-orange-50",
    iconFg: "text-orange-500",
    dot: "bg-orange-500",
  },
};