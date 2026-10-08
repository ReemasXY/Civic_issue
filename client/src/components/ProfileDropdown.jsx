import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import successToast from "../utils/SuccessToast";

export default function ProfileDropdown({ userRole = "citizen", isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "/api/auth/logout",
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

      // Clear stored user info
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfileClick = () => {
    navigate(`/${userRole}/profile`);
    setIsOpen(false);
  };

  if (isMobile) {
    // Mobile version - simple avatar that opens dropdown
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-sm font-semibold text-white"
        >
          {username.charAt(0).toUpperCase()}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
            {/* User info */}
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900 truncate">{username}</p>
              <p className="text-xs text-slate-500 capitalize">{userRole}</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {userRole === "officer" && (
                <button
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <FiUser className="h-4 w-4 text-slate-400" />
                  <span>Profile</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - full profile card with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-3 rounded-full border border-teal-100 bg-white py-2 pl-2 pr-3 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)] sm:pr-4"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-sm font-semibold text-white">
          {username.charAt(0).toUpperCase()}
        </div>

        <span className="hidden text-sm font-medium text-slate-900 sm:block truncate max-w-[120px]">
          {username}
        </span>

        <FiChevronDown
          className={`h-4 w-4 text-teal-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* User info */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900 truncate">{username}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            {userRole === "officer" && (
              <button
                onClick={handleProfileClick}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FiUser className="h-4 w-4 text-slate-400" />
                <span>Profile</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
