import { useNavigate, useLocation } from "react-router";
import { FiUser, FiLogOut } from "react-icons/fi";
import axios from "axios";
import successToast from "../utils/SuccessToast";

export default function Sidebar({
  navItems,
  userRole = "citizen",
  isOpen = false,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOfficer = userRole === "officer";

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      if (response.data.message) {
        if (Array.isArray(response.data.message)) {
          response.data.message.forEach((msg) => successToast(msg));
        } else {
          successToast(response.data.message);
        }
      }

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] flex-col border-r border-slate-200 bg-[#F7F9FC] lg:flex">

        {/* Logo - UNCHANGED */}
        <div className="flex items-center gap-3 px-7 py-7">
          <div className="-space-x-1.5 flex items-center">
            <span className="h-4 w-4 rounded-full bg-[#14233B]" />
            <span className="h-4 w-4 rounded-full bg-teal-600" />
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            Civic<span className="text-teal-600">Care</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col px-5 pt-4">

          {/* Main Menu */}
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              // item.badge > 0 always evaluates to a real boolean, even
              // when item.badge is 0 or undefined — avoids the JSX
              // pitfall where `0 && (...)` renders a literal "0" instead
              // of nothing.
              const hasBadge = item.badge > 0;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-teal-100 text-teal-700 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                  }`}
                >
                  <Icon
                    className={`h-[19px] w-[19px] flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-teal-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />

                  <span className="flex-1 text-left">{item.label}</span>

                  {hasBadge && (
                    <div className="flex items-center gap-2 rounded-full bg-teal-50 px-2.5 py-1">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      <span className="text-xs font-semibold text-teal-700">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto border-t border-slate-200 pt-5 pb-6">
            <div className="flex flex-col gap-1">

              {/* Profile - officers only */}
              {isOfficer && (
                <button
                  onClick={() => navigate(`/${userRole}/profile`)}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                >
                  <FiUser className="h-[19px] w-[19px] text-slate-400 transition-colors group-hover:text-slate-700" />
                  <span>Profile</span>
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <FiLogOut className="h-[19px] w-[19px] text-slate-400 transition-colors group-hover:text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        >
          <div
            className="fixed left-0 top-[57px] flex h-[calc(100vh-57px)] w-[260px] flex-col border-r border-slate-200 bg-[#F7F9FC] shadow-[8px_0_30px_rgba(15,23,42,0.10)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo - UNCHANGED */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-7 py-7">
              <div className="-space-x-1.5 flex items-center">
                <span className="h-4 w-4 rounded-full bg-[#14233B]" />
                <span className="h-4 w-4 rounded-full bg-teal-600" />
              </div>

              <span className="text-xl font-bold tracking-tight text-slate-900">
                Civic<span className="text-teal-600">Care</span>
              </span>
            </div>

            <div className="flex flex-1 flex-col px-5 pt-5">

              {/* Main Menu */}
              <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Main Menu
              </p>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  // Same fix as the desktop block above: a direct
                  // comparison always yields a boolean, so a badge of 0
                  // never leaks through as a rendered "0".
                  const hasBadge = item.badge > 0;

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-teal-100 text-teal-700 shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                      }`}
                    >
                      <Icon
                        className={`h-[19px] w-[19px] flex-shrink-0 ${
                          isActive
                            ? "text-teal-600"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />

                      <span className="flex-1 text-left">{item.label}</span>

                      {hasBadge && (
                        <div className="flex items-center gap-2 rounded-full bg-teal-50 px-2.5 py-1">
                          <span className="h-2 w-2 rounded-full bg-teal-500" />
                          <span className="text-xs font-semibold text-teal-700">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-auto border-t border-slate-200 pb-6 pt-5">
                <div className="flex flex-col gap-1">

                  {/* Profile - officers only */}
                  {isOfficer && (
                    <button
                      onClick={() => {
                        navigate(`/${userRole}/profile`);
                        onClose();
                      }}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    >
                      <FiUser className="h-[19px] w-[19px] text-slate-400 group-hover:text-slate-700" />
                      <span>Profile</span>
                    </button>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <FiLogOut className="h-[19px] w-[19px] text-slate-400 group-hover:text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}