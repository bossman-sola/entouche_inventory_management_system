import { Icon, icons } from "./icons.jsx";

export const TRANSFER_STATUSES = ["draft", "pending_approval", "approved", "completed", "rejected", "cancelled"];

export const STATUS_META = {
  draft: { label: "Draft", classes: "bg-gray-100 text-gray-600" },
  pending_approval: { label: "Pending Approval", classes: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", classes: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", classes: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700" },
};

export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status || "Unknown", classes: "bg-gray-100 text-gray-600" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${meta.classes}`}>{meta.label}</span>;
};

export const Spinner = ({ size = 14, className = "" }) => (
  <Icon d={icons.spinner} size={size} className={`animate-spin ${className}`} />
);

export const Select = ({ value, onChange, options, placeholder, className = "", disabled = false }) => (
  <div className={`relative ${className}`}>
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:bg-gray-50 disabled:text-gray-400">
      <option value="">{placeholder}</option>
      {Array.from(new Map(options.map(o => [String(typeof o === "string" ? o : o.value), o])).values()).map(o => {
        const label = String(typeof o === "string" ? o : o.label).replace(/\s*--\s*/g, " ").trim();
        return typeof o === "string" ? <option key={o} value={o}>{label}</option> : <option key={o.value} value={o.value}>{label}</option>;
      })}
    </select>
    <Icon d={icons.chevronDown} size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

export const DateTimePicker = ({ label, required, value, onChange, showTime = false, className = "" }) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        <input
          type={showTime ? "datetime-local" : "date"}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
