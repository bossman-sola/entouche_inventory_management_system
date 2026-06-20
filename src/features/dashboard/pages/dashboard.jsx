import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, ChevronDown, Package, DollarSign, FileText, 
  RefreshCw, AlertTriangle, Hexagon, Plus, Send, FileBarChart, MapPin
} from 'lucide-react';
import Total from "../../../assets/icons/Total.svg?react";
import Dollar from "../../../assets/icons/Dollar.svg?react";
import File from "../../../assets/icons/File.svg?react";
import Transaction from "../../../assets/icons/transaction.svg?react";
import Trend from "../../../assets/icons/Trend.svg?react";
import Stock from "../../../assets/icons/stock.svg?react";
import Recent from "../../../assets/icons/tran.svg?react";
import Type from "../../../assets/icons/type.svg?react";


const COLORS = {
  textMain: '#1E2740',
  textMuted: '#6B7591',
  receipt: '#4F46E5',     
  transfer: '#10B981',    
  adjustment: '#F59E0B',  
  stockCount: '#8B5CF6',  
};

const lineData = [
  { name: 'May 21', val: 28 }, { name: 'May 22', val: 33 },
  { name: 'May 23', val: 38 }, { name: 'May 24', val: 42 },
  { name: 'May 25', val: 44 }, { name: 'May 26', val: 51 },
  { name: 'May 27', val: 48 },
];

