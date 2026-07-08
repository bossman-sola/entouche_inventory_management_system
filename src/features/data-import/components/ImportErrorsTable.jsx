import { Icon, icons } from "../../../lib/icons";

export function ImportErrorsTable({ errors }) {
  if (!errors.length) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <p className="text-sm font-semibold text-gray-800">Import Errors ({errors.length})</p>
      </div>
      <p className="text-xs text-gray-500 mb-2">Rows marked "(server)" failed the real API call during import.</p>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          <table className="w-full min-w-[420px]">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                {["Row", "Column", "Error", "Value Found"].map(h => (
                  <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errors.map((e, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <Icon d={icons.x} size={14} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-800">{e.row}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 whitespace-nowrap">{e.column}</td>
                  <td className={`py-2 px-3 text-sm font-medium whitespace-nowrap ${e.errorColor}`}>{e.error}</td>
                  <td className="py-2 px-3 text-sm text-gray-500 whitespace-nowrap max-w-[180px] truncate" title={e.value}>{e.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}