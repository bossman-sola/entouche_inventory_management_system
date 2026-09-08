import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MoreVertical, AlertCircle, Loader2 } from "lucide-react";
import { NOTIFICATION_META } from "../data/notificationMeta";

const DEFAULT_META = {
  label: "Notification",
  icon: AlertCircle,
  iconBg: "bg-gray-50",
  iconFg: "text-gray-500",
  dot: "bg-gray-400",
};

const formatLocalDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getNotificationDescription = (notification) => {
  if (notification.type === "maintenance_scheduled") {
    const start = formatLocalDateTime(notification.startsAt);
    const end = formatLocalDateTime(notification.endsAt);

    return `A maintenance window titled '${
      notification.maintenanceTitle || "Scheduled Maintenance"
    }' has been scheduled to start at ${start} and end at ${end}.`;
  }

  if (notification.type === "maintenance_cancelled") {
    const start = formatLocalDateTime(notification.startsAt);

    return `The maintenance window titled '${
      notification.maintenanceTitle || "Scheduled Maintenance"
    }' scheduled to start at ${start} has been cancelled.`;
  }

  return notification.description;
};

const NotificationCard = ({
  notification,
  onClick,
  onToggleRead,
  onDelete,
}) => {
  const meta = NOTIFICATION_META[notification.type] || DEFAULT_META;
  const Icon = meta.icon;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={() => onClick?.(notification)}
      className="relative flex gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 bg-white"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}
      >
        <Icon size={18} className={meta.iconFg} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13.5px] font-bold text-[#1E2740] leading-snug">
            {notification.title}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                notification.unread ? meta.dot : "bg-gray-300"
              }`}
            />

            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {notification.timeAgo}
            </span>
          </div>
        </div>

        <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed pr-2">
          {getNotificationDescription(notification)}
        </p>

        <span
          className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
            notification.unread
              ? "bg-red-50 text-red-500"
              : "bg-green-50 text-green-600"
          }`}
        >
          {notification.unread ? "Unread" : "Read"}
        </span>
      </div>

      <div
        className="relative flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical size={14} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-7 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10"
            >
              <button
                type="button"
                onClick={() => {
                  onToggleRead?.(notification);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[12.5px] text-[#1E2740] hover:bg-gray-50"
              >
                Mark as {notification.unread ? "read" : "unread"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onDelete?.(notification);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-[12.5px] text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Notifications = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  onToggleRead,
  onDelete,

  // Infinite-scroll props
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const handleScroll = (event) => {
    const element = event.currentTarget;

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    const nearBottom = distanceFromBottom <= 120;

    if (nearBottom && hasMore && !loadingMore) {
      onLoadMore?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-20"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <h3 className="text-[17px] font-bold text-[#1E2740]">
                  Notifications
                </h3>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-[12px] font-semibold text-[#4F46E5] hover:text-indigo-700 whitespace-nowrap"
                    >
                      Mark all as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-gray-400 mt-1">
                Stay updated on important activities and alerts.
              </p>
            </div>

            {/* Notification List */}
            <div
              onScroll={handleScroll}
              className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {notifications.length === 0 ? (
                <div className="px-5 py-14 text-center text-[13px] text-gray-400">
                  You're all caught up - no notifications yet.
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onClick={onNotificationClick}
                      onToggleRead={onToggleRead}
                      onDelete={onDelete}
                    />
                  ))}

                  {loadingMore && (
                    <div className="flex items-center justify-center gap-2 py-4 text-[12px] text-gray-400">
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Loading more notifications...
                    </div>
                  )}

                  {!hasMore &&
                    !loadingMore &&
                    notifications.length > 0 && (
                      <div className="py-4 text-center text-[11px] text-gray-300">
                        You've reached the end.
                      </div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notifications;