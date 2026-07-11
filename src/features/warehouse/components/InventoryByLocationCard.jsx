import { DonutChart } from './ui/DonutChart.jsx';
import { Icon, icons, PALETTE } from './ui/Icon.jsx';

export function InventoryByLocationCard({ loading, byLocation, byLocationTotal, onViewAll }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">Inventory by Location</p>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-indigo-300 animate-spin" />
        </div>
      ) : byLocationTotal === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Icon d={icons.inbox} size={18} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 max-w-[220px] mx-auto leading-relaxed">
            No stock has been recorded against a location yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <DonutChart
            total={byLocationTotal}
            segments={byLocation.slice(0, 6).map((r, i) => ({
              label: r.label,
              value: r.qty,
              color: PALETTE[i % PALETTE.length],
            }))}
          />
          <div className="w-full space-y-2">
            {byLocation.slice(0, 5).map((r, i) => (
              <div key={r.label} className="flex items-center justify-between text-xs gap-2">
                <span className="flex items-center gap-1.5 text-gray-600 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  {r.label}
                </span>
                <span className="font-medium text-gray-800 shrink-0">
                  {r.qty.toLocaleString()} ({byLocationTotal ? Math.round((r.qty / byLocationTotal) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onViewAll} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-4">
        View all locations
      </button>
    </div>
  );
}
