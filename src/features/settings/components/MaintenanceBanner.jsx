import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export default function MaintenanceBanner({
  maintenance,
}) {
  const [dismissed, setDismissed] =
    useState(false);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setDismissed(false);
  }, [maintenance?.id, maintenance?.status]);

  // Keep countdown current.
  useEffect(() => {
    if (!maintenance) return undefined;

    const interval = window.setInterval(() => {
      forceUpdate((value) => value + 1);
    }, 60_000);

    return () =>
      window.clearInterval(interval);
  }, [maintenance]);

  if (!maintenance || dismissed) {
    return null;
  }

  const status =
    maintenance.displayStatus ??
    maintenance.status;

  const config = getBannerConfig(status);

  const Icon = config.icon;

  return (
    <div
      style={{
        width: "100%",
        background: config.background,
        borderBottom: `1px solid ${config.border}`,
        color: config.text,
        position: "relative",
        zIndex: 100,
      }}
    >
      <div
        style={{
          minHeight: 56,
          padding: "10px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 280,
          }}
        >
          <Icon
            size={20}
            style={{
              flexShrink: 0,
              color: config.iconColor,
            }}
          />

          <div>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              {getTitle(status)}
            </div>

            <div
              style={{
                fontSize: 12.5,
                marginTop: 2,
                opacity: 0.9,
              }}
            >
              {maintenance.message}
            </div>
          </div>
        </div>

        {status === "scheduled" && (
          <Countdown
            startsAt={maintenance.starts_at}
          />
        )}

        {status === "in_progress" && (
          <div
            style={{
              fontSize: 12.5,
              whiteSpace: "nowrap",
            }}
          >
            Estimated completion:{" "}
            <strong>
              {formatTime(
                maintenance.ends_at,
              )}
            </strong>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            // We'll wire this to the maintenance
            // details/status page later.
          }}
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: `1px solid ${config.buttonBorder}`,
            borderRadius: 7,
            color: config.buttonText,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {status === "in_progress"
            ? "View status page"
            : "View details"}
        </button>

        <button
          type="button"
          aria-label="Dismiss maintenance banner"
          onClick={() => setDismissed(true)}
          style={{
            border: "none",
            background: "transparent",
            color: config.text,
            cursor: "pointer",
            display: "flex",
            padding: 6,
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function Countdown({ startsAt }) {
  const diff = Math.max(
    new Date(startsAt).getTime() -
      Date.now(),
    0,
  );

  const totalMinutes = Math.floor(
    diff / 60_000,
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes =
    totalMinutes % 60;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 5,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: 11,
          opacity: 0.75,
          marginRight: 4,
        }}
      >
        Starts in
      </span>

      <strong
        style={{
          fontSize: 18,
        }}
      >
        {String(hours).padStart(2, "0")}
      </strong>

      <span
        style={{
          fontSize: 11,
        }}
      >
        hrs
      </span>

      <strong
        style={{
          fontSize: 18,
          marginLeft: 4,
        }}
      >
        {String(minutes).padStart(2, "0")}
      </strong>

      <span
        style={{
          fontSize: 11,
        }}
      >
        mins
      </span>
    </div>
  );
}

function getTitle(status) {
  switch (status) {
    case "scheduled":
      return "Scheduled maintenance upcoming";

    case "in_progress":
      return "System maintenance in progress";

    case "completed":
      return "Maintenance completed";

    case "cancelled":
      return "Maintenance cancelled";

    default:
      return "System maintenance";
  }
}

function getBannerConfig(status) {
  switch (status) {
    case "in_progress":
      return {
        background: "#fff7ed",
        border: "#fdba74",
        text: "#9a3412",
        iconColor: "#ea580c",
        buttonBorder: "#fb923c",
        buttonText: "#c2410c",
        icon: AlertTriangle,
      };

    case "completed":
      return {
        background: "#f0fdf4",
        border: "#86efac",
        text: "#166534",
        iconColor: "#16a34a",
        buttonBorder: "#86efac",
        buttonText: "#166534",
        icon: CheckCircle2,
      };

    case "cancelled":
      return {
        background: "#f8fafc",
        border: "#cbd5e1",
        text: "#475569",
        iconColor: "#64748b",
        buttonBorder: "#cbd5e1",
        buttonText: "#475569",
        icon: Info,
      };

    case "scheduled":
    default:
      return {
        background: "#eff6ff",
        border: "#93c5fd",
        text: "#1e3a8a",
        iconColor: "#2563eb",
        buttonBorder: "#93c5fd",
        buttonText: "#1d4ed8",
        icon: Info,
      };
  }
}

function formatTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    },
  ).format(new Date(value));
}