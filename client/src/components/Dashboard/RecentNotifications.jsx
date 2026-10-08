import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiClock,
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiBell,
  FiEye,
} from "react-icons/fi";

const TYPE_META = {
  report_submitted: { icon: FiClock, iconColor: "text-slate-500" },
  report_verified: { icon: FiShield, iconColor: "text-teal-600" },
  report_in_progress: { icon: FiRefreshCw, iconColor: "text-amber-500" },
  report_resolved: { icon: FiCheckCircle, iconColor: "text-teal-600" },
  report_rejected: { icon: FiXCircle, iconColor: "text-slate-500" },
};

const formatTimeAgo = (dateString) => {
  const diffMs = new Date() - new Date(dateString);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function RecentNotifications({ onViewComplaint }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications", {
          withCredentials: true,
        });

        if (response.data.success) {
          // Get the 5 most recent notifications
          const recentNotifications = response.data.notifications
            .slice(0, 5)
            .map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.report_submitted;
              return {
                id: n.notification_id,
                reportId: n.report_id,
                icon: meta.icon,
                iconColor: meta.iconColor,
                title: n.title,
                timeAgo: formatTimeAgo(n.created_at),
                description: n.message,
                read: n.is_read,
              };
            });

          setNotifications(recentNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleViewComplaint = async (reportId, notificationId) => {
    try {
      // Mark notification as read
      await axios.patch(
        `/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );

      // Fetch the complaint details
      const response = await axios.get(`/api/reports/${reportId}`, {
        withCredentials: true,
      });

      if (response.data.success && onViewComplaint) {
        onViewComplaint(response.data.report);
      }
    } catch (error) {
      console.error("Error viewing complaint:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <FiBell className="mx-auto mb-3 h-6 w-6 animate-pulse text-teal-600" />
          <p className="text-sm text-slate-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Notifications
          </h2>
          <FiBell className="h-5 w-5 text-teal-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center px-6 py-10">
            <div className="text-center">
              <FiBell className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm font-medium text-slate-700">
                No notifications yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                You'll see updates about your complaints here
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`px-5 py-4 transition-colors hover:bg-slate-50/70 ${
                    !notification.read ? "bg-teal-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${notification.iconColor}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {notification.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {notification.timeAgo}
                        </p>

                        <button
                          onClick={() =>
                            handleViewComplaint(
                              notification.reportId,
                              notification.id
                            )
                          }
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <FiEye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-slate-200 px-5 py-3">
          <a
            href="/citizen/notifications"
            className="block text-center text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
