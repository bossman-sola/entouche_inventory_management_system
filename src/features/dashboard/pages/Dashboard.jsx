import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, ChevronDown, Loader2, Check } from 'lucide-react';
import apiClient from "../../../shared/api/axiosClient"; 
import Total from "../../../assets/icons/Total.svg?react";
import Dollar from "../../../assets/icons/Dollar.svg?react";
import File from "../../../assets/icons/File.svg?react";
import Transaction from "../../../assets/icons/transaction.svg?react";
import Trend from "../../../assets/icons/Trend.svg?react";
import Stock from "../../../assets/icons/stock.svg?react";
import Recent from "../../../assets/icons/tran.svg?react";
import Type from "../../../assets/icons/type.svg?react";

const toISO = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
};

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const formatShort = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const buildPresets = () => {
  const today = new Date();
  return [
    { label: 'Today', start: startOfDay(today), end: endOfDay(today) },
    { label: 'Yesterday', start: startOfDay(addDays(today, -1)), end: endOfDay(addDays(today, -1)) },
    { label: 'Last 7 Days', start: startOfDay(addDays(today, -6)), end: endOfDay(today) },
    { label: 'Last 30 Days', start: startOfDay(addDays(today, -29)), end: endOfDay(today) },
    { label: 'This Month', start: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)), end: endOfDay(today) },
    {
      label: 'Last Month',
      start: startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      end: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)),
    },
  ];
};

async function fetchAllTransactions(params) {
  let page = 1;
  let all = [];
  while (page <= 20) { 
    const res = await apiClient.get('/transactions', { params: { ...params, page } });
    const chunk = res.data?.data || [];
    all = all.concat(chunk);
    const meta = res.data?.meta;
    if (!meta || page >= meta.last_page) break;
    page += 1;
  }
  return all;
}

const TYPE_FAMILY = {
  receipt: 'Receipt',
  transfer_in: 'Transfer',
  transfer_out: 'Transfer',
  adjustment_in: 'Adjustment',
  adjustment_out: 'Adjustment',
};
const TYPE_COLORS = { Receipt: '#16A369', Transfer: '#4F6EF7', Adjustment: '#C27A0A' };

function baseType(rawType) {
  const key = String(rawType || '').toLowerCase().trim();
  if (TYPE_FAMILY[key]) return TYPE_FAMILY[key];
  return key ? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Other';
}

function buildDailyValueTrend(transactions, start, end) {
  const buckets = new Map();
  for (let d = startOfDay(start); d <= end; d = addDays(d, 1)) {
    buckets.set(toISO(d), 0);
  }
  transactions.forEach((t) => {
    const rawDate = t.created_at || t.transaction_date || t.date;
    if (!rawDate) return;
    const key = toISO(startOfDay(new Date(rawDate)));
    if (!buckets.has(key)) return; 
    const qty = Number(t.quantity ?? t.qty ?? 0) || 0;
    const unitCost = Number(t.unit_cost ?? t.item?.unit_cost ?? 0) || 0;
    buckets.set(key, buckets.get(key) + qty * unitCost);
  });
  return Array.from(buckets.entries()).map(([iso, val]) => ({
    name: new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    val: Math.round(val),
  }));
}

