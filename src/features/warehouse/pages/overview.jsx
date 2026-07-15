import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, icons } from '../components/ui/Icon.jsx';
import { DateRangePicker } from '../components/DateRangePicker.jsx';
import { StatCardsRow } from '../components/StatCardsRow.jsx';
import { InventoryByLocationCard } from '../components/InventoryByLocationCard.jsx';
import { CapacityUtilizationCard } from '../components/CapacityUtilizationCard (1).jsx';
import { LocationStatusCard } from '../components/LocationStatusCard.jsx';
import { LocationSummaryCard } from '../components/LocationSummaryCard.jsx';
import { RecentMovementsCard } from '../components/RecentMovementsCard.jsx';
import { apiErrorMessage } from '../../../lib/format.js';
import {
  fetchAllItems,
  fetchStockBalances,
  fetchAllLocations,
  aggregateQuantityByLocation,
  buildLocationQtyMap,
} from '../../../lib/warehouseData.js';
import { warehousesApi } from '../../warehouse/api/warehousesApi.js';

const emptyWarehouseForm = { name: '', code: '', address: '', city: '', state: '', country: '', status: 'active' };

function mapServerErrorsToForm(apiErrors) {
  const fieldErrors = {};
  for (const [key, msgs] of Object.entries(apiErrors || {})) {
    fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
  }
  return fieldErrors;
}

function suggestWarehouseCode(existingWarehouses) {
  const nums = existingWarehouses
    .map((w) => {
      const m = String(w.code || '').match(/^WH-(\d+)$/i);
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n) => n !== null);
  const next = (nums.length ? Math.max(...nums) : existingWarehouses.length) + 1;
  return `WH-${String(next).padStart(3, '0')}`;
}

function duplicateCodeError(err) {
  const raw = err?.message || '';
  if (!/duplicate entry/i.test(raw) || !/code/i.test(raw)) return null;
  const match = raw.match(/Duplicate entry '([^']+)'/i);
  const value = match ? match[1] : null;
  return `${value ? `"${value}"` : 'That code'} is already in use by another warehouse — try a different code.`;
}

