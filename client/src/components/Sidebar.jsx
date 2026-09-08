import { useNavigate, useLocation } from "react-router";
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

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto border-t border-slate-200 pt-5 pb-6">
            <div className="flex flex-col gap-1">

              {/* Profile */}
              <button
                onClick={() => navigate(`/${userRole}/profile`)}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
              >
                <svg
                  className="h-[19px] w-[19px] text-slate-400 transition-colors group-hover:text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>

                <span>Profile</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <svg
                  className="h-[19px] w-[19px] text-slate-400 transition-colors group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>

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

                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-auto border-t border-slate-200 pb-6 pt-5">
                <div className="flex flex-col gap-1">

                  {/* Profile */}
                  <button
                    onClick={() => {
                      navigate(`/${userRole}/profile`);
                      onClose();
                    }}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                  >
                    <svg
                      className="h-[19px] w-[19px] text-slate-400 group-hover:text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>

                    <span>Profile</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      className="h-[19px] w-[19px] text-slate-400 group-hover:text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>

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