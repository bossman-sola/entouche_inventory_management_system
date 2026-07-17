import { Icon, icons } from './ui/Icon.jsx';

export function LocationStatusCard({ loading, locations, activeLocations, inactiveLocations, onViewAll }) {
  const attentionAvailable = false;
  const attentionRequired = null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">Location Status Summary</p>

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ) : locations.length === 0 ? (
        <p className="text-xs text-gray-400 leading-relaxed">No locations yet.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-green-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Icon d={icons.check} size={15} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Active Locations</p>
                <p className="text-xs text-gray-400 truncate">All systems operational</p>
              </div>
            </div>
            <span className="text-lg font-bold text-green-700 shrink-0">{activeLocations}</span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-orange-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <Icon d={icons.warning} size={15} className="text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Attention Required</p>
                <p className="text-xs text-gray-400 truncate">Requires monitoring</p>
              </div>
            </div>
            <span className={`text-lg font-bold shrink-0 ${attentionAvailable ? "text-orange-600" : "text-gray-300"}`}>
              {attentionAvailable ? attentionRequired : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <Icon d={icons.xCircle} size={15} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">Inactive Locations</p>
                <p className="text-xs text-gray-400 truncate">Currently inactive</p>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-500 shrink-0">{inactiveLocations}</span>
          </div>

          <p className="text-xs text-gray-400 pt-1">
            {locations.length} total location{locations.length === 1 ? "" : "s"}
          </p>

          <button onClick={onViewAll} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View all locations
          </button>
        </div>
      )}
    </div>
  );
}