export default function WarehouseOverviewPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState(null); 

  const [items, setItems] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState(null);

  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState(emptyWarehouseForm);
  const [warehouseFormErrors, setWarehouseFormErrors] = useState({});
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedItems = await fetchAllItems();
      const fetchedBalances = await fetchStockBalances(fetchedItems);
      setItems(fetchedItems);
      setBalances(fetchedBalances);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't load inventory data."));
    } finally {
      setLoading(false);
    }

    setLocationsLoading(true);
    setLocationsError(null);
    try {
      const { warehouses: whs, locations: locs } = await fetchAllLocations();
      setWarehouses(whs);
      setLocations(locs);
    } catch (err) {
      setLocationsError(apiErrorMessage(err, "Couldn't load locations."));
      setWarehouses([]);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openWarehouseModal() {
  
    setWarehouseForm({ ...emptyWarehouseForm, code: suggestWarehouseCode(warehouses) });
    setWarehouseFormErrors({});
    setWarehouseModalOpen(true);
  }

  function closeWarehouseModal() {
    setWarehouseModalOpen(false);
  }

  function validateWarehouseForm() {
    const errs = {};
    if (!warehouseForm.name.trim()) errs.name = 'Warehouse name is required';
    if (!warehouseForm.code.trim()) errs.code = 'Code is required';
    return errs;
  }

  async function handleCreateWarehouse() {
    const errs = validateWarehouseForm();
    setWarehouseFormErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingWarehouse(true);
    try {
      
      const payload = Object.fromEntries(
        Object.entries(warehouseForm).filter(([, v]) => v !== '' && v != null)
      );
      await warehousesApi.create(payload);
      showToast('Warehouse created');
      setWarehouseModalOpen(false);
      await load(); 
    } catch (err) {
      const dupMessage = duplicateCodeError(err);
      const fieldErrors = mapServerErrorsToForm(err.errors);
      if (dupMessage) {
        setWarehouseFormErrors((prev) => ({ ...prev, code: dupMessage }));
        showToast(dupMessage, 'error');
      } else if (Object.keys(fieldErrors).length) {
        setWarehouseFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        showToast(Object.values(fieldErrors)[0], 'error');
      } else {
        showToast(apiErrorMessage(err, "Couldn't create this warehouse."), 'error');
      }
    } finally {
      setSavingWarehouse(false);
    }
  }

  const totalQuantity = balances.reduce((sum, b) => sum + (b.balance?.total_on_hand || 0), 0);
  const totalValue = balances.reduce((sum, b) => {
    const qty = b.balance?.total_on_hand || 0;
    const cost = parseFloat(b.item.unit_cost) || 0;
    return sum + qty * cost;
  }, 0);

  const locationsById = new Map(locations.map((l) => [l.id, l]));
  const byLocation = aggregateQuantityByLocation(balances, locationsById);
  const byLocationTotal = byLocation.reduce((s, r) => s + r.qty, 0);
  const qtyByLocationId = buildLocationQtyMap(balances);

  const activeLocations = locations.filter((l) => l.status === 'active').length;
  const inactiveLocations = locations.length - activeLocations;

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Warehouse Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time overview of your warehouse locations and inventory distribution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker onChange={setRange} />
          <button
            onClick={openWarehouseModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Icon d={icons.plus} size={14} stroke="white" strokeWidth={2.5} />
            New Warehouse
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
            <Icon d={icons.warning} size={16} className="text-red-500 shrink-0" /> {error}
          </p>
          <button onClick={load} className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap">
            Retry
          </button>
        </div>
      )}

      {locationsError && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
            <Icon d={icons.warning} size={16} className="text-red-500 shrink-0" /> {locationsError}
          </p>
          <button onClick={load} className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap">
            Retry
          </button>
        </div>
      )}

      {/* Stat cards */}
      <StatCardsRow
        locations={locations}
        warehouses={warehouses}
        totalQuantity={totalQuantity}
        totalValue={totalValue}
        locationsLoading={locationsLoading}
        locationsError={locationsError}
        loading={loading}
        error={error}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <InventoryByLocationCard
          loading={locationsLoading || loading}
          byLocation={byLocation}
          byLocationTotal={byLocationTotal}
          onViewAll={() => navigate('/locations')}
        />
        <CapacityUtilizationCard />
        <LocationStatusCard
          loading={locationsLoading}
          locations={locations}
          activeLocations={activeLocations}
          inactiveLocations={inactiveLocations}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocationSummaryCard
          loading={locationsLoading}
          locations={locations}
          qtyByLocationId={qtyByLocationId}
        />
        <RecentMovementsCard />
      </div>
      
      {warehouseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => e.target === e.currentTarget && closeWarehouseModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">New Warehouse</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Add a new warehouse to your organization.</p>
                </div>
                <button
                  onClick={closeWarehouseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 shrink-0 text-lg leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    placeholder="e.g. Main Warehouse"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {warehouseFormErrors.name && <p className="text-xs text-red-500 mt-1">{warehouseFormErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WH-001"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {warehouseFormErrors.code && <p className="text-xs text-red-500 mt-1">{warehouseFormErrors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={warehouseForm.status}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    value={warehouseForm.address}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                    placeholder="e.g. 12 Industrial Avenue"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {warehouseFormErrors.address && <p className="text-xs text-red-500 mt-1">{warehouseFormErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={warehouseForm.city}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                    placeholder="e.g. Lagos"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    value={warehouseForm.state}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, state: e.target.value })}
                    placeholder="e.g. Lagos"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    value={warehouseForm.country}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, country: e.target.value })}
                    placeholder="e.g. Nigeria"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={closeWarehouseModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWarehouse}
                  disabled={savingWarehouse}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {savingWarehouse ? 'Saving…' : 'Save Warehouse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}