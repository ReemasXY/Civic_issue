import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiMapPin,
  FiCalendar,
  FiPackage,
} from "react-icons/fi";

export default function ComplaintCard({ complaint, onViewDetails }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      verified: "Verified",
      "in-progress": "In Progress",
      resolved: "Resolved",
    };
    return labels[status] || status;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-orange-500 text-white";
      case "verified":
        return "bg-blue-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "in-progress":
        return <FiRefreshCw className="h-4 w-4" />;
      case "verified":
        return <FiCheckCircle className="h-4 w-4" />;
      case "resolved":
        return <FiCheckCircle className="h-4 w-4" />;
      case "pending":
        return <FiClock className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity) => {
    const level = severity?.toLowerCase();
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryIcon = () => {
    return <FiPackage className="h-4 w-4" />;
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-4 p-5">
        {/* Image */}
        <img
          src={`http://localhost:5000${complaint.image_url}`}
          alt={complaint.title}
          className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
        />

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="mb-2 font-semibold text-slate-900 line-clamp-1">
            {complaint.title}
          </h3>

          {/* Category */}
          <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
            {getCategoryIcon()}
            <span className="truncate">{complaint.category}</span>
          </div>

          {/* Location */}
          <div className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
            <FiMapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {complaint.location_short_label ||
                complaint.location_full_label ||
                "Location not specified"}
            </span>
          </div>

          {/* Status and Severity */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                complaint.status
              )}`}
            >
              {getStatusIcon(complaint.status)}
              {getStatusLabel(complaint.status)}
            </span>

            {complaint.severity_level && (
              <span
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${getSeverityStyles(
                  complaint.severity_level
                )}`}
              >
                <FiAlertTriangle className="h-3.5 w-3.5" />
                {complaint.severity_level}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FiCalendar className="h-3.5 w-3.5" />
          <span>Submitted: {formatDate(complaint.created_at)}</span>
        </div>

        <button
          onClick={() => onViewDetails && onViewDetails(complaint)}
          className="cursor-pointer rounded-lg border border-teal-200 bg-white px-5 py-2.5 text-sm font-medium text-teal-600 transition-all hover:border-teal-600 hover:bg-teal-600 hover:text-white"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
