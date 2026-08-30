import { api } from "../../../shared/api/entoucheApi";

export const settingsApi = {
  getSettings: () => api.listSettings(),
  updateSettings: (payload) => api.bulkUpdateSettings(payload),
  getWarehouses: () => api.listWarehouses(),
  getAuditLogs: () => api.listAuditLogs(),
  getMaintenance(params) {
    return api.listMaintenance(params);
  },
  scheduleMaintenance(payload) {
    return api.scheduleMaintenance(payload);
  },
};
