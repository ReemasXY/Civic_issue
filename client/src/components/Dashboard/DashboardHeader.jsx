import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FiBell } from "react-icons/fi";
import ProfileDropdown from "../ProfileDropdown";
import axios from "axios";

export default function DashboardHeader({ username, showNotifications = true, userRole = "citizen" }) {
  // Extract first name only (split by space and take first part)
  const firstName = username.split(' ')[0];
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch the real unread count once — only when the bell is actually
  // shown, since this endpoint is citizen-only (officers get a 403).
  useEffect(() => {
    if (!showNotifications) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          "/api/notifications",
          { withCredentials: true }
        );

        if (response.data.success) {
          const count = response.data.notifications.filter(
            (n) => !n.is_read
          ).length;

          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching unread notification count:", error);
      }
    };

    fetchUnreadCount();
  }, [showNotifications]);

  // Live updates: bump the badge the instant an officer's status change
  // creates a new notification — same socket the Notifications page
  // listens on, so the badge and the full list never disagree.
  useEffect(() => {
    if (!showNotifications) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/socket`
    );

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "notification") {
          setUnreadCount((prev) => prev + 1);
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
  }, [showNotifications]);

  return (
    <header className="mb-8 w-full flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {firstName}
        </h1>

        <p className="text-sm text-slate-500">
          Here's what's happening in your community.
        </p>
      </div>

      {/* Desktop Actions - Hidden on mobile */}
      <div className="hidden lg:flex flex-shrink-0 items-center gap-3">
        {/* Notification Bell - Citizens only */}
        {showNotifications && (
          <button
            onClick={() => navigate(`/${userRole}/notifications`)}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-teal-100 bg-white text-slate-600 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:text-teal-600 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)]"
          >
            <FiBell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Profile Dropdown */}
        <ProfileDropdown userRole={userRole} isMobile={false} />
      </div>
    </header>
  );
}