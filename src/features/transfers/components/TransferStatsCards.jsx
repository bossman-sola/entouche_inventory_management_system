import { Icon, icons } from "./icons.jsx";

const txDate = (t) => new Date(t.transfer_date || t.created_at || 0);
const txQty = (t) => (t.items || []).reduce((s, r) => s + (Number(r.quantity) || 0), 0);
const txValue = (t) => (t.items || []).reduce((s, r) => {
  const cost = Number(r.unit_cost ?? r.item?.unit_cost ?? 0) || 0;
  const qty = Number(r.quantity) || 0;
  return s + qty * cost;
}, 0);

function pctChange(curr, prev) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function Trend({ pct }) {
  const up = pct >= 0;
  return (
    <p className={`text-xs flex items-center gap-1 mt-0.5 ${up ? "text-green-600" : "text-red-500"}`}>
      <Icon d={icons.arrowUp} size={10} strokeWidth={2.5} className={up ? "" : "rotate-180"} />
      {Math.abs(pct).toFixed(1)}% vs last 7 days
    </p>
  );
}

export default function TransferStatsCards({ transfers }) {
  const totalQty = transfers.reduce((s, t) => s + txQty(t), 0);
  const totalValue = transfers.reduce((s, t) => s + txValue(t), 0);
  const pendingCount = transfers.filter(t => t.status === "draft" || t.status === "pending_approval").length;

  const now = new Date();
  const sevenAgo = new Date(now); sevenAgo.setDate(now.getDate() - 7);
  const fourteenAgo = new Date(now); fourteenAgo.setDate(now.getDate() - 14);

  const last7 = transfers.filter(t => { const d = txDate(t); return d >= sevenAgo && d <= now; });
  const prev7 = transfers.filter(t => { const d = txDate(t); return d >= fourteenAgo && d < sevenAgo; });

  const countTrend = pctChange(last7.length, prev7.length);
  const qtyTrend = pctChange(last7.reduce((s, t) => s + txQty(t), 0), prev7.reduce((s, t) => s + txQty(t), 0));
  const valueTrend = pctChange(last7.reduce((s, t) => s + txValue(t), 0), prev7.reduce((s, t) => s + txValue(t), 0));

  const cards = [
    { label: "Total Transfers", value: String(transfers.length), icon: icons.transferAlt, bg: "bg-blue-50 text-blue-500", trend: countTrend },
    { label: "Total Quantity Transferred", value: totalQty.toLocaleString(), icon: icons.ring, bg: "bg-green-50 text-green-500", trend: qtyTrend },
    { label: "Total Value Transferred", value: `₦${totalValue.toLocaleString()}`, icon: icons.dollarSign, bg: "bg-orange-50 text-orange-500", trend: valueTrend },
    { label: "Pending Transfers", value: String(pendingCount), sub: "Pending approval/processing", subColor: "text-orange-500", icon: icons.clock, bg: "bg-red-50 text-red-500" },
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
              {s.trend !== undefined ? <Trend pct={s.trend} /> : s.sub && <p className={`text-xs ${s.subColor} truncate`}>{s.sub}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}