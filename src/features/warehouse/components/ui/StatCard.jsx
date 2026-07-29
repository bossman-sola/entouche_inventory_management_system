import { Icon } from './Icon.jsx';

export const StatCard = ({
  iconD,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor = "text-gray-400",
  loading,
  error,
  unavailable,
  unavailableText,
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon d={iconD} size={18} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5 truncate">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
        ) : error ? (
          <p className="text-sm text-red-500 font-medium">-</p>
        ) : unavailable ? (
          <p className="text-2xl font-bold text-gray-300">-</p>
        ) : (
          <p className="text-3xl font-bold text-gray-900 truncate">{value}</p>
        )}
        {!loading && !error && !unavailable && sub && (
          <p className={`text-xs font-medium mt-0.5 truncate ${subColor}`}>{sub}</p>
        )}
        {!loading && unavailable && (
          <p className="text-xs font-medium mt-0.5 truncate text-gray-400">{unavailableText}</p>
        )}
      </div>
    </div>
  </div>
);
