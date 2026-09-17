import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import Logo from "../../assets/icons/Logo.svg?react";
import DashboardIcon from "../../assets/icons/Dashboard.svg?react";
import HomeIcon from "../../assets/icons/Home.svg?react";
import ItemsIcon from "../../assets/icons/Items.svg?react";
import ReportIcon from "../../assets/icons/Report.svg?react";
import DataIcon from "../../assets/icons/Data.svg?react";
import UsersIcon from "../../assets/icons/Users.svg?react";
import WarehouseIcon from "../../assets/icons/Warehouse.svg?react";
import AuditIcon from "../../assets/icons/Audit.svg?react";
import SettingsIcon from "../../assets/icons/Settings.svg?react";
import { api } from "../../shared/api/entoucheApi";

export default function AppSidebar({ collapsed, setCollapsed }) {
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [warehouseOpen, setWarehouseOpen] = useState(true);

  const [companyLogo, setCompanyLogo] = useState("");
  const [companyName, setCompanyName] = useState("Entouche");

  useEffect(() => {
    let mounted = true;

    const loadBranding = async () => {
      try {
        const settings = await api.listSettings();

        if (!mounted || !settings) {
          return;
        }

        const flat = {};

        Object.values(settings).forEach((group) => {
          if (!Array.isArray(group)) {
            return;
          }

          group.forEach((setting) => {
            flat[setting.key] = setting.value;
          });
        });

        setCompanyLogo(
          flat["company.logo"] || "",
        );

        setCompanyName(
          flat["general.company_name"] ||
          "Entouche",
        );
      } catch (error) {
        console.error(
          "Failed to load company branding:",
          error,
        );
      }
    };

    loadBranding();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 190 }}
      transition={{ duration: 0.3, ease: "circOut" }}
      className="bg-[#1E2740] text-white flex flex-col h-full z-20 flex-shrink-0"
    >
      <div className="p-5 flex items-center gap-3 overflow-hidden whitespace-nowrap border-b border-slate-700/20">
        <div className={`min-w-[32px] w-8 h-8 rounded-lg flex items-center justify-center shadow-inner overflow-hidden ${companyLogo ? "bg-white" : "bg-[#4F46E5]"
          }`}>
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${companyName} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Logo className="text-white w-4 h-4" />
          )}
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base leading-tight tracking-tight truncate">
              {companyName}
            </span>

            <span className="text-[9px] text-[#6B7591] font-semibold tracking-wider">
              Enterprise Inventory
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-7 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div>
          {!collapsed && <p className="text-[10px] font-bold text-[#6B7591] mb-3 px-3 tracking-[0.15em] uppercase">Menu</p>}
          <div className="space-y-1">
            <SidebarLink to="/" icon={<DashboardIcon className="w-[18px] h-[18px]" />} label="Dashboard" collapsed={collapsed} end />
            <SidebarLink to="/items" icon={<ItemsIcon className="w-[18px] h-[18px]" />} label="Items" collapsed={collapsed} />
          </div>
        </div>

        <SidebarGroup
          title="Inventory"
          icon={<HomeIcon className="w-3.5 h-3.5 text-[#6B7591]" />}
          open={inventoryOpen}
          setOpen={setInventoryOpen}
          collapsed={collapsed}
        >
          <SidebarLink to="/transactions" label="Transactions" collapsed={collapsed} />
          <SidebarLink to="/receipts" label="Receipts" collapsed={collapsed} />
          <SidebarLink to="/transfers" label="Transfers" collapsed={collapsed} />
          <SidebarLink to="/adjustments" label="Adjustments" collapsed={collapsed} />
          <SidebarLink to="/stock-counts" label="Stock Counts" collapsed={collapsed} />
        </SidebarGroup>

        <SidebarGroup
          title="Warehouse"
          icon={<WarehouseIcon className="w-3.5 h-3.5 text-[#6B7591]" />}
          open={warehouseOpen}
          setOpen={setWarehouseOpen}
          collapsed={collapsed}
        >
          <SidebarLink to="/overview" label="Overview" collapsed={collapsed} />
          <SidebarLink to="/locations" label="Locations" collapsed={collapsed} />
        </SidebarGroup>

        <div className="pt-4 border-t border-slate-700/30 space-y-1">
          <SidebarLink to="/reports" icon={<ReportIcon className="w-[18px] h-[18px]" />} label="Reports" collapsed={collapsed} />
          <SidebarLink to="/user" icon={<UsersIcon className="w-[18px] h-[18px]" />} label="Users & Roles" collapsed={collapsed} />
          <SidebarLink to="/data" icon={<DataIcon className="w-[18px] h-[18px]" />} label="Data Import" collapsed={collapsed} />
          <SidebarLink to="/audit" icon={<AuditIcon className="w-[18px] h-[18px]" />} label="Audit Logs" collapsed={collapsed} />
          <SidebarLink to="/settings" icon={<SettingsIcon className="w-[18px] h-[18px]" />} label="Settings" collapsed={collapsed} />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700/30 bg-[#1E2740]">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 px-3 py-2 text-[#6B7591] hover:text-white text-sm w-full transition-all overflow-hidden whitespace-nowrap">
          <div className="min-w-[18px]">{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</div>
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

function SidebarGroup({ title, icon, open, setOpen, collapsed, children }) {
  return (
    <div>
      {!collapsed && (
        <button onClick={() => setOpen((value) => !value)} className="flex justify-between items-center px-3 mb-3 w-full text-left">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-[10px] font-bold text-[#6B7591] tracking-[0.15em] uppercase">{title}</p>
          </div>
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} className="text-[#6B7591]" />
          </motion.div>
        </button>
      )}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
            <div className="space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarLink({ to, icon, label, collapsed, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${isActive ? "bg-[#4F46E5] text-white shadow-xl shadow-indigo-900/40" : "text-[#6B7591] hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {icon && <div className="min-w-[18px]">{icon}</div>}
      {!collapsed && <span className={`text-[13.5px] font-medium whitespace-nowrap overflow-hidden tracking-tight ${!icon ? "pl-7" : ""}`}>{label}</span>}
    </NavLink>
  );
}
