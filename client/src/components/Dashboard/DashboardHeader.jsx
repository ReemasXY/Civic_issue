import { useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";

export default function DashboardHeader({ username, showNotifications = true }) {
  // Extract first name only (split by space and take first part)
  const firstName = username.split(' ')[0];

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch the real unread count once — only when the bell is actually
  // shown, since this endpoint is citizen-only (officers get a 403).
  useEffect(() => {
    if (!showNotifications) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/notifications",
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

    const ws = new WebSocket("ws://localhost:5000");

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

      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
        {showNotifications && (
          <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-teal-100 bg-white text-slate-600 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:text-teal-600 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)]">
            <FiBell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="flex cursor-pointer items-center gap-3 rounded-full border border-teal-100 bg-white py-2 pl-2 pr-3 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)] sm:pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-sm font-semibold text-white">
            {username.charAt(0).toUpperCase()}
          </div>

          <span className="hidden text-sm font-medium text-slate-900 sm:block">
            {username}
          </span>

          <svg
            className="h-4 w-4 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}