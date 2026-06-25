import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';
import Total from "../../../assets/icons/Total.svg?react";
import Dollar from "../../../assets/icons/Dollar.svg?react";
import File from "../../../assets/icons/File.svg?react";
import Transaction from "../../../assets/icons/transaction.svg?react";
import Trend from "../../../assets/icons/Trend.svg?react";
import Stock from "../../../assets/icons/stock.svg?react";
import Recent from "../../../assets/icons/tran.svg?react";
import Type from "../../../assets/icons/type.svg?react";


const COLORS = {
  receipt:    '#4F46E5',
  transfer:   '#10B981',
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
  { name: 'Receipts',     value: 45, color: COLORS.receipt,    percent: '28.8%', route: '/receipts'    },
  { name: 'Transfers',    value: 56, color: COLORS.transfer,   percent: '35.9%', route: '/transfers'   },
  { name: 'Adjustments',  value: 27, color: COLORS.adjustment, percent: '17.3%', route: '/adjustments' },
  { name: 'Stock Counts', value: 28, color: COLORS.stockCount, percent: '17.9%', route: '/overview'    },
];


const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CalPicker({ value, onChange, onClose }) {
  const [view,  setView]  = useState(new Date(value.start.getFullYear(), value.start.getMonth(), 1));
  const [lStart, setLS]   = useState(value.start);
  const [lEnd,   setLE]   = useState(value.end);
  const [hover,  setHov]  = useState(null);
  const [phase,  setPhase] = useState(null);

  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1).getDay();
  const dim   = new Date(y, m + 1, 0).getDate();
  const days  = Array(first).fill(null).concat(Array.from({ length: dim }, (_, i) => new Date(y, m, i + 1)));

  const inR  = d => { if (!d || !lStart) return false; const e = lEnd || hover; return e && d > lStart && d < e; };
  const isSt = d => d && lStart && d.toDateString() === lStart.toDateString();
  const isEn = d => d && lEnd   && d.toDateString() === lEnd.toDateString();
  const fmtD = d => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const click = d => {
    if (!d) return;
    if (!lStart || (lStart && lEnd)) { setLS(d); setLE(null); setPhase("end"); }
    else { if (d < lStart) { setLE(lStart); setLS(d); } else setLE(d); setPhase(null); }
  };

  const navBtn = (dir) => (
    <button
      onClick={() => setView(new Date(y, m + dir, 1))}
      style={{ border:"1px solid #e4e7ef", borderRadius:6, width:28, height:28, cursor:"pointer", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth="2">
        {dir === -1
          ? <polyline points="15 18 9 12 15 6"/>
          : <polyline points="9 18 15 12 9 6"/>}
      </svg>
    </button>
  );

  return (
    <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:"#fff", border:"1px solid #e4e7ef", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", zIndex:1000, padding:20, minWidth:300 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        {navBtn(-1)}
        <span style={{ fontWeight:600, fontSize:13, color:"#1e2740" }}>{MONTHS_SHORT[m]} {y}</span>
        {navBtn(1)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:8 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, color:"#9aa1b4", fontWeight:600, padding:"3px 0" }}>{d}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            onClick={() => click(d)}
            onMouseEnter={() => d && phase && setHov(d)}
            onMouseLeave={() => setHov(null)}
            style={{
              textAlign:"center", padding:"5px 0", fontSize:12, borderRadius:6,
              cursor: d ? "pointer" : "default",
              background: isSt(d) || isEn(d) ? "#4f46e5" : inR(d) ? "#eef2ff" : "transparent",
              color:      isSt(d) || isEn(d) ? "#fff"    : d ? "#1e2740" : "transparent",
              fontWeight: isSt(d) || isEn(d) ? 600 : 400,
            }}
          >
            {d ? d.getDate() : ""}
          </div>
        ))}
      </div>
      <div style={{ borderTop:"1px solid #f0f2f7", paddingTop:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:11, color:"#6b7591" }}>
          {lStart ? fmtD(lStart) : "Start"}{lEnd ? ` – ${fmtD(lEnd)}` : ""}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onClose} style={{ padding:"5px 12px", border:"1px solid #e4e7ef", borderRadius:6, fontSize:12, cursor:"pointer", background:"#fff", fontFamily:"inherit" }}>Cancel</button>
          <button
            onClick={() => { onChange({ start: lStart, end: lEnd || lStart }); onClose(); }}
            style={{ padding:"5px 12px", border:"none", borderRadius:6, fontSize:12, cursor:"pointer", background:"#4f46e5", color:"#fff", fontFamily:"inherit", fontWeight:600 }}
          >Apply</button>
        </div>
      </div>
    </div>
  );
}


