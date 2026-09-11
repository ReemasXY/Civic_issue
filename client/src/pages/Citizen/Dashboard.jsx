import {
  FiFileText,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiBell,
  FiMapPin,
} from "react-icons/fi";

export default function Dashboard() {
  const 
  username = localStorage.getItem("username") || "User";

  // Mock data - replace with actual API calls
const stats = [
  {
    label: "Total Complaints",
    value: "12",
    icon: FiFileText,
    iconColor: "text-teal-600",
  },
  {
    label: "Pending",
    value: "3",
    icon: FiClock,
    iconColor: "text-teal-600",
  },
  {
    label: "In Progress",
    value: "4",
    icon: FiRefreshCw,
    iconColor: "text-teal-600",
  },
  {
    label: "Resolved",
    value: "5",
    icon: FiCheckCircle,
    iconColor: "text-teal-600",
  },
];

  const recentComplaints = [
    {
      id: 1,
      title: "Large Pothole on Main Road",
      location: "Baneswor, Kathmandu",
      status: "in-progress",
      statusLabel: "In Progress",
      date: "Aug 18, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Overflowing Garbage Bin",
      location: "Maitighar, Kathmandu",
      status: "verified",
      statusLabel: "Verified",
      date: "Aug 17, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Broken Street Light",
      location: "New Baneswor, Kathmandu",
      status: "resolved",
      statusLabel: "Resolved",
      date: "Aug 16, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&h=400&fit=crop",
    },
  ];

  const getStatusStyles = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-purple-50 text-purple-600";
      case "verified":
        return "bg-orange-50 text-orange-600";
      case "resolved":
        return "bg-green-50 text-green-600";
      default:
        return "bg-blue-50 text-blue-600";
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8 flex min-w-0 flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome, {username} 
          </h1>

          <p className="text-sm text-slate-500">
            Here's what's happening in your community.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-teal-100 bg-white text-slate-600 shadow-[0_4px_15px_rgba(15,118,110,0.08)] transition-all duration-200 hover:border-teal-300 hover:text-teal-600 hover:shadow-[0_6px_20px_rgba(15,118,110,0.14)]">
            <FiBell className="h-5 w-5" />

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
              4
            </span>
          </button>

          {/* User Menu */}
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

      {/* Stats Grid */}
      <div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="flex min-w-0 items-center gap-4 rounded-2xl border border-teal-50 bg-white p-5 shadow-[0_5px_20px_rgba(15,118,110,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-[0_10px_25px_rgba(15,118,110,0.12)]"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${stat.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>

              <div className="min-w-0">
                <h3 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {stat.value}
                </h3>

                <p className="truncate text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
    {/* Content Grid */}
<div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">

  {/* My Complaints */}
  <section className="min-w-0 rounded-2xl border border-teal-50 bg-white p-6 shadow-[0_6px_24px_rgba(15,118,110,0.07)]">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-slate-900">
        My Complaints
      </h2>

      <a
        href="#"
        className="flex-shrink-0 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
      >
        View All →
      </a>
    </div>

    <div className="space-y-4">
      {recentComplaints.map((complaint) => (
        <div
          key={complaint.id}
          className="flex min-w-0 gap-4 rounded-xl border border-teal-50 bg-white p-4 shadow-[0_4px_16px_rgba(15,118,110,0.06)] transition-all duration-200 hover:border-teal-100 hover:shadow-[0_8px_22px_rgba(15,118,110,0.11)]"
        >
          <img
            src={complaint.imageUrl}
            alt={complaint.title}
            className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
          />

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <h3 className="truncate font-semibold text-slate-900">
              {complaint.title}
            </h3>

            <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <FiMapPin className="h-3.5 w-3.5 flex-shrink-0 text-teal-600" />
              <span className="truncate">
                {complaint.location}
              </span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                  complaint.status
                )}`}
              >
                {complaint.statusLabel}
              </span>

              <span className="truncate text-xs text-slate-400">
                Reported on {complaint.date}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center">
            <button className="whitespace-nowrap rounded-lg border border-teal-100 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-[0_3px_10px_rgba(15,118,110,0.06)] transition-all duration-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-[0_6px_16px_rgba(15,118,110,0.18)]">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>

  {/* Complaint Completion */}
  <section className="min-w-0 rounded-2xl border border-teal-50 bg-white p-6 shadow-[0_6px_24px_rgba(15,118,110,0.07)]">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">
        Complaint Completion
      </h2>

      <button className="rounded-lg p-1.5 transition-colors hover:bg-teal-50">
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
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>
    </div>

    {/* Donut Chart */}
    <div className="relative mx-auto mb-6 w-full max-w-[230px]">
      <svg viewBox="0 0 200 200" className="h-auto w-full">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#F0FDFA"
          strokeWidth="24"
        />

        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#34D399"
          strokeWidth="24"
          strokeDasharray="251.2 251.2"
          strokeDashoffset="62.8"
          transform="rotate(-90 100 100)"
          strokeLinecap="round"
        />

        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="24"
          strokeDasharray="100.48 401.92"
          strokeDashoffset="-188.4"
          transform="rotate(-90 100 100)"
          strokeLinecap="round"
        />

        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="24"
          strokeDasharray="50.24 451.68"
          strokeDashoffset="-288.88"
          transform="rotate(-90 100 100)"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="mb-1 text-xs text-slate-400">
          Total
          <br />
          Summary
        </div>

        <div className="text-3xl font-bold text-slate-900">
          12
        </div>
      </div>
    </div>

    {/* Legend */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="text-sm text-slate-600">
            Completed
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-900">
          5
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="text-sm text-slate-600">
            Pending
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-900">
          4
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          <span className="text-sm text-slate-600">
            Overdue
          </span>
        </div>

        <span className="text-sm font-semibold text-slate-900">
          3
        </span>
      </div>
    </div>
  </section>
</div>
    </div>
  );
}