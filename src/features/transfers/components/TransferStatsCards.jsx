import { Icon, icons } from "./icons.jsx";
export default function TransferStatsCards({ transfers }) {
  const totalQty = transfers.reduce((sum, t) => {
    const items = Array.isArray(t.items) ? t.items : [];
    return sum + items.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  }, 0);
  const pendingCount = transfers.filter(t => t.status === "draft" || t.status === "pending_approval").length;

  const cards = [
    { label: "Total Transfers", value: String(transfers.length), icon: icons.transferAlt, bg: "bg-blue-50 text-blue-500" },
    { label: "Total Qty Transferred", value: totalQty.toLocaleString(), icon: icons.box, bg: "bg-green-50 text-green-500" },
    { label: "Pending Transfers", value: String(pendingCount), sub: "Awaiting submission or approval", subColor: "text-orange-500", icon: icons.clock, bg: "bg-red-50 text-red-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(s => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
              <Icon d={s.icon} size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
              {s.sub && <p className={`text-xs ${s.subColor} truncate`}>{s.sub}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}