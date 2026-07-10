import { Icon, icons } from "../../../lib/icons";

export function ValidationSummary({ parsedData }) {
  const stats = [
    { label: "Total Rows", value: parsedData.total, color: "text-gray-800" },
    { label: "Valid Rows", value: parsedData.valid, color: "text-green-600" },
    { label: "Errors", value: parsedData.errors, color: "text-red-500" },
    { label: "Warnings", value: 0, color: "text-gray-800" },
  ];

  return (
    <div className="mt-3 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
        <p className="text-sm font-semibold text-gray-800">Validation Summary</p>
        <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${parsedData.errors ? "text-orange-600" : "text-green-600"}`}>
          <Icon d="M5 13l4 4L19 7" size={13} strokeWidth={2.5} /> Validation completed
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-50 rounded-lg py-2 px-1">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      {parsedData.errors > 0 && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <Icon d={icons.alert} size={12} /> Please review the errors below before importing.
        </p>
      )}
    </div>
  );
} 