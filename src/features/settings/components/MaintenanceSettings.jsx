import { useState } from "react";

import Field from "./Field";
import FieldRow from "./FieldRow";
import SettingsInput from "./SettingsInput";
import SettingsSelect from "./SettingsSelect";
import Toggle from "./Toggle";

import { settingsApi } from "../api/settingsApi";

export default function MaintenanceSettings(props) {
  const {
    maintenanceTitle,
    setMaintenanceTitle,

    maintenanceStart,
    setMaintenanceStart,

    maintenanceEnd,
    setMaintenanceEnd,

    maintenanceNotifyBefore,
    setMaintenanceNotifyBefore,

    maintenanceAffectedServices,
    setMaintenanceAffectedServices,

    maintenanceMessage,
    setMaintenanceMessage,

    maintenanceEmailNotifications,
    setMaintenanceEmailNotifications,

    showMaintenancePage,
    setShowMaintenancePage,

    showToast,

    onScheduled,
  } = props;

  const [scheduling, setScheduling] = useState(false);

  const handleCancel = () => {
    setMaintenanceStart("");
    setMaintenanceEnd("");
  };

  const handleSchedule = async () => {
    if (!maintenanceTitle?.trim()) {
      showToast?.("Maintenance title is required");
      return;
    }

    if (!maintenanceMessage?.trim()) {
      showToast?.("Maintenance message is required");
      return;
    }

    if (!maintenanceStart || !maintenanceEnd) {
      showToast?.("Start and end time are required");
      return;
    }

    const start = new Date(maintenanceStart);
    const end = new Date(maintenanceEnd);

    if (end <= start) {
      showToast?.("End time must be after the start time");
      return;
    }

    const notifyBeforeMap = {
      Immediately: 0,
      "5 minutes": 5,
      "15 minutes": 15,
      "30 minutes": 30,
      "1 hour": 60,
      "6 hours": 360,
      "12 hours": 720,
      "24 hours": 1440,
      "48 hours": 2880,
      "72 hours": 4320,
    };

    const affectedServiceMap = {
      "Entire System": "entire_system",
      Inventory: "inventory",
      Receipts: "receipts",
      Transfers: "transfers",
      "Stock Counts": "stock_counts",
      Reports: "reports",
      "Data Import": "data_import",
    };

    const toUtcIso = (value) => {
      if (!value) return null;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date.toISOString();
    };

    const payload = {
      title: maintenanceTitle.trim(),
      message: maintenanceMessage.trim(),

      starts_at: toUtcIso(maintenanceStart),
      ends_at: toUtcIso(maintenanceEnd),

      notify_before_minutes:
        notifyBeforeMap[maintenanceNotifyBefore] ?? 0,

      affected_service:
        affectedServiceMap[maintenanceAffectedServices] ??
        "entire_system",

      send_email_notifications:
        maintenanceEmailNotifications,

      show_maintenance_page: showMaintenancePage,
    };

    setScheduling(true);

    try {
      const maintenance =
        await settingsApi.scheduleMaintenance(payload);

      showToast?.(
        "Maintenance scheduled successfully ✓",
      );

      setMaintenanceStart("");
      setMaintenanceEnd("");

      // Let the rest of the app refresh the banner immediately.
      onScheduled?.(maintenance);
    } catch (error) {
      console.error(
        "Failed to schedule maintenance:",
        error?.response?.data || error,
      );

      showToast?.(
        error?.message ||
          "Failed to schedule maintenance",
      );
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div
      className="st-card"
      style={{
        background: "#fff",
        border: "1px solid #e4e7ef",
        borderRadius: 12,
        padding: 28,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: "#eef2ff",
            color: "#4f6ef7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
            />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1e2740",
              }}
            >
              System Maintenance
            </div>

            <span
              style={{
                padding: "3px 8px",
                borderRadius: 999,
                background: "#dcfce7",
                color: "#15803d",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              NEW
            </span>
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: "#6b7591",
              marginTop: 4,
            }}
          >
            Schedule maintenance windows and notify users
            in advance.
          </div>
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 14px",
          background: "#f5f7ff",
          border: "1px solid #dbe3ff",
          borderRadius: 8,
          color: "#4f6ef7",
          fontSize: 12.5,
          marginBottom: 22,
        }}
      >
        Users will be notified based on the notification
        time selected below.
      </div>

      <FieldRow cols="1fr 1fr">
        <Field label="Maintenance Title">
          <SettingsInput
            value={maintenanceTitle}
            onChange={setMaintenanceTitle}
            placeholder="Scheduled System Maintenance"
          />
        </Field>

        <Field label="Affected Services">
          <SettingsSelect
            value={maintenanceAffectedServices}
            onChange={setMaintenanceAffectedServices}
            options={[
              "Entire System",
              "Inventory",
              "Receipts",
              "Transfers",
              "Stock Counts",
              "Reports",
              "Data Import",
            ]}
          />
        </Field>
      </FieldRow>

      <FieldRow cols="1fr 1fr">
        <Field label="Start Date & Time">
          <input
            type="datetime-local"
            value={maintenanceStart}
            onChange={(e) =>
              setMaintenanceStart(e.target.value)
            }
            style={inputStyle}
          />
        </Field>

        <Field label="Expected End Date & Time">
          <input
            type="datetime-local"
            value={maintenanceEnd}
            onChange={(e) =>
              setMaintenanceEnd(e.target.value)
            }
            style={inputStyle}
          />
        </Field>
      </FieldRow>

      <FieldRow cols="1fr 1fr">
        <Field label="Notify Users">
          <SettingsSelect
            value={maintenanceNotifyBefore}
            onChange={setMaintenanceNotifyBefore}
            options={[
              "Immediately",
              "5 minutes",
              "15 minutes",
              "30 minutes",
              "1 hour",
              "6 hours",
              "12 hours",
              "24 hours",
              "48 hours",
              "72 hours",
            ]}
          />
        </Field>

        <div />
      </FieldRow>

      <Field label="Maintenance Message">
        <textarea
          value={maintenanceMessage}
          onChange={(e) =>
            setMaintenanceMessage(e.target.value)
          }
          rows={4}
          placeholder="Enter the message users will receive..."
          style={{
            ...inputStyle,
            padding: "11px 12px",
            resize: "vertical",
            lineHeight: 1.5,
          }}
        />
      </Field>

      <div
        className="st-togglegrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20,
          marginBottom: 22,
        }}
      >
        <ToggleRow
          value={maintenanceEmailNotifications}
          onChange={setMaintenanceEmailNotifications}
          label="Send Email Notifications"
          sub="Send maintenance notices to users by email."
        />

        <ToggleRow
          value={showMaintenancePage}
          onChange={setShowMaintenancePage}
          label="Show Maintenance Page"
          sub="Display a maintenance notice during the scheduled window."
        />
      </div>

      {/* Admin notice */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "12px 14px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#92400e",
          }}
        >
          Administrator Only
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#a16207",
            marginTop: 2,
          }}
        >
          Only System Administrators should be able to
          schedule or manage maintenance windows.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={scheduling}
          style={secondaryButton}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSchedule}
          disabled={scheduling}
          style={{
            ...primaryButton,
            background: scheduling
              ? "#9aabf5"
              : "#4f6ef7",
            cursor: scheduling
              ? "default"
              : "pointer",
          }}
        >
          {scheduling
            ? "Scheduling..."
            : "Schedule Maintenance"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  value,
  onChange,
  label,
  sub,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <Toggle
        value={value}
        onChange={onChange}
      />

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e2740",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#6b7591",
            marginTop: 3,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e4e7ef",
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  color: "#1e2740",
  outline: "none",
  boxSizing: "border-box",
};

const secondaryButton = {
  padding: "10px 20px",
  background: "#fff",
  border: "1px solid #e4e7ef",
  borderRadius: 8,
  color: "#1e2740",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const primaryButton = {
  padding: "10px 22px",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
};