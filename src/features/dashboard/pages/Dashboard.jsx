import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';
import apiClient from "../../../shared/api/axiosClient";

// Icons
import Total from "../../../assets/icons/Total.svg?react";
import Dollar from "../../../assets/icons/Dollar.svg?react";
import File from "../../../assets/icons/File.svg?react";
import Transaction from "../../../assets/icons/transaction.svg?react";
import Trend from "../../../assets/icons/Trend.svg?react";
import Stock from "../../../assets/icons/stock.svg?react";
import Recent from "../../../assets/icons/tran.svg?react";
import Type from "../../../assets/icons/type.svg?react";

const COLORS = { receipt: '#4F46E5', transfer: '#10B981', adjustment: '#F59E0B', stockCount: '#8B5CF6' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    lowStockItems: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/items");
        const allItems = response.data.data || [];
        
        let valueSum = 0;
        let lowItems = [];

        allItems.forEach(item => {
          const cost = parseFloat(item.unit_cost) || 0;
          const reorder = parseFloat(item.reorder_level) || 0;
          // In a real app, you'd multiply cost by current balance. 
          // For now, we sum unit costs as a placeholder for "Value".
          valueSum += cost; 
          if (reorder > 5) { // Sample logic: items with reorder > 5 are flagged
            lowItems.push(item);
          }
        });

        setItems(allItems);
        setStats({
          totalItems: response.data.meta?.total || allItems.length,
          totalValue: valueSum,
          lowStockCount: lowItems.length,
          lowStockItems: lowItems.slice(0, 5)
        });
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1E2740] tracking-tight">Dashboard</h1>
          <p className="text-[#6B7591] text-[13px] font-medium mt-0.5">Overview of your inventory operations</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#1E2740] shadow-sm">
          <Calendar size={14} className="text-[#6B7591]" />
          Today: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Items" val={stats.totalItems} trend="Live" icon={<Total/>} />
        <StatCard title="Inventory Value" val={`₦${stats.totalValue.toLocaleString()}`} trend="8.4%" icon={<Dollar/>} />
        <StatCard title="Low Stock Items" val={stats.lowStockCount} trend="Review" icon={<File/>} isDown />
        <StatCard title="Transactions" val="---" trend="0%" icon={<Transaction/>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]"><Trend /> Inventory Value Trend</h3>
          </div>
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Trend data available when reports are generated</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 mb-8 text-[#1E2740]"><Type /> Transactions by Type</h3>
          <div className="text-center text-gray-400 text-xs mt-20">Transaction pie chart placeholder</div>
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
            {stats.lowStockItems.length > 0 ? stats.lowStockItems.map(item => (
              <StockRow 
                key={item.id} 
                item={item.name} 
                sku={item.sku} 
                cat={item.category?.name || "General"} 
                loc="Main Warehouse" 
                cur="--" 
                min={item.reorder_level} 
                status="Low Stock" 
              />
            )) : (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">All stock levels are healthy.</td></tr>
            )}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
};

// --- Helper Components (Defined here to avoid ReferenceErrors) ---

const StatCard = ({ title, val, trend, icon, isDown }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[135px] relative overflow-hidden group hover:shadow-md transition-all min-w-0">
    <div className="flex justify-between items-start gap-2">
      <div className="space-y-1 overflow-hidden">
        <p className="text-[11px] uppercase font-extrabold text-[#6B7591] tracking-wider truncate">{title}</p>
        <h2 className="text-[18px] lg:text-[22px] font-extrabold text-[#1E2740] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{val}</h2>
      </div>
      <div className="relative flex-shrink-0 z-10 w-8 h-8 flex items-center justify-center backdrop-blur-sm">{icon}</div>
    </div>
    <div className={`text-[11px] font-extrabold flex items-center gap-1.5 flex-wrap ${isDown ? 'text-red-500' : 'text-emerald-500'}`}>
      <span>{isDown ? '▼' : '▲'}</span> {trend} <span className="text-[#94A3B8] font-medium whitespace-nowrap">vs last 7 days</span>
    </div>
  </div>
);

const TableContainer = ({ title, icon, children, onViewAll }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
    <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
      <h3 className="text-[14px] font-extrabold flex items-center gap-2.5 text-[#1E2740]">{icon} {title}</h3>
      <button onClick={onViewAll} className="text-[#4F46E5] text-[11px] font-extrabold hover:underline tracking-tight">View all</button>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const StockRow = ({ item, sku, cat, loc, cur, min, status }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 text-[#1E2740]">{item}</td>
    <td className="px-6 py-4 text-[#94A3B8]">{sku}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium">{cat}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium text-center">{cur}</td>
    <td className="px-6 py-4 text-[#94A3B8] text-center">{min}</td>
    <td className="px-6 py-4">
      <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600">Low Stock</span>
    </td>
  </tr>
);

export default Dashboard;