function buildTypeBreakdown(transactions) {
  const counts = new Map();
  transactions.forEach((t) => {
    const type = baseType(t.transaction_type || t.type);
    counts.set(type, (counts.get(type) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
    color: TYPE_COLORS[name] || '#94A3B8',
  }));
}

const DateRangePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('preset'); // 'preset' | 'custom'
  const [customStart, setCustomStart] = useState(toISO(value.start));
  const [customEnd, setCustomEnd] = useState(toISO(value.end));
  const wrapperRef = useRef(null);
  const presets = buildPresets();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setMode('preset');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const closeOnEscape = (e) => e.key === 'Escape' && setOpen(false);
      document.addEventListener('keydown', closeOnEscape);
      return () => document.removeEventListener('keydown', closeOnEscape);
    }
  }, [open]);

  const applyPreset = (preset) => {
    onChange({ label: preset.label, start: preset.start, end: preset.end });
    setOpen(false);
    setMode('preset');
  };

  const applyCustom = () => {
    const start = startOfDay(new Date(customStart));
    const end = endOfDay(new Date(customEnd));
    if (isNaN(start) || isNaN(end) || start > end) return;
    onChange({ label: 'Custom', start, end });
    setOpen(false);
    setMode('preset');
  };

  const displayLabel =
    value.label && value.label !== 'Custom'
      ? value.label
      : `${formatShort(value.start)} – ${formatShort(value.end)}`;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-[#1E2740] hover:border-gray-300 transition-colors shadow-sm"
      >
        <Calendar size={15} className="text-[#6B7591]" />
        <span>{displayLabel}</span>
        <ChevronDown size={15} className={`text-[#6B7591] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[300px] bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
          {mode === 'preset' ? (
            <>
              <ul className="py-2 max-h-[280px] overflow-y-auto">
                {presets.map((preset) => {
                  const active = value.label === preset.label;
                  return (
                    <li key={preset.label}>
                      <button
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-[#1E2740] hover:bg-gray-50 transition-colors"
                      >
                        <span>{preset.label}</span>
                        {active && <Check size={14} className="text-blue-600" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <span>Custom Range</span>
                  {value.label === 'Custom' && <Check size={14} className="text-blue-600" />}
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7591] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  max={customEnd}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#1E2740] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7591] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  max={toISO(new Date())}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-semibold text-[#1E2740] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMode('preset')}
                  className="flex-1 px-3 py-2 rounded-lg text-[12px] font-bold text-[#6B7591] hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={applyCustom}
                  className="flex-1 px-3 py-2 rounded-lg text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, val, trend, icon, isDown }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-[12px] font-bold text-[#6B7591] uppercase tracking-wider">{title}</p>
        <p className="text-[22px] font-extrabold text-[#1E2740] mt-2">{val}</p>
        <p className={`text-[11px] font-bold mt-2 ${isDown ? 'text-orange-500' : 'text-emerald-500'}`}>
          {trend}
        </p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
    </div>
  );
};

const TableContainer = ({ title, icon, onViewAll, children }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]">
          {icon} {title}
        </h3>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [dateRange, setDateRange] = useState(() => {
    const preset = buildPresets()[3]; 
    return { label: preset.label, start: preset.start, end: preset.end };
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    lowStockItems: [],
    totalTxns: 0,
    trend: [],
    byType: [],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [itemsResponse, transactions] = await Promise.all([
          apiClient.get("/items"),
          fetchAllTransactions({
            date_from: toISO(dateRange.start),
            date_to: toISO(dateRange.end),
          }),
        ]);
        if (cancelled) return;

        const allItems = itemsResponse.data.data || [];

        let valueSum = 0;
        let lowCount = 0;
        const lowItems = [];

        allItems.forEach(item => {
          const cost = parseFloat(item.unit_cost) || 0;
          const reorder = parseFloat(item.reorder_level) || 0;

          valueSum += cost; 
          if (reorder > 0) { 
            lowCount++;
            lowItems.push(item);
          }
        });

        setItems(allItems);
        setStats({
          totalItems: itemsResponse.data.meta?.total || allItems.length,
          totalValue: valueSum,
          lowStockCount: lowCount,
          lowStockItems: lowItems.slice(0, 5),
          totalTxns: transactions.length,
          trend: buildDailyValueTrend(transactions, dateRange.start, dateRange.end),
          byType: buildTypeBreakdown(transactions),
        });
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { cancelled = true; };
  }, [dateRange]);

  if (loading && items.length === 0) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1E2740] tracking-tight">Dashboard</h1>
          <p className="text-[#6B7591] text-[13px] font-medium mt-0.5">Live inventory overview</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Items" val={stats.totalItems.toLocaleString()} trend="Live" icon={<Total/>} />
        <StatCard title="Inventory Value" val={`₦${stats.totalValue.toLocaleString()}`} trend="Estimate" icon={<Dollar/>} />
        <StatCard title="Low Stock Items" val={stats.lowStockCount} trend="Review" icon={<File/>} isDown />
        <StatCard title="Total Transactions" val={stats.totalTxns.toLocaleString()} trend={dateRange.label} icon={<Transaction/>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px]">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]"><Trend /> Inventory Value Trend</h3>
          <p className="text-[11px] text-gray-400 mt-1 mb-4">Value of stock received, transferred, or adjusted per day - not a running total on hand.</p>
          <ResponsiveContainer width="100%" height="72%">
            <LineChart data={stats.trend}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip formatter={(v) => `₦${Number(v).toLocaleString()}`} />
              <Line type="monotone" dataKey="val" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          {stats.trend.every(p => p.val === 0) && (
            <p className="text-xs text-gray-400 text-center -mt-20">No transactions in this range yet.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px]">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 mb-4 text-[#1E2740]"><Type /> Transactions by Type</h3>
          {stats.byType.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-10">No transactions in this range yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="78%">
                <PieChart>
                  <Pie data={stats.byType} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {stats.byType.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {stats.byType.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7591]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <TableContainer title="Low Stock Items" icon={<Stock/>} onViewAll={() => navigate('/items')}>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#6B7591] font-bold border-b border-gray-50">
              <th className="px-6 py-4 text-left">Item</th>
              <th className="px-6 py-4 text-left">SKU</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-center">Min. Stock</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[12px] font-bold">
            {stats.lowStockItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-[#1E2740]">{item.name}</td>
                <td className="px-6 py-4 text-[#94A3B8]">{item.sku}</td>
                <td className="px-6 py-4 text-[#6B7591]">{item.category?.name || "General"}</td>
                <td className="px-6 py-4 text-center">{item.reorder_level}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600">Low Stock</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
};


export default Dashboard;