import React from "react";
import { Check } from "lucide-react";
export const InfoField = ({ label, value, valueClassName = "" }) => (
  <div>
    <div className="text-[11.5px] text-gray-400 font-medium mb-0.5">{label}</div>
    <div className={`text-[13.5px] font-bold text-[#1E2740] ${valueClassName}`}>{value ?? "—"}</div>
  </div>
);

const PILL_TONES = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-600",
  gray: "bg-gray-100 text-gray-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

export const Pill = ({ tone = "gray", children, className = "" }) => (
  <span className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${PILL_TONES[tone] || PILL_TONES.gray} ${className}`}>
    {children}
  </span>
);

const STAT_TONES = {
  green: { bg: "bg-green-50", fg: "text-green-600" },
  red: { bg: "bg-red-50", fg: "text-red-600" },
  orange: { bg: "bg-orange-50", fg: "text-orange-600" },
  amber: { bg: "bg-amber-50", fg: "text-amber-700" },
  blue: { bg: "bg-blue-50", fg: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", fg: "text-indigo-600" },
  gray: { bg: "bg-gray-50", fg: "text-gray-600" },
};

export const StatBox = ({ icon: Icon, tone = "gray", label, value, valueClassName = "", sub }) => {
  const t = STAT_TONES[tone] || STAT_TONES.gray;
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.bg}`}>
          <Icon size={16} className={t.fg} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11.5px] text-gray-400 font-medium">{label}</div>
        <div className={`text-[15px] font-bold ${t.fg} ${valueClassName}`}>{value}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};


export const ItemCell = ({ image, name, sub }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <span className="text-[11px] text-gray-400 font-bold">{(name || "?").charAt(0).toUpperCase()}</span>}
    </div>
    <div className="min-w-0">
      <div className="text-[13px] font-semibold text-[#1E2740] truncate">{name}</div>
      {sub && <div className="text-[11px] text-gray-400 truncate">{sub}</div>}
    </div>
  </div>
);

const BTN_BASE = "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors whitespace-nowrap";
const BTN_VARIANTS = {
  ghost: "border border-gray-200 text-[#1E2740] hover:bg-gray-50",
  outline: "border border-indigo-200 text-indigo-600 hover:bg-indigo-50",
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  orange: "bg-orange-500 text-white hover:bg-orange-600",
};

export const DialogButton = ({ icon: Icon, variant = "ghost", onClick, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${BTN_BASE} ${BTN_VARIANTS[variant] || BTN_VARIANTS.ghost} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {Icon && <Icon size={14} />}
    {children}
  </button>
);


export const WorkflowStepper = ({ steps = [] }) => (
  <div className="flex items-start">
    {steps.map((step, i) => {
      const isDone = step.status === "done";
      const isCurrent = step.status === "current";
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center text-center w-28 flex-shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                isDone ? "bg-green-500 text-white" : isCurrent ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {isDone ? <Check size={13} /> : i + 1}
            </div>
            <div className="text-[12px] font-bold text-[#1E2740] mt-2">{step.label}</div>
            {step.date && <div className="text-[10.5px] text-gray-400 mt-0.5">{step.date}</div>}
            {step.by && <div className="text-[10.5px] text-gray-500">{step.by}</div>}
            {step.byRole && <div className="text-[10px] text-gray-400">({step.byRole})</div>}
            {!step.date && !step.by && step.status === "pending" && (
              <div className="text-[10.5px] text-gray-400 mt-0.5">Pending</div>
            )}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 mt-3.5 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export const Banner = ({ tone = "blue", children, className = "" }) => {
  const tones = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    amber: "bg-amber-50 border-amber-100 text-amber-800",
    green: "bg-green-50 border-green-100 text-green-700",
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-[12.5px] leading-relaxed ${tones[tone] || tones.blue} ${className}`}>
      {children}
    </div>
  );
};