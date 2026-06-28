import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LogoIcon from "src/assets/icons/logo.svg?react";
import DashboardIcon from "../../assets/icons/Dashboard.svg?react";
import HomeIcon from "../../assets/icons/Home.svg?react";
import ItemsIcon from "../../assets/icons/Items.svg?react";
import ReportIcon from "../../assets/icons/Report.svg?react";
import DataIcon from "../../assets/icons/Data.svg?react";
import UsersIcon from "../../assets/icons/Users.svg?react";
import WarehouseIcon from "../../assets/icons/Warehouse.svg?react";
import AuditIcon from "../../assets/icons/Audit.svg?react";
import SettingsIcon from "../../assets/icons/Settings.svg?react";

import {
  ChevronDown, Search, Bell, HelpCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';

const MainLayout = () => {
  const [isCollapsed,       setIsCollapsed]       = useState(false);
  const [inventoryOpen,     setInventoryOpen]     = useState(true);
  const [warehouseOpen,     setWarehouseOpen]     = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-['Inter'] text-[#1E2740] overflow-hidden selection:bg-indigo-100">

      <motion.aside
        animate={{ width: isCollapsed ? 70 : 190 }}
        transition={{ duration: 0.3, ease: "circOut" }}
        className="bg-[#1E2740] text-white flex flex-col h-full z-20 flex-shrink-0"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 overflow-hidden whitespace-nowrap border-b border-slate-700/20">
          <div className="min-w-[32px] h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center shadow-inner">
            <LogoIcon className="text-white w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight">InventoryPro</span>
              <span className="text-[9px] text-[#6B7591] font-semibold tracking-wider">Enterprise Inventory</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Menu */}
          <div>
            {!isCollapsed && <p className="text-[10px] font-bold text-[#6B7591] mb-3 px-3 tracking-[0.15em] uppercase">Menu</p>}
            <div className="space-y-1">
              <SidebarLink to="/"      icon={<DashboardIcon className="w-[18px] h-[18px]"/>} label="Dashboard" isCollapsed={isCollapsed} end={true} />
              <SidebarLink to="/items" icon={<ItemsIcon     className="w-[18px] h-[18px]"/>} label="Items"     isCollapsed={isCollapsed} />
            </div>
          </div>

          {/* Inventory section */}
          <div>
            {!isCollapsed && (
              <button
                onClick={() => setInventoryOpen(o => !o)}
                className="flex justify-between items-center px-3 mb-3 w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-3.5 h-3.5 text-[#6B7591]" />
                  <p className="text-[10px] font-bold text-[#6B7591] tracking-[0.15em] uppercase">Inventory</p>
                </div>
                <motion.div animate={{ rotate: inventoryOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={12} className="text-[#6B7591]" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(inventoryOpen || isCollapsed) && (
                <motion.div
                  key="inventory"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <SidebarLink to="/transactions" label="Transactions" isCollapsed={isCollapsed} />
                    <SidebarLink to="/receipts"     label="Receipts"     isCollapsed={isCollapsed} />
                    <SidebarLink to="/transfers"    label="Transfers"    isCollapsed={isCollapsed} />
                    <SidebarLink to="/adjustments"  label="Adjustments"  isCollapsed={isCollapsed} />
                    <SidebarLink to="/stock-counts" label="Stock Counts" isCollapsed={isCollapsed} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Warehouse section */}
          <div>
            {!isCollapsed && (
              <button
                onClick={() => setWarehouseOpen(o => !o)}
                className="flex justify-between items-center px-3 mb-3 w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="w-3.5 h-3.5 text-[#6B7591]" />
                  <p className="text-[10px] font-bold text-[#6B7591] tracking-[0.15em] uppercase">Warehouse</p>
                </div>
                <motion.div animate={{ rotate: warehouseOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={12} className="text-[#6B7591]" />
                </motion.div>
              </button>
            )}
            <AnimatePresence initial={false}>
              {(warehouseOpen || isCollapsed) && (
                <motion.div
                  key="warehouse"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <SidebarLink to="/overview"  label="Overview"  isCollapsed={isCollapsed} />
                    <SidebarLink to="/locations" label="Locations" isCollapsed={isCollapsed} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom links */}
          <div className="pt-4 border-t border-slate-700/30 space-y-1">
            <SidebarLink to="/reports"  icon={<ReportIcon   className="w-[18px] h-[18px]"/>} label="Reports"     isCollapsed={isCollapsed} />
            <SidebarLink to="/user"     icon={<UsersIcon    className="w-[18px] h-[18px]"/>} label="Users & Roles" isCollapsed={isCollapsed} />
            <SidebarLink to="/data"     icon={<DataIcon     className="w-[18px] h-[18px]"/>} label="Data Import"  isCollapsed={isCollapsed} />
            <SidebarLink to="/audit"    icon={<AuditIcon    className="w-[18px] h-[18px]"/>} label="Audit Logs"   isCollapsed={isCollapsed} />
            <SidebarLink to="/settings" icon={<SettingsIcon className="w-[18px] h-[18px]"/>} label="Settings"     isCollapsed={isCollapsed} />
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className="p-4 border-t border-slate-700/30 bg-[#1E2740]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 px-3 py-2 text-[#6B7591] hover:text-white text-sm w-full transition-all overflow-hidden whitespace-nowrap"
          >
            <div className="min-w-[18px]">
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </div>
            {!isCollapsed && <span className="font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search items, transactions, users..."
              className="w-full bg-[#F3F4F6] border-none rounded-lg py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-[#4F46E5] outline-none text-gray-500 placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 bg-red-500 border-2 border-white text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">3</span>
            </div>
            <HelpCircle size={18} className="text-gray-500 cursor-pointer" />

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-[11px]">AM</div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-[#1E2740] group-hover:text-indigo-600 transition-colors">Ayomide Ajayi</span>
                <span className="text-[10px] text-[#6B7591] font-semibold uppercase tracking-tight">System Administrator</span>
              </div>
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, isCollapsed, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
        isActive
          ? "bg-[#4F46E5] text-white shadow-xl shadow-indigo-900/40"
          : "text-[#6B7591] hover:bg-slate-800 hover:text-white"
      }`
    }
  >
    {icon && <div className="min-w-[18px]">{icon}</div>}
    {!isCollapsed && (
      <span className={`text-[13.5px] font-medium whitespace-nowrap overflow-hidden tracking-tight ${!icon ? 'pl-7' : ''}`}>
        {label}
      </span>
    )}
  </NavLink>
);

export default MainLayout;