import { Icon, icons } from "../../../lib/icons";
import { IMPORT_TYPES } from "../../../lib/validation";

export function ImportConfiguration({ importType, setImportType, location, setLocation, fileFormat, setFileFormat, encoding, setEncoding, onFieldChange }) {
  const fields = [
    { label: "Import Type", value: importType, setter: setImportType, options: IMPORT_TYPES },
    { label: "Default Location", value: location, setter: setLocation, options: ["Storage Area", "Receiving Area", "Dispatch Area", "Damaged Goods Area"] },
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
                onChange={e => { f.setter(e.target.value); onFieldChange(); }}
                className="appearance-none w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-7"
              >
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <Icon d={icons.chevronDown} size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}