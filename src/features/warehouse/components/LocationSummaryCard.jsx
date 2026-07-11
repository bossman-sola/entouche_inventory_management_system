import { useNavigate } from 'react-router-dom';
import { Icon, icons } from './ui/Icon.jsx';
import { LocationIcon, TYPE_LABELS } from './ui/LocationIcon.jsx';
import { StatusBadge } from './ui/StatusBadge.jsx';

export function LocationSummaryCard({ loading, locations, qtyByLocationId }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-[220px]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Location Summary</p>
        <button onClick={() => navigate('/locations')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          View all
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Icon d={icons.inbox} size={18} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No locations yet</p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Add your first location to start organizing stock within a warehouse.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="font-medium px-5 py-2">Location</th>
                <th className="font-medium px-5 py-2">Warehouse</th>
                <th className="font-medium px-5 py-2 text-right">Quantity</th>
                <th className="font-medium px-5 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.slice(0, 6).map((loc) => (
                <tr key={loc.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <LocationIcon type={loc.type} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{loc.name}</p>
                        <p className="text-xs text-gray-400 truncate">{TYPE_LABELS[loc.type] || loc.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500 truncate">{loc.warehouse}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-gray-800">
                    {(qtyByLocationId.get(loc.id) || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <StatusBadge status={loc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