const Dashboard = () => {
  const navigate = useNavigate();
  const calRef   = useRef();
  const [showCal,    setShowCal]   = useState(false);
  const [dateRange,  setDateRange] = useState({ start: new Date(2025,4,21), end: new Date(2025,4,27) });

  
  useEffect(() => {
    const handler = (e) => { if (calRef.current && !calRef.current.contains(e.target)) setShowCal(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fmtDR = () => {
    const f = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${f(dateRange.start)} – ${f(dateRange.end)}`;
  };

  const handlePieClick = (data) => {
    if (data && data.route) navigate(data.route);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1E2740] tracking-tight">Dashboard</h1>
          <p className="text-[#6B7591] text-[13px] font-medium mt-0.5">Overview of your inventory operations</p>
        </div>

        
        <div ref={calRef} style={{ position:"relative" }}>
          <button
            onClick={() => setShowCal(o => !o)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#1E2740] shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap"
          >
            <Calendar size={14} className="text-[#6B7591]" />
            {fmtDR()}
            <ChevronDown size={14} className="text-[#6B7591]" />
          </button>
          {showCal && (
            <CalPicker
              value={dateRange}
              onChange={v => setDateRange(v)}
              onClose={() => setShowCal(false)}
            />
          )}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Items"           val="1,248"        trend="12.5%"  icon={<Total/>} />
        <StatCard title="Total Inventory Value" val="₦45,780,250"  trend="8.4%"   icon={<Dollar/>} />
        <StatCard title="Low Stock Items"       val="23"           trend="4"      icon={<File/>}  isDown />
        <StatCard title="Transactions"          val="156"          trend="18.7%"  icon={<Transaction/>} />
      </div>

      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[14px] font-extrabold flex items-center gap-2 text-[#1E2740]">
              <Trend /> Inventory Value Trend
            </h3>
            <div className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded-md text-[10px] font-bold text-[#6B7591] cursor-pointer">
              7 Days <ChevronDown size={12}/>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94A3B8', fontWeight:600}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:10, fill:'#94A3B8', fontWeight:600}} tickFormatter={v => `N${v}M`} />
              <Tooltip cursor={{stroke:'#E2E8F0'}} contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0/0.1)', fontSize:'11px', fontWeight:700}} />
              <Line type="monotone" dataKey="val" stroke="#4F46E5" strokeWidth={2.5} dot={{r:4, fill:'#4F46E5', strokeWidth:2, stroke:'#fff'}} activeDot={{r:6, strokeWidth:0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[380px] min-w-0">
          <h3 className="text-[14px] font-extrabold flex items-center gap-2 mb-8 text-[#1E2740]">
            <Type /> Transactions by Type
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative" style={{cursor:'pointer'}}>
              <PieChart width={160} height={160}>
                <Pie
                  data={pieData}
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  onClick={handlePieClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-[#F8FAFC] w-14 h-14 rounded-full border-4 border-white"></div>
              </div>
            </div>

            <div className="mt-8 w-full space-y-3">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  onClick={() => navigate(item.route)}
                  className="flex items-center justify-between font-bold text-[11px] cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-[#6B7591]">{item.name}</span>
                  </div>
                  <span className="text-[#1E2740]">
                    {item.value} <span className="text-[#94A3B8] font-medium ml-1">({item.percent})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      <TableContainer title="Recent Transactions" icon={<Recent />} onViewAll={() => navigate('/transactions')}>
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
            <TransactionRow id="TXN-000156" date="May 27, 10:15 AM" type="Receipt"    item="HP LaserJet Pro MFP M428" from="—"             to="Receiving Area" qty="10" user="Inventory Officer"  color="blue"    />
            <TransactionRow id="TXN-000155" date="May 27, 09:32 AM" type="Transfer"   item="Dell Latitude 5440"      from="Receiving Area" to="Storage Area"   qty="20" user="Inventory Officer"  color="emerald" />
            <TransactionRow id="TXN-000154" date="May 26, 04:45 PM" type="Adjustment" item="USB-C Hub"               from="Storage Area"   to="Damaged Area"   qty="-5" user="Warehouse Manager" color="amber"   />
            <TransactionRow id="TXN-000153" date="May 26, 02:10 PM" type="Transfer"   item="Office Chair"            from="Storage Area"   to="Dispatch Area"  qty="3"  user="Inventory Officer"  color="emerald" />
          </tbody>
        </table>
      </TableContainer>

      
      <TableContainer title="Low Stock Items" icon={<Stock/>} onViewAll={() => navigate('/items')}>
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
            <StockRow item="HP LaserJet Pro MFP M428" sku="PRN-001" cat="Printers"  loc="Storage Area"  cur="2" min="5" status="Low Stock"    />
            <StockRow item="Dell Latitude 5440"        sku="LAP-001" cat="Laptops"   loc="Storage Area"  cur="3" min="5" status="Low Stock"    />
            <StockRow item="Ergonomic Office Chair"    sku="CHR-002" cat="Furniture" loc="Dispatch Area" cur="0" min="2" status="Out of Stock" />
          </tbody>
        </table>
      </TableContainer>

    </div>
  );
};



const StatCard = ({ title, val, trend, icon, isDown }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[135px] relative overflow-hidden group hover:shadow-md transition-all min-w-0">
    <div className="flex justify-between items-start gap-2">
      <div className="space-y-1 overflow-hidden">
        <p className="text-[11px] uppercase font-extrabold text-[#6B7591] tracking-wider truncate">{title}</p>
        <h2 className="text-[18px] lg:text-[22px] font-extrabold text-[#1E2740] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{val}</h2>
      </div>
      <div className="relative flex-shrink-0">
        <div className="relative z-10 w-8 h-8 flex items-center justify-center backdrop-blur-sm">{icon}</div>
      </div>
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
      <button onClick={onViewAll} className="text-[#4F46E5] text-[11px] font-extrabold hover:underline tracking-tight">
        View all
      </button>
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

const StockRow = ({ item, sku, cat, loc, cur, min, status }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 text-[#1E2740]">{item}</td>
    <td className="px-6 py-4 text-[#94A3B8]">{sku}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium">{cat}</td>
    <td className="px-6 py-4 text-[#6B7591] font-medium">{loc}</td>
    <td className="px-6 py-4 text-center">{cur}</td>
    <td className="px-6 py-4 text-[#94A3B8] text-center">{min}</td>
    <td className="px-6 py-4">
      {status === 'Out of Stock'
        ? <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white shadow-sm">Out of Stock</span>
        : <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600">Low Stock</span>
      }
    </td>
  </tr>
);

export default Dashboard;