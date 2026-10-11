import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, HelpCircle, LogOut, Search, Settings as SettingsGear, User, BookOpen, Download,
} from "lucide-react";
import Notifications from "../layouts/Notifications";
import userGuide from "../../assets/docs/entouche-ims-user-guide.pdf";

export default function AppHeader({
  user,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  onNotificationClick,

  onLoadMoreNotifications,
  hasMoreNotifications,
  loadingMoreNotifications,

  onSignOut,
  onNavigate,
  dialogOpen = false,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (!dialogOpen && notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }

      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dialogOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const role = user?.roles?.[0]?.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search items, transactions, users..." className="w-full bg-[#F3F4F6] border-none rounded-lg py-2 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-[#4F46E5] outline-none text-gray-500 placeholder:text-gray-400 font-medium" />
      </div>

      <div className="flex items-center gap-5">
        <div className="relative" ref={notifRef}>
          <button type="button" onClick={() => setNotifOpen((open) => !open)} className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <Bell size={18} className="text-gray-500" />
            {unreadCount > 0 && (
              <span
                className={`
      absolute top-1 right-1
      bg-red-500 border-2 border-white
      text-white font-bold
      flex items-center justify-center
      rounded-full
      leading-none
      ${unreadCount < 10
                    ? "w-3.5 h-3.5 text-[8px]"
                    : "min-w-[18px] h-[18px] px-1 text-[8px]"
                  }
    `}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <Notifications
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            notifications={notifications}
            onMarkAllRead={markAllAsRead}
            onNotificationClick={onNotificationClick}
            onToggleRead={markAsRead}
            onDelete={deleteNotification}

            onLoadMore={onLoadMoreNotifications}
            hasMore={hasMoreNotifications}
            loadingMore={loadingMoreNotifications}
          />
        </div>

        <div className="relative" ref={helpRef}>
          <button
            type="button"
            aria-label="Help and Support"
            aria-expanded={helpOpen}
            onClick={() => {
              setHelpOpen((open) => !open);
              setProfileOpen(false);
              setNotifOpen(false);
            }}
            className={`p-2 rounded-full transition-colors cursor-pointer ${helpOpen
              ? "bg-[#EEF2FF] text-[#4F6EF7]"
              : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <HelpCircle size={18} />
          </button>

          <AnimatePresence>
            {helpOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-[calc(100%+12px)] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 origin-top-right overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-[13px] font-bold text-[#1E2740]">
                    Help & Support
                  </h3>
                  <p className="text-[11px] text-[#6B7591] mt-1">
                    Resources to help you use Entouche IMS.
                  </p>
                </div>

                {/* Options */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHelpOpen(false);
                      window.open(userGuide, "_blank", "noopener,noreferrer");
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <BookOpen size={18} className="text-[#4F6EF7]" />
                    </div>

                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1E2740]">
                        User Guide
                      </p>
                      <p className="text-[11px] text-[#6B7591]">
                        View the IMS user manual
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHelpOpen(false);

                      const link = document.createElement("a");
                      link.href = userGuide;
                      link.download = "Entouche_IMS_User_Guide.pdf";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <Download size={18} className="text-[#4F6EF7]" />
                    </div>

                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1E2740]">
                        Download Manual
                      </p>
                      <p className="text-[11px] text-[#6B7591]">
                        Save a copy for offline use
                      </p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-[10px] text-gray-400 text-center">
                    Entouche Inventory Management System
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-[11px]">{initials}</div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-[#1E2740] group-hover:text-indigo-600 transition-colors">{user?.name}</span>
              <span className="text-[10px] text-[#6B7591] font-semibold uppercase tracking-tight">{role}</span>
            </div>
            <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} className="text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-30 origin-top-right">
                <div className="py-1">
                  <DropdownItem icon={<User size={16} />} label="My Profile" onClick={() => { setProfileOpen(false); onNavigate?.("/settings"); }} />
                  <DropdownItem icon={<SettingsGear size={16} />} label="Account Settings" onClick={() => { setProfileOpen(false); onNavigate?.("/settings"); }} />
                </div>
                <div className="border-t border-gray-100 my-1" />
                <div className="py-1">
                  <DropdownItem icon={<LogOut size={16} />} label="Sign Out" onClick={() => { setProfileOpen(false); onSignOut?.(); }} danger />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, onClick, danger = false }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13.5px] font-medium transition-colors text-left ${danger ? "text-red-500 hover:bg-red-50" : "text-[#1E2740] hover:bg-gray-50"}`}>
      <span className={danger ? "text-red-500" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );
}
