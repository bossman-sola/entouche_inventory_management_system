import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { settingsApi } from "../api/settingsApi";

export function useSettings({
  hydrateFromApi,
  getSectionPayload,
  showToast,
}) {
  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(null);

  const [
    savingSection,
    setSavingSection,
  ] = useState(null);

  const [
    uploadingLogo,
    setUploadingLogo,
  ] = useState(false);

  const [warehouses, setWarehouses] =
    useState([]);

  const [
    auditLogCount,
    setAuditLogCount,
  ] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [
        settingsRes,
        warehousesRes,
        auditRes,
      ] = await Promise.allSettled([
        settingsApi.getSettings(),
        settingsApi.getWarehouses(),
        settingsApi.getAuditLogs(),
      ]);

      if (
        settingsRes.status ===
          "fulfilled" &&
        settingsRes.value
      ) {
        hydrateFromApi(
          settingsRes.value,
        );
      } else if (
        settingsRes.status ===
        "rejected"
      ) {
        setLoadError(
          settingsRes.reason?.message ||
            "Failed to load settings",
        );
      }

      setWarehouses(
        warehousesRes.status ===
          "fulfilled"
          ? warehousesRes.value || []
          : [],
      );

      if (
        auditRes.status === "fulfilled"
      ) {
        const val = auditRes.value;

        const count = Array.isArray(val)
          ? val.length
          : (
              val?.total ??
              val?.data?.length ??
              null
            );

        setAuditLogCount(count);
      }
    } catch (error) {
      setLoadError(
        error.message ||
          "Failed to load settings",
      );
    } finally {
      setLoading(false);
    }
  }, [hydrateFromApi]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveSection = async (
    sectionKey,
  ) => {
    const payload =
      getSectionPayload(sectionKey);

    if (!Object.keys(payload).length) {
      showToast?.(
        "Nothing to save for this section",
      );
      return;
    }

    setSavingSection(sectionKey);

    try {
      await settingsApi.updateSettings(
        payload,
      );

      await loadAll();

      showToast?.(
        "Settings saved successfully ✓",
      );
    } catch (error) {
      showToast?.(
        `Couldn't save settings: ${
          error.message
        }`,
      );
    } finally {
      setSavingSection(null);
    }
  };

  const uploadCompanyLogo = async (
    file,
  ) => {
    if (!file) {
      return;
    }

    setUploadingLogo(true);

    try {
      const result =
        await settingsApi.uploadCompanyLogo(
          file,
        );

      /*
       * Reload settings from Laravel.
       *
       * hydrateFromApi() will then place:
       *
       * company.logo
       *      ↓
       * form.companyLogo
       */
      await loadAll();

      showToast?.(
        "Company logo updated successfully ✓",
      );

      return result;
    } catch (error) {
      showToast?.(
        `Couldn't update company logo: ${
          error?.message ||
          "Upload failed"
        }`,
      );

      throw error;
    } finally {
      setUploadingLogo(false);
    }
  };

  const refreshAuditLogs =
    async () => {
      try {
        const res =
          await settingsApi.getAuditLogs();

        const count = Array.isArray(res)
          ? res.length
          : (
              res?.total ??
              res?.data?.length ??
              0
            );

        setAuditLogCount(count);

        showToast?.(
          `${count} audit log entr${
            count === 1
              ? "y"
              : "ies"
          } recorded`,
        );
      } catch (error) {
        showToast?.(
          `Couldn't load audit logs: ${
            error.message
          }`,
        );
      }
    };

  return {
    loading,
    loadError,
    savingSection,
    uploadingLogo,
    warehouses,
    auditLogCount,
    loadAll,
    saveSection,
    uploadCompanyLogo,
    refreshAuditLogs,
  };
}
