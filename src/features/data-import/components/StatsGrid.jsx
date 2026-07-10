import { Icon, icons } from "../../../lib/icons";

export function StatsGrid({ history, successCount, failedCount, itemsTotal, usersTotal }) {
  const successRate = history.length > 0 ? ((successCount / history.length) * 100).toFixed(1) : "0.0";
  const failRate = history.length > 0 ? ((failedCount / history.length) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Imports", value: history.length, sub: "This session", subColor: "text-gray-500", icon: icons.upload, bg: "bg-blue-50", color: "text-blue-500" },
    { label: "Successful Imports", value: successCount, sub: `${successRate}% success rate`, subColor: "text-green-600", icon: icons.check, bg: "bg-green-50", color: "text-green-500" },
    { label: "Failed Imports", value: failedCount, sub: `${failRate}% failure rate`, subColor: "text-red-500", icon: icons.x, bg: "bg-red-50", color: "text-red-500" },
    { label: "Items in System", value: itemsTotal ?? "—", sub: usersTotal != null ? `${usersTotal} users total` : "Live from API", subColor: "text-orange-500", icon: icons.clock, bg: "bg-orange-50", color: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <Icon d={s.icon} size={18} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className={`text-xs font-medium mt-0.5 truncate ${s.subColor}`}>{s.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}