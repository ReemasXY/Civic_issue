import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import {
  FiHome,
  FiPlusCircle,
  FiFileText,
  FiMapPin,
  FiBell,
} from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import axios from "axios";

export default function CitizenLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const location = useLocation();

  // Fetch initial unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        { withCredentials: true }
      );

      if (response.data.success) {
        const unread = response.data.notifications.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🔌 CitizenLayout: WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "notification") {
          // Increment unread count
          setUnreadCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("❌ CitizenLayout: WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Refresh count when navigating to notifications page
  useEffect(() => {
    if (location.pathname === "/citizen/notifications") {
      // Small delay to let the notifications page mark items as read
      setTimeout(fetchUnreadCount, 500);
    }
  }, [location.pathname]);

  // Functions to update unread count from child components
  const decrementUnreadCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  const navItems = [
    { path: "/citizen/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/citizen/report", icon: FiPlusCircle, label: "Report Issue" },
    { path: "/citizen/my-complaints", icon: FiFileText, label: "My Complaints" },
    // { path: "/citizen/nearby", icon: FiMapPin, label: "Nearby Complaints" },
    {
      path: "/citizen/notifications",
      icon: FiBell,
      label: "Notifications",
      badge: unreadCount
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F9FB]">
      {/* Sidebar - Responsive */}
      <Sidebar
        navItems={navItems}
        userRole="citizen"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="-space-x-1 flex items-center">
            <span className="h-4 w-4 rounded-full bg-[#14233B]" />
            <span className="h-4 w-4 rounded-full bg-teal-600" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Civic<span className="text-teal-600">Care</span>
          </span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <main className="w-full pt-[57px] lg:ml-[260px] lg:pt-0">
        <Outlet context={{ decrementUnreadCount, clearUnreadCount }} />
      </main>
    </div>
  );
}
