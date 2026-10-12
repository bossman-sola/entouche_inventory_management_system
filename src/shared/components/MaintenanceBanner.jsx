import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function MaintenanceBanner({ maintenance, onViewDetails }) {
  const [dismissed, setDismissed] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => setDismissed(false), [maintenance?.id, maintenance?.status]);

  useEffect(() => {
    if (!maintenance) return undefined;
    const timer = window.setInterval(() => setTick((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, [maintenance]);

  if (!maintenance || dismissed) return null;

  const status = maintenance.status;
  const config = getConfig(status);
  const Icon = config.icon;

  return (
    <div className={`w-full shrink-0 border-b ${config.background} ${config.border} ${config.text}`}>
      <div className="min-h-[58px] px-6 py-2.5 flex items-center gap-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.iconBackground} ${config.iconColor}`}>
            <Icon size={19} />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold">{getTitle(status)}</div>
            <div className="text-[12px] mt-0.5 opacity-90 truncate">{maintenance.message}</div>
          </div>
        </div>

        {status === "scheduled" && <ScheduledTime maintenance={maintenance} />}

        {status === "in_progress" && (
          <div className="hidden lg:block shrink-0 text-[11px]">
            <div className="opacity-70">Estimated completion</div>
            <div className="font-bold text-[13px] mt-0.5">{formatDateTime(maintenance.ends_at)}</div>
          </div>
        )}

        <button type="button" onClick={() => onViewDetails?.(maintenance)} className={`hidden sm:block px-4 py-2 rounded-lg border text-[12px] font-semibold bg-transparent transition-colors ${config.button}`}>
          {status === "in_progress" ? "View status page" : "View details"}
        </button>

        <button type="button" aria-label="Dismiss maintenance banner" onClick={() => setDismissed(true)} className="p-1.5 rounded-md hover:bg-black/5 transition-colors shrink-0">
          <X size={17} />
        </button>
      </div>
    </div>
  );
}

function ScheduledTime({ maintenance }) {
  const diff = Math.max(new Date(maintenance.starts_at).getTime() - Date.now(), 0);
  const totalMinutes = Math.floor(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="hidden md:flex items-center gap-2 shrink-0 border-l border-current/20 pl-5">
      <div className="text-[10px] leading-tight opacity-70">Starts in</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[18px] font-bold">{String(hours).padStart(2, "0")}</span><span className="text-[10px]">hrs</span>
        <span className="text-[18px] font-bold ml-1">{String(minutes).padStart(2, "0")}</span><span className="text-[10px]">mins</span>
      </div>
    </div>
  );
}

function getTitle(status) {
  return {
    scheduled: "Scheduled maintenance upcoming",
    in_progress: "System maintenance in progress",
    completed: "Maintenance completed",
    cancelled: "Maintenance cancelled",
  }[status] ?? "System maintenance";
}

function getConfig(status) {
  const configs = {
    scheduled: { background: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", iconBackground: "bg-blue-100", iconColor: "text-blue-600", button: "border-blue-300 text-blue-700 hover:bg-blue-100", icon: Info },
    in_progress: { background: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", iconBackground: "bg-orange-100", iconColor: "text-orange-600", button: "border-orange-300 text-orange-700 hover:bg-orange-100", icon: AlertTriangle },
    completed: { background: "bg-green-50", border: "border-green-200", text: "text-green-800", iconBackground: "bg-green-100", iconColor: "text-green-600", button: "border-green-300 text-green-700 hover:bg-green-100", icon: CheckCircle2 },
    cancelled: { background: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", iconBackground: "bg-slate-100", iconColor: "text-slate-500", button: "border-slate-300 text-slate-700 hover:bg-slate-100", icon: Info },
  };
  return configs[status] ?? configs.scheduled;
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(value));
}
