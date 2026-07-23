import { Icon, icons } from "../../../lib/icons";

const GUIDELINES = [
  { title: "1. Download Template", desc: "Always start by downloading the appropriate template for your data type (Items or Users). This ensures your data is in the correct format." },
  { title: "2. Prepare Your Data", desc: "Fill in the template with your data. Category and Unit of Measure values must match records that already exist in the system - they're checked against the live API during validation. Role is required but not checked against a list, since the API doesn't expose one." },
  { title: "3. Upload Your File", desc: "Drag and drop your file into the upload area, or click 'Browse Files'. Only CSV and XLSX files are supported." },
  { title: "4. Validate Before Importing", desc: "Click 'Validate File' to check for errors. Review any validation errors and fix them in your file before proceeding." },
  { title: "5. Import Valid Data", desc: "Once validation is complete, click 'Import Valid Data'. Each valid row is sent to the live API individually; rows with errors are skipped." },
  { title: "Notes", desc: "• Inventory import has no backing API endpoint yet, so it's disabled\n• Users import is list/view only for now - the API has no endpoint to create users\n• Item SKUs are assigned automatically by the system" },
];

export function GuidelinesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Import Guidelines</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <Icon d={icons.xSmall} size={16} />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {GUIDELINES.map(g => (
            <div key={g.title}>
              <p className="text-sm font-semibold text-gray-800 mb-1">{g.title}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}