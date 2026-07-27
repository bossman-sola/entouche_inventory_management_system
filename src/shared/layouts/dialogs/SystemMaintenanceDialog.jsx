import React from "react";
import {
  Wrench,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle2,
  Headset,
  History,
} from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, DialogButton, Banner } from "./primitives";

const IMPACT_TONE = {
  Low: "green",
  Medium: "amber",
  High: "red",
  Critical: "red",
};

const FeatureCard = ({ icon: Icon, label, note }) => (
  <div className="flex items-center gap-2.5 border border-gray-100 rounded-xl px-3.5 py-3 bg-gray-50">
    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
      <Icon size={15} className="text-gray-500" />
    </div>
    <div className="min-w-0">
      <div className="text-[12.5px] font-bold text-[#1E2740] leading-tight">{label}</div>
      <div className="text-[11px] text-gray-400 leading-tight">{note}</div>
    </div>
  </div>
);

const ChecklistItem = ({ children }) => (
  <div className="flex items-start gap-2">
    <CheckCircle2 size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
    <span className="text-[12.5px] text-[#1E2740] leading-relaxed">{children}</span>
  </div>
);

const SystemMaintenanceDialog = ({
  isOpen,
  onClose,
  maintenance = {},
  features = [],
  actionItems = [],
  onContactSupport,
  onViewHistory,
}) => {
  if (!isOpen) return null;

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Wrench}
      iconBg="bg-blue-100"
      iconFg="text-blue-600"
      titleColor="text-blue-600"
      title="System Maintenance"
      subtitle="Scheduled maintenance is planned. Some features may be unavailable during this time."
      maxWidth="max-w-[820px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <DialogButton icon={History} variant="primary" onClick={onViewHistory}>
          View Maintenance History
        </DialogButton>
      }
    >
     
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Calendar size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 flex-1">
          <InfoField
            label="Maintenance Schedule"
            value={
              <span className="flex items-center gap-2 flex-wrap">
                {maintenance.startsAt}
                <ArrowRight size={13} className="text-gray-300" />
                {maintenance.endsAt}
              </span>
            }
          />
          <InfoField label="Maintenance ID" value={maintenance.id} />
          <InfoField label="Initiated By" value={maintenance.initiatedBy} />
          <InfoField label="Reason" value={maintenance.reason} />
          <InfoField
            label="Impact Level"
            value={<Pill tone={IMPACT_TONE[maintenance.impactLevel] || "amber"}>{maintenance.impactLevel || "—"}</Pill>}
          />
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
          <Clock size={12} />
          {`Duration: ${maintenance.durationLabel || "—"}`}
        </span>
      </div>
      <div className="mt-5">
        <div className="text-[13.5px] font-bold text-[#1E2740] mb-2">Features That May Be Affected</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400 text-[12.5px] py-4">No affected features listed.</div>
          ) : (
            features.map((f, i) => (
              <FeatureCard key={i} icon={f.icon || RefreshCw} label={f.label} note={f.note} />
            ))
          )}
        </div>
      </div>

      <Banner tone="amber" className="mt-5 flex items-center gap-2.5">
        <Info size={15} className="flex-shrink-0" />
        <span>{maintenance.statusNote || "The system will remain accessible, but some operations may be slower than usual."}</span>
      </Banner>
      <div className="grid grid-cols-3 gap-4 mt-5">
        <div className="col-span-2">
          <div className="text-[13.5px] font-bold text-[#1E2740] mb-3">What You Can Do</div>
          <div className="space-y-2.5">
            {actionItems.length === 0 ? (
              <div className="text-gray-400 text-[12.5px]">No recommended actions.</div>
            ) : (
              actionItems.map((item, i) => <ChecklistItem key={i}>{item}</ChecklistItem>)
            )}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#1E2740] mb-1.5">
            <Headset size={15} className="text-indigo-500" />
            Need Help?
          </div>
          <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
            If you have any questions or require assistance, please contact IT Support.
          </p>
          <DialogButton icon={Headset} variant="primary" onClick={onContactSupport}>
            Contact Support
          </DialogButton>
        </div>
      </div>

      <Banner tone="blue" className="mt-5 flex items-center gap-2.5">
        <Info size={15} className="flex-shrink-0" />
        <span>You will be notified once the maintenance is complete.</span>
      </Banner>
    </DialogShell>
  );
};

export default SystemMaintenanceDialog;


