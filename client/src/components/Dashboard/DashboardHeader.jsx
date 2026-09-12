import { FiBell } from "react-icons/fi";

export default function DashboardHeader({ username }) {
  // Extract first name only (split by space and take first part)
  const firstName = username.split(' ')[0];

  return (
    <header className="mb-8 flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {firstName}
        </h1>

        <p className="text-sm text-slate-500">
          Here's what's happening in your community.
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
        <button className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-teal-100 bg-white text-slate-600 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:text-teal-600 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)]">
          <FiBell className="h-5 w-5" />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
            4
          </span>
        </button>

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
