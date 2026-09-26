import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiClock,
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
} from "react-icons/fi";
import successToast from "../../utils/SuccessToast";

// Maps each notification `type` from the database to the icon/color this
// UI already used for static data. Add an entry here if a new `type`
// value is ever introduced (keep in sync with the CHECK constraint on
// the `notifications` table and STATUS_NOTIFICATION_META on the backend).
const TYPE_META = {
  report_submitted: { icon: FiClock, iconColor: "text-slate-500" },
  report_verified: { icon: FiShield, iconColor: "text-teal-600" },
  report_in_progress: { icon: FiRefreshCw, iconColor: "text-amber-500" },
  report_resolved: { icon: FiCheckCircle, iconColor: "text-teal-600" },
  report_rejected: { icon: FiXCircle, iconColor: "text-slate-500" },
};

const getDateGroup = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Within "Today" this shows a relative time ("2h ago"); for older groups
// it just repeats the group label, matching the original static design.
const formatTimeAgo = (dateString, group) => {
  if (group !== "Today") return group;

  const diffMs = new Date() - new Date(dateString);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${diffHours}h ago`;
};

const groupNotifications = (items) => {
  const groups = {};

  items.forEach((notification) => {
    if (!groups[notification.group]) {
      groups[notification.group] = [];
    }

    groups[notification.group].push(notification);
  });

  return groups;
};

// Shared shape-mapper: turns a raw notification row (from the initial
// GET, or from a live WebSocket push) into what the UI renders. Keeping
// this in one place means the two data sources can never drift apart.
const mapNotification = (n) => {
  const meta = TYPE_META[n.type] || TYPE_META.report_submitted;
  const group = getDateGroup(n.created_at);

  return {
    id: n.notification_id,
    group,
    icon: meta.icon,
    iconColor: meta.iconColor,
    title: n.title,
    timeAgo: formatTimeAgo(n.created_at, group),
    description: n.message,
    read: n.is_read,
  };
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications.map(mapNotification));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Live updates: the moment an officer changes one of this citizen's
  // report statuses, the backend pushes the new notification over this
  // socket — no manual refresh needed to see it appear.
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "notification") {
          const newNotification = mapNotification(payload.data);

          setNotifications((prev) => {
            // Guard against duplicates if this ever fires twice.
            if (prev.some((n) => n.id === newNotification.id)) return prev;
            return [newNotification, ...prev];
          });

          successToast(newNotification.title);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    // Update immediately for a responsive feel; the request still runs
    // in the background against the real record.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groupedNotifications = groupNotifications(notifications);

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated on your reported civic issues.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-teal-300 bg-white px-4 py-2.5 text-sm font-medium text-teal-700 transition-all duration-200 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        {/* Summary */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />

            <span className="text-sm font-semibold text-teal-700">
              {unreadCount} unread
            </span>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2">
            <span className="text-sm font-medium text-slate-500">
              {notifications.length} total notifications
            </span>
          </div>
        </div>

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-500">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">🔔</div>
            <p className="text-slate-500">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(
              ([group, groupItems]) => (
                <section key={group}>

                  {/* Group Header */}
                  <div className="mb-3 flex items-center gap-4">
                    <h2 className="text-base font-semibold text-slate-700">
                      {group}
                    </h2>

                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Notification List */}
                  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    {groupItems.map((notification, index) => {
                      const Icon = notification.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`group relative flex items-center gap-4 px-4 py-5 transition-colors duration-200 sm:px-5 ${
                            index !== groupItems.length - 1
                              ? "border-b border-slate-100"
                              : ""
                          } ${
                            !notification.read
                              ? "bg-white hover:bg-teal-50/30"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Unread indicator */}
                          {!notification.read && (
                            <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-teal-500" />
                          )}

                          {/* Icon - NO BACKGROUND */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                            <Icon
                              className={`h-6 w-6 ${notification.iconColor}`}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <>
                                  <span className="h-2 w-2 rounded-full bg-teal-500" />

                                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                                    New
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {notification.description}
                            </p>
                          </div>

                          {/* Time */}
                          <span className="hidden shrink-0 text-xs text-slate-400 md:block">
                            {notification.timeAgo}
                          </span>

                          {/* View */}
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="shrink-0 cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}