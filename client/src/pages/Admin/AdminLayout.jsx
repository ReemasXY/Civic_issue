import { useState,useEffect } from "react";
import { Outlet } from "react-router";
import { FiGrid, FiFileText, FiUsers, FiHome as FiBuilding } from "react-icons/fi";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
// Same shell as CitizenLayout / OfficerLayout: shared <Sidebar />,
// same mobile header, same page background.
export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/admin/overview", icon: FiGrid, label: "Overview" },
    { path: "/admin/complaints", icon: FiFileText, label: "All complaints" },
    { path: "/admin/officers", icon: FiUsers, label: "Officers" },
    { path: "/admin/departments", icon: FiBuilding, label: "Departments" },
  ];

    useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status } = error.response;

          // Redirect to login on 401 (unauthorized) or 403 (forbidden - deactivated account)
          if ((status === 401 || status === 403) && !window.location.pathname.includes("/login")) {
            console.log("Authentication failed, redirecting to login...");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F9FB]">
      {/* Sidebar - Responsive (shared with citizen & officer) */}
      <Sidebar
        navItems={navItems}
        userRole="admin"
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