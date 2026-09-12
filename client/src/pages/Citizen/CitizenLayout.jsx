import { useState } from "react";
import { Outlet } from "react-router";
import {
  FiHome,
  FiPlusCircle,
  FiFileText,
  FiMapPin,
  FiBell,
} from "react-icons/fi";
import Sidebar from "../../components/Sidebar";

export default function CitizenLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/citizen/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/citizen/report", icon: FiPlusCircle, label: "Report Issue" },
    { path: "/citizen/my-complaints", icon: FiFileText, label: "My Complaints" },
    { path: "/citizen/nearby", icon: FiMapPin, label: "Nearby Complaints" },
    { path: "/citizen/notifications", icon: FiBell, label: "Notifications" },
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
        <Outlet />
      </main>
    </div>
  );
}
