import { useState, useEffect } from "react";
import { Icon, icons } from "../../../lib/icons";
import { IMPORT_TYPES } from "../../../lib/validation";
import { listWarehouseLocations } from "../../../lib/api";

const selectCls =
  "appearance-none w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-7 disabled:bg-gray-50 disabled:text-gray-400";

function Chevron() {
  return (
    <Icon
      d={icons.chevronDown}
      size={12}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  );
}

export function ImportConfiguration({
  importType, setImportType,
  warehouses = [],
  selectedWarehouseId, setSelectedWarehouseId,
  selectedLocationId, setSelectedLocationId,
  fileFormat, setFileFormat, encoding, setEncoding,
  onFieldChange,
}) {
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  
  useEffect(() => {
    if (!selectedWarehouseId) return;
    let cancelled = false;
    listWarehouseLocations(selectedWarehouseId)
      .then(l => { if (!cancelled) setLocations(l || []); })
      .catch(() => { if (!cancelled) setLocations([]); })
      .finally(() => { if (!cancelled) setLocationsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedWarehouseId]);

  
  const fields = [
    { label: "Import Type", value: importType, setter: setImportType, options: IMPORT_TYPES, resetsFlow: true },
    { label: "File Format", value: fileFormat, setter: setFileFormat, options: ["CSV", "XLSX"] },
    { label: "Character Encoding", value: encoding, setter: setEncoding, options: ["UTF-8", "UTF-16", "ASCII", "ISO-8859-1"] },
  ];

  return (
    <div className="w-full sm:w-56 shrink-0">
      <p className="text-sm font-semibold text-gray-800 mb-3">Import Configuration</p>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
        {fields.map(f => (
          <div key={f.label}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
            <div className="relative">
              <select
                value={f.value}
                onChange={e => { f.setter(e.target.value); if (f.resetsFlow) onFieldChange(); }}
                className={selectCls}
              >
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </div>
        ))}

        
        {importType === "Inventory" && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse</label>
              <div className="relative">
                <select
                  value={selectedWarehouseId ?? ""}
                  onChange={e => {
                    const id = e.target.value || null;
                    setSelectedWarehouseId(id);
                    setSelectedLocationId(null);  
                    setLocations([]);             
                    setLocationsLoading(!!id);    
                  }}
                  className={selectCls}
                >
                  <option value="">Select warehouse…</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                <Chevron />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Receiving Location</label>
              <div className="relative">
                <select
                  value={selectedLocationId ?? ""}
                  disabled={!selectedWarehouseId || locationsLoading}
                  onChange={e => setSelectedLocationId(e.target.value || null)}
                  className={selectCls}
                >
                  <option value="">
                    {!selectedWarehouseId
                      ? "Choose a warehouse first"
                      : locationsLoading
                        ? "Loading…"
                        : "Select location…"}
                  </option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <Chevron />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}