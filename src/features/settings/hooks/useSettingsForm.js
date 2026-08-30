import { useCallback, useState } from "react";

export const SETTINGS_MAP = {
  general: {
    companyName: "general.company_name",
    companyEmail: "general.company_email",
    companyPhone: "general.company_phone",
    country: "general.country",
    timezone: "general.timezone",
    dateFormat: "general.date_format",
    timeFormat: "general.time_format",
    currency: "general.currency",
    language: "general.language",
  },
  preferences: {
    lowStockAlerts: "inventory.low_stock_alerts",
    emailNotifications: "notifications.email_notifications",
    allowNegativeStock: "inventory.allow_negative_stock",
    requireReasonAdj: "inventory.require_reason_adjustment",
    autoGenerateSku: "inventory.auto_generate_sku",
    sessionTimeout: "security.session_timeout",
  },
  numbering: {
    itemPrefix: "numbering.item_prefix",
    inventoryPrefix: "numbering.inventory_prefix",
    transferPrefix: "numbering.transfer_prefix",
    receiptPrefix: "numbering.receipt_prefix",
    adjustmentPrefix: "numbering.adjustment_prefix",
    numberingReset: "numbering.reset_period",
  },
  warehouse: {
    defaultWarehouse: "warehouse.default_warehouse",
    warehousePrefix: "warehouse.prefix",
    enableBinLocations: "warehouse.enable_bin_locations",
    requireLocation: "warehouse.require_location_on_receipt",
  },
  security: {
    minPasswordLength: "security.min_password_length",
    requireUppercase: "security.require_uppercase",
    requireNumbers: "security.require_numbers",
    twoFactorAuth: "security.two_factor_auth",
    maxLoginAttempts: "security.max_login_attempts",
    lockoutDuration: "security.lockout_duration",
  },
  notifications: {
    notifyEmail: "notifications.notify_email",
    lowStockEmail: "notifications.low_stock_email",
    receiptAlerts: "notifications.receipt_alerts",
    transferAlerts: "notifications.transfer_alerts",
    dailyDigest: "notifications.daily_digest",
  },
  audit: {
    retentionPeriod: "audit.retention_period",
    logLogins: "audit.log_logins",
    logDataChanges: "audit.log_data_changes",
    logExports: "audit.log_exports",
    autoDeleteLogs: "audit.auto_delete_logs",
  },
};

const INITIAL_FORM = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  country: "Nigeria",
  timezone: "(UTC+01:00) West Africa Time (WAT)",
  dateFormat: "May 27, 2025",
  timeFormat: "12 Hour (hh:mm AM/PM)",
  currency: "NGN (₦) - Nigerian Naira",
  language: "English (US)",
  lowStockAlerts: true,
  emailNotifications: true,
  allowNegativeStock: false,
  requireReasonAdj: true,
  autoGenerateSku: true,
  sessionTimeout: "30",
  itemPrefix: "ITM",
  inventoryPrefix: "INV",
  transferPrefix: "TRF",
  receiptPrefix: "RCV",
  adjustmentPrefix: "ADJ",
  numberingReset: "Do not reset",
  defaultWarehouse: "Storage Area",
  warehousePrefix: "WH",
  enableBinLocations: false,
  requireLocation: true,
  minPasswordLength: "8",
  requireUppercase: true,
  requireNumbers: true,
  twoFactorAuth: false,
  maxLoginAttempts: "5",
  lockoutDuration: "15",
  notifyEmail: "info@rossglobal.com",
  lowStockEmail: true,
  receiptAlerts: true,
  transferAlerts: false,
  dailyDigest: true,
  retentionPeriod: "12 months",
  logLogins: true,
  logDataChanges: true,
  logExports: true,
  autoDeleteLogs: false,
};

function coerceSetting(entry) {
  if (!entry) return undefined;
  const { value, type } = entry;
  if (type === "boolean") {
    return value === true || value === "true" || value === 1 || value === "1";
  }
  if (type === "integer" || type === "number") return String(value);
  return value ?? "";
}

export function useSettingsForm() {
  const [form, setForm] = useState(INITIAL_FORM);

  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const hydrateFromApi = useCallback((settingsResponse) => {
    if (!settingsResponse) return;
    const flat = {};

    Object.values(settingsResponse).forEach((group) => {
      const entries = Array.isArray(group)
        ? group.map((entry) => [entry.key, entry])
        : Object.entries(group || {});

      entries.forEach(([key, entry]) => {
        flat[key] = coerceSetting(entry);
      });
    });

    const hydrated = {};
    Object.values(SETTINGS_MAP).forEach((fieldMap) => {
      Object.entries(fieldMap).forEach(([field, settingKey]) => {
        if (flat[settingKey] !== undefined) hydrated[field] = flat[settingKey];
      });
    });

    setForm((prev) => ({ ...prev, ...hydrated }));
  }, []);

  const getSectionPayload = useCallback((sectionKey) => {
    const fieldMap = SETTINGS_MAP[sectionKey];
    if (!fieldMap) return {};
    return Object.fromEntries(
      Object.entries(fieldMap).map(([field, settingKey]) => [settingKey, form[field]]),
    );
  }, [form]);

  return { form, setField, hydrateFromApi, getSectionPayload };
}