const pieData = [
  { name: 'Receipts', value: 45, color: COLORS.receipt, percent: '28.8%' },
  { name: 'Transfers', value: 56, color: COLORS.transfer, percent: '35.9%' },
  { name: 'Adjustments', value: 27, color: COLORS.adjustment, percent: '17.3%' },
  { name: 'Stock Counts', value: 28, color: COLORS.stockCount, percent: '17.9%' },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1E2740] tracking-tight">Dashboard</h1>
          <p className="text-[#6B7591] text-[13px] font-medium mt-0.5">Overview of your inventory operations</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#1E2740] shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap">
          <Calendar size={14} className="text-[#6B7591]" />
          May 21 – May 27, 2025
          <ChevronDown size={14} className="text-[#6B7591]" />
        </button>
      </div>

      {/* STAT CARDS - RESPONSIVE GRID (Prevents squeezing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Items" val="1,248" trend="12.5%" icon={<Total/>} />
        <StatCard title="Total Inventory Value" val="₦45,780,250" trend="8.4%" icon={<Dollar/>} />
        <StatCard title="Low Stock Items" val="23" trend="4" isDown icon={<File/>}  />
        <StatCard title="Transactions" val="156" trend="18.7%" icon={<Transaction/>}  />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]">
              <Trend />
              Inventory Value Trend
            </h3>
            <div className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded-md text-[10px] font-bold text-[#6B7591] cursor-pointer">
                7 Days <ChevronDown size={12}/>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 600}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 600}} tickFormatter={(v) => `N${v}M`} />
              <Tooltip cursor={{ stroke: '#E2E8F0' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 700 }} />
              <Line type="monotone" dataKey="val" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 mb-8 text-[#1E2740]">
            <Type />
            Transactions by Type
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <PieChart width={160} height={160}>
                <Pie data={pieData} innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-[#F8FAFC] w-14 h-14 rounded-full border-4 border-white"></div>
              </div>
            </div>
            
            <div className="mt-8 w-full space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-bold text-[11px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-[#6B7591]">{item.name}</span>
                  </div>
                  <span className="text-[#1E2740]">{item.value} <span className="text-[#94A3B8] font-medium ml-1">({item.percent})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <TableContainer title="Recent Transactions" icon={<Recent />}>
          <table className="w-full min-w-[800px]">
            <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#6B7591] font-bold border-b border-gray-50">
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Item</th>
                    <th className="px-6 py-4 text-left">From</th>
                    <th className="px-6 py-4 text-left">To</th>
                    <th className="px-6 py-4 text-left">Qty</th>
                    <th className="px-6 py-4 text-left">User</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[12px] font-bold">
                <TransactionRow id="TXN-000156" date="May 27, 10:15 AM" type="Receipt" item="HP LaserJet Pro MFP M428" from="—" to="Receiving Area" qty="10" user="Inventory Officer" color="blue" />
                <TransactionRow id="TXN-000155" date="May 27, 09:32 AM" type="Transfer" item="Dell Latitude 5440" from="Receiving Area" to="Storage Area" qty="20" user="Inventory Officer" color="emerald" />
                <TransactionRow id="TXN-000154" date="May 26, 04:45 PM" type="Adjustment" item="USB-C Hub" from="Storage Area" to="Damaged Area" qty="-5" user="Warehouse Manager" color="amber" />
                <TransactionRow id="TXN-000153" date="May 26, 02:10 PM" type="Transfer" item="Office Chair" from="Storage Area" to="Dispatch Area" qty="3" user="Inventory Officer" color="emerald" />
            </tbody>
          </table>
      </TableContainer>

      
      <TableContainer title="Low Stock Items" icon={<Stock/>}>
          <table className="w-full min-w-[800px]">
            <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#6B7591] font-bold border-b border-gray-50">
                    <th className="px-6 py-4 text-left">Item</th>
                    <th className="px-6 py-4 text-left">SKU</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Location</th>
                    <th className="px-6 py-4 text-left">Current Stock</th>
                    <th className="px-6 py-4 text-left">Min. Stock</th>
                    <th className="px-6 py-4 text-left">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[12px] font-bold">
                <StockRow item="HP LaserJet Pro MFP M428" sku="PRN-001" cat="Printers" loc="Storage Area" cur="2" min="5" status="Low Stock" color="amber" />
                <StockRow item="Dell Latitude 5440" sku="LAP-001" cat="Laptops" loc="Storage Area" cur="3" min="5" status="Low Stock" color="amber" />
                <StockRow item="Ergonomic Office Chair" sku="CHR-002" cat="Furniture" loc="Dispatch Area" cur="0" min="2" status="Out of Stock" color="red" />
            </tbody>
          </table>
      </TableContainer>
    </div>
  );
};



const StatCard = ({ title, val, trend, icon, shape, shapeColor, isDown }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[135px] relative overflow-hidden group hover:shadow-md transition-all min-w-0">
    <div className="flex justify-between items-start gap-2">
      <div className="space-y-1 overflow-hidden">
        <p className="text-[11px] uppercase font-extrabold text-[#6B7591] tracking-wider truncate">{title}</p>
        <h2 className="text-[18px] lg:text-[22px] font-extrabold text-[#1E2740] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{val}</h2>
      </div>
      <div className="relative flex-shrink-0">
        
        <div className="relative z-10 w-8 h-8 flex items-center justify-center    backdrop-blur-sm">{icon}</div>
      </div>
    </div>
    <div className={`text-[11px] font-extrabold flex items-center gap-1.5 flex-wrap ${isDown ? 'text-red-500' : 'text-emerald-500'}`}>
      <span>{isDown ? '▼' : '▲'}</span> {trend} <span className="text-[#94A3B8] font-medium whitespace-nowrap">vs last 7 days</span>
    </div>
  </div>
);

const TableContainer = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
    <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
      <h3 className="text-[14px] font-extrabold flex items-center gap-2.5 text-[#1E2740]">{icon} {title}</h3>
      <button className="text-[#4F46E5] text-[11px] font-extrabold hover:underline tracking-tight">View all</button>
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const TransactionRow = ({ id, date, type, item, from, to, qty, user, color }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 text-[#94A3B8]">{id}</td>
    <td className="px-6 py-4 text-[#6B7591]">{date}</td>
    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] bg-${color}-50 text-${color}-600 uppercase`}>{type}</span></td>
    <td className="px-6 py-4 text-[#1E2740]">{item}</td>
    <td className="px-6 py-4 text-[#6B7591]">{from}</td>
    <td className="px-6 py-4 text-[#6B7591]">{to}</td>
    <td className="px-6 py-4 text-[#1E2740]">{qty}</td>
    <td className="px-6 py-4 text-[#6B7591]">{user}</td>
  </tr>
);

const StockRow = ({ item, sku, cat, loc, cur, min, status, color }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 text-[#1E2740]">{item}</td>
    <td className="px-6 py-4 text-[#94A3B8]">{sku}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium">{cat}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium">{loc}</td>
    <td className="px-6 py-4 text-center">{cur}</td>
    <td className="px-6 py-4 text-[#94A3B8] text-center">{min}</td>
    <td className="px-6 py-4">
      {status === 'Out of Stock' ? (
        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white shadow-sm">Out of Stock</span>
      ) : (
        <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600">Low Stock</span>
      )}
    </td>
  </tr>
);

export default Dashboard;