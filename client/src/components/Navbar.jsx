import React, { useEffect, useState } from "react";
import { FiSun, FiUser, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { PiShieldCheckDuotone } from "react-icons/pi";
import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navLinks = [
    "Home",
    "About",
    "How It Works",
    "Departments",
    "Contact",
  ];

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/getuser",
          {
            withCredentials: true,
          }
        );

        if (response.data.user) {
          console.log(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLinkClick = (label) => {
    setActiveLink(label);
    setIsOpen(false);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      setIsLoggedIn(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed z-[100] w-full border-b border-slate-200 bg-white">
      <nav className="mx-auto max-w-[1150px] px-6">

        {/* Main Navbar */}
        <div className="flex h-[73px] items-center justify-between">

          {/* Logo */}
          <a
            href="#"
            onClick={() => handleLinkClick("Home")}
            className="flex items-center gap-2"
          >
            <PiShieldCheckDuotone className="h-8 w-8 text-slate-800" />

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Civic<span className="text-teal-600">Care</span>
            </span>
          </a>

          {/* Navigation Links */}
          <ul
            className={`
              absolute left-0 top-[73px] z-[100] w-full
              border-t border-slate-200 bg-white
              flex flex-col gap-1 px-6 py-4

              min-[865px]:static
              min-[865px]:w-auto
              min-[865px]:flex-row
              min-[865px]:items-center
              min-[865px]:gap-8
              min-[865px]:border-0
              min-[865px]:p-0

              transition-all duration-300 ease-in-out

              ${
                isOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }

              min-[865px]:visible
              min-[865px]:translate-y-0
              min-[865px]:opacity-100
            `}
          >
            {navLinks.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(label);
                  }}
                  className={`
                    relative block rounded-lg px-3 py-2
                    text-[15px] font-medium
                    transition-colors duration-200

                    min-[865px]:rounded-none
                    min-[865px]:px-0
                    min-[865px]:py-1

                    ${
                      activeLink === label
                        ? "bg-slate-100 text-slate-900 min-[865px]:bg-transparent min-[865px]:text-teal-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 min-[865px]:hover:bg-transparent min-[865px]:hover:text-teal-600"
                    }
                  `}
                >
                  {label}

                  {/* Active underline */}
                  <span
                    className={`
                      absolute left-0 -bottom-[17px]
                      hidden min-[865px]:block
                      h-[2px] w-full
                      bg-teal-600
                      transition-transform duration-300 ease-out

                      ${
                        activeLink === label
                          ? "scale-x-100"
                          : "scale-x-0"
                      }
                    `}
                  />
                </a>
              </li>
            ))}

            {/* Mobile Actions */}
            <li className="mt-2 border-t border-slate-200 pt-4 min-[865px]:hidden">
              <div className="flex items-center gap-3">

                {/* Theme Button */}
                <button
                  type="button"
                  aria-label="Toggle theme"
                  className="
                    flex h-9 w-9 cursor-pointer items-center justify-center
                    rounded-full border border-slate-200
                    text-slate-600
                    transition-colors duration-200
                    hover:bg-slate-100
                  "
                >
                  <FiSun className="h-4 w-4" />
                </button>

                {/* Authentication */}
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex flex-1 cursor-pointer items-center justify-center gap-2
                      rounded-lg bg-slate-900 px-4 py-2
                      text-sm font-semibold text-white
                      transition-colors duration-200
                      hover:bg-slate-800
                    "
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    className="
                      flex flex-1 cursor-pointer items-center justify-center gap-2
                      rounded-lg bg-slate-900 px-4 py-2
                      text-sm font-semibold text-white
                      transition-colors duration-200
                      hover:bg-slate-800
                    "
                  >
                    <FiUser className="h-4 w-4" />
                    Login / Register
                  </button>
                )}
              </div>
            </li>
          </ul>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 min-[865px]:flex">

            {/* Theme Button */}
            <button
              type="button"
              aria-label="Toggle theme"
              className="
                flex h-9 w-9 cursor-pointer items-center justify-center
                rounded-full border border-slate-200
                text-slate-600
                transition-colors duration-200
                hover:bg-slate-100
              "
            >
              <FiSun className="h-4 w-4" />
            </button>

            {/* Authentication */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex cursor-pointer items-center gap-2
                  rounded-lg bg-slate-900 px-4 py-2
                  text-sm font-semibold text-white
                  transition-colors duration-200
                  hover:bg-slate-800
                "
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="
                  flex cursor-pointer items-center gap-2
                  rounded-lg bg-slate-900 px-4 py-2
                  text-sm font-semibold text-white
                  transition-colors duration-200
                  hover:bg-slate-800
                "
              >
                <FiUser className="h-4 w-4" />
                Login / Register
              </button>
            )}
          </div>

          {/* Hamburger Button */}
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="
              relative flex h-9 w-9 cursor-pointer
              items-center justify-center rounded-lg
              text-slate-700 transition-colors
              duration-200 hover:bg-slate-100
              min-[865px]:hidden
            "
          >
            <FiMenu
              className={`
                absolute h-6 w-6
                transition-all duration-300 ease-in-out

                ${
                  isOpen
                    ? "rotate-90 opacity-0"
                    : "rotate-0 opacity-100"
                }
              `}
            />

            <FiX
              className={`
                absolute h-6 w-6
                transition-all duration-300 ease-in-out

                ${
                  isOpen
                    ? "rotate-0 opacity-100"
                    : "-rotate-90 opacity-0"
                }
              `}
            />
          </button>

        </div>
      </nav>
    </header>
  );
}