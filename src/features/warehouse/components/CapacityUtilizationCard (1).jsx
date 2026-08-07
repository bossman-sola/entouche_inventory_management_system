import { Icon, icons } from "./ui/Icon.jsx";

function barColor(pct) {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-400";
  return "bg-green-500";
}

export function CapacityUtilizationCard({ loading, locations, onViewAll }) {
  console.log({
    loading,
    locations,
  });

  const withCapacity = (locations || [])
    .filter((l) => l.capacity != null && l.capacity > 0)
    .map((l) => {
      // Fall back to backend utilization_pct, or calculate manually as fallback
      const percentage =
        l.utilization_pct ??
        (l.capacity
          ? Math.round(((l.quantity_on_hand || 0) / l.capacity) * 100)
          : 0);

      return {
        ...l,
        pct: percentage,
      };
    })
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">
        Capacity Utilization by Location
      </p>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ) : withCapacity.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Icon d={icons.inbox} size={18} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 max-w-[220px] mx-auto leading-relaxed">
            No locations have a capacity set yet. Add one from a location's edit
            form to track utilization here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {withCapacity.slice(0, 5).map((l) => (
            <div key={l.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 truncate">{l.name}</span>
                <span className="font-medium text-gray-800 shrink-0">
                  {(l.quantity_on_hand || 0).toLocaleString()} /{" "}
                  {Number(l.capacity).toLocaleString()} ({l.pct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor(l.pct)}`}
                  style={{ width: `${Math.min(l.pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onViewAll}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-4"
      >
        View all locations
      </button>
    </div>
  );
}
