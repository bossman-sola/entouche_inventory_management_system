import { AlertTriangle, CheckCircle2, Check, Plus } from "lucide-react";

export const STATUSES = [
  "Draft",
  "Submitted",
  "Pending Review",
  "Approved",
  "Completed",
];

export const COUNT_TYPES = ["Cycle Count", "Spot Check", "Full Physical", "Recount"];

export const STATUS_STYLES = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-indigo-100 text-indigo-700",
  "Pending Review": "bg-amber-100 text-amber-700",
  Approved: "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

export const CALENDAR_TYPE_COLORS = {
  "Cycle Count": {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  "Full Physical": {
    dot: "bg-violet-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  "Spot Check": {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  Recount: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
};

export const ACTIVITY_ICONS = {
  variance: { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-500" },
  completed: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    color: "text-emerald-500",
  },
  submitted: { icon: Check, bg: "bg-blue-50", color: "text-blue-500" },
  created: { icon: Plus, bg: "bg-violet-50", color: "text-violet-500" },
};
