import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, icons } from './ui/Icon.jsx';
import { LocationIcon, TYPE_LABELS } from './ui/LocationIcon.jsx';
import { StatusBadge } from './ui/StatusBadge.jsx';
import { currency } from '../../../lib/format.js';

function RowActions({ location, onToggleStatus, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400"
        aria-label="Row actions"
      >
        <Icon d={icons.dotsV} size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          <button
            onClick={() => { setOpen(false); onToggleStatus(location); }}
            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            {location.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(location); }}
            className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function LocationSummaryCard({ loading, locations, qtyByLocationId, valueByLocationId, onToggleStatus, onDelete }) {
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
                <th className="font-medium px-5 py-2">Description</th>
                <th className="font-medium px-5 py-2 text-right">Quantity</th>
                <th className="font-medium px-5 py-2 text-right">Inventory Value</th>
                <th className="font-medium px-5 py-2 text-right">Utilization</th>
                <th className="font-medium px-5 py-2 text-right">Status</th>
                <th className="font-medium px-5 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {locations.slice(0, 6).map((loc) => {
                // description and utilization aren't exposed by the API yet —
                // show "—" rather than fabricating values.
                const value = valueByLocationId?.get(loc.id);
                return (
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
                    <td className="px-5 py-2.5 text-gray-500 truncate">{loc.description || '—'}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-gray-800">
                      {(qtyByLocationId.get(loc.id) || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium text-gray-800">
                      {value != null ? currency(value) : '—'}
                    </td>
                    <td className="px-5 py-2.5 text-right text-gray-400">—</td>
                    <td className="px-5 py-2.5 text-right">
                      <StatusBadge status={loc.status} />
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <RowActions location={loc} onToggleStatus={onToggleStatus} onDelete={onDelete} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}