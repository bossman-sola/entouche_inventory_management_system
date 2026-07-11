import { StatCard } from './ui/StatCard.jsx';
import { icons } from './ui/Icon.jsx';
import { currency } from '../../../lib/format.js';

export function StatCardsRow({
  locations,
  warehouses,
  totalQuantity,
  totalValue,
  locationsLoading,
  locationsError,
  loading,
  error,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        iconD={icons.location}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        label="Total Locations"
        value={locations.length.toLocaleString()}
        sub={`Across ${warehouses.length} warehouse${warehouses.length === 1 ? "" : "s"}`}
        subColor="text-blue-500"
        loading={locationsLoading}
        error={locationsError}
      />

      <StatCard
        iconD={icons.hexagon}
        iconBg="bg-green-50"
        iconColor="text-green-500"
        label="Total Inventory Quantity"
        value={totalQuantity.toLocaleString()}
        sub="Sum of on-hand stock"
        subColor="text-green-600"
        loading={loading}
        error={error}
      />

      <StatCard
        iconD={icons.briefcase}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        label="Total Inventory Value"
        value={currency(totalValue)}
        sub="At unit cost"
        subColor="text-orange-500"
        loading={loading}
        error={error}
      />

      <StatCard
        iconD={icons.pie}
        iconBg="bg-purple-50"
        iconColor="text-purple-500"
        label="Utilization Rate"
        unavailable
        unavailableText="Capacity data isn't exposed by the API yet"
      />
    </div>
  );
}
