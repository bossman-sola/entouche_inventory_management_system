import { useState } from "react";

export function useMaintenanceSettings() {
  const [maintenanceTitle, setMaintenanceTitle] = useState("Scheduled System Maintenance");
  const [maintenanceStart, setMaintenanceStart] = useState("");
  const [maintenanceEnd, setMaintenanceEnd] = useState("");
  const [maintenanceNotifyBefore, setMaintenanceNotifyBefore] = useState("24 hours");
  const [maintenanceAffectedServices, setMaintenanceAffectedServices] = useState("Entire System");
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "The system will be undergoing scheduled maintenance. During this time, the system may be unavailable. We apologize for any inconvenience.",
  );
  const [maintenanceEmailNotifications, setMaintenanceEmailNotifications] = useState(true);
  const [showMaintenancePage, setShowMaintenancePage] = useState(true);

  return {
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
  };
}
