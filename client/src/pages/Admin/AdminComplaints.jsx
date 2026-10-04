import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Toast from "../../utils/Toast";
import errToast from "../../utils/ErrorToast";

const PAGE_SIZE = 10;

// Must match the values the server assigns to reports.assigned_department
const DEPARTMENTS = [
  "Public Works Department",
  "Water Supply Department",
  "Environment Management Department",
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

// Same solid colors used in ComplaintCard (rejected matches statusConfig)
const STATUS_STYLES = {
  pending: "bg-yellow-500 text-white",
  verified: "bg-blue-500 text-white",
  "in-progress": "bg-orange-500 text-white",
  resolved: "bg-green-500 text-white",
  rejected: "bg-[#DC3545] text-white",
};

const STATUS_LABELS = {
  pending: "Pending",
  verified: "Verified",
  "in-progress": "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_ICONS = {
  pending: FiClock,
  verified: FiCheckCircle,
  "in-progress": FiRefreshCw,
  resolved: FiCheckCircle,
  rejected: FiXCircle,
};

const SEVERITY_STYLES = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
};

const BADGE_CLASS =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100";

// Department gets the widest share after Complaint so its name is fully visible
const ROW_GRID =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1.9fr)_100px_130px_minmax(0,1.1fr)] items-center gap-3";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Show every error from the server as its own toast
const showApiError = (error, fallback) => {
  const data = error.response?.data?.error;
  const messages = Array.isArray(data) ? data : [data || fallback];

  messages.forEach((message) => errToast(message));
};

/* ---------------------------------------------------------------- */
/* Status Badge                                                      */
/* ---------------------------------------------------------------- */

function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || FiClock;

  return (
    <span
      className={`${BADGE_CLASS} ${
        STATUS_STYLES[status] || "bg-gray-500 text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Severity Badge                                                    */
/* ---------------------------------------------------------------- */

function SeverityBadge({ severity }) {
  if (!severity) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span
      className={`${BADGE_CLASS} ${
        SEVERITY_STYLES[severity.toLowerCase()] || "bg-gray-500 text-white"
      }`}
    >
      <FiAlertTriangle className="h-3.5 w-3.5" />
      {severity}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Complaint Details Dialog                                          */
/* ---------------------------------------------------------------- */

function ComplaintModal({ complaint, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const departmentLabel =
    !complaint.department || complaint.department === "none"
      ? "Unassigned"
      : complaint.department;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-tight text-slate-900">
              {complaint.title}
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Report ID {complaint.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Status + Severity */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />

          {complaint.severity && (
            <SeverityBadge severity={complaint.severity} />
          )}
        </div>

        {/* Complaint Image */}
        {complaint.imageUrl && (
          <img
            src={`http://localhost:5000${complaint.imageUrl}`}
            alt={complaint.title}
            className="mb-4 h-28 w-full rounded-xl border border-slate-100 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        {/* Description */}
        <p className="mb-5 line-clamp-4 text-[13px] leading-relaxed text-slate-700">
          {complaint.description}
        </p>

        {/* Complaint Information */}
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-[13px]">
          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Category
            </dt>
            <dd className="text-slate-900">{complaint.category}</dd>
          </div>

          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Department
            </dt>
            <dd className="text-slate-900">{departmentLabel}</dd>
          </div>

          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Location
            </dt>
            <dd className="text-slate-900">
              {complaint.locationShort ||
                complaint.locationFull ||
                "Not specified"}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Reported by
            </dt>
            <dd className="text-slate-900">
              {complaint.citizen || "Unknown"}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Reported on
            </dt>
            <dd className="text-slate-900">
              {formatDate(complaint.createdAt)}
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-[11px] font-medium text-slate-500">
              Handled by
            </dt>
            <dd className="text-slate-900">
              {complaint.officer || "Unclaimed"}
            </dd>
          </div>
        </dl>

        {/* Rejection Reason */}
        {complaint.status === "rejected" && (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50/70 p-3.5">
            <p className="text-[11px] font-semibold text-red-600">
              Rejection reason
            </p>

            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
              {complaint.rejectionReason || "No reason was recorded."}
            </p>
          </div>
        )}

        {/* Resolved Information */}
        {complaint.status === "resolved" && complaint.resolvedAt && (
          <div className="mt-5 rounded-lg border border-green-100 bg-green-50 p-3.5 text-[13px] text-green-700">
            Resolved on {formatDate(complaint.resolvedAt)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* All Complaints Page                                               */
/* ---------------------------------------------------------------- */

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [severity, setSeverity] = useState("");

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Wait until the admin stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const fetchComplaints = async () => {
      setLoading(true);

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (status) params.status = status;
        if (department) params.department = department;
        if (severity) params.severity = severity;

        const response = await axios.get(
          "http://localhost:5000/api/admin/complaints",
          {
            params,
            withCredentials: true,
          }
        );

        if (cancelled) return;

        if (response.data.success) {
          setComplaints(response.data.complaints);
          setPagination(response.data.pagination);
          setLoadFailed(false);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Error fetching complaints:", error);

        setLoadFailed(true);

        showApiError(error, "Could not load complaints.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchComplaints();

    // Ignore the response if filters changed before it arrived
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, department, severity]);

  const changeFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-6 lg:p-8 lg:px-10">
      <Toast />

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          All Complaints
        </h1>
        <p className="text-slate-600">
          Every complaint reported across the city. Click one to see the
          details.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <input
          type="text"
          placeholder="Search title, category or area"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={INPUT_CLASS}
        />

        <select
          aria-label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          className={INPUT_CLASS}
        >
          <option value="">All statuses</option>

          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by department"
          value={department}
          onChange={changeFilter(setDepartment)}
          className={INPUT_CLASS}
        >
          <option value="">All departments</option>

          {DEPARTMENTS.map((departmentName) => (
            <option key={departmentName} value={departmentName}>
              {departmentName}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by severity"
          value={severity}
          onChange={changeFilter(setSeverity)}
          className={INPUT_CLASS}
        >
          <option value="">All severities</option>

          {SEVERITY_OPTIONS.map((severityName) => (
            <option key={severityName} value={severityName}>
              {severityName}
            </option>
          ))}
        </select>
      </div>

      {/* Complaints Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,118,110,0.07)]">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div
              className={`${ROW_GRID} border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500`}
            >
              <span>Complaint</span>
              <span>Department</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Handled by</span>
            </div>

            <div
              className={
                loading && complaints.length > 0
                  ? "opacity-60 transition-opacity"
                  : ""
              }
            >
              {loading && complaints.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  Loading complaints...
                </div>
              ) : loadFailed ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  Could not load complaints.
                </div>
              ) : complaints.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No complaints match your filters.
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(complaint)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelected(complaint)
                    }
                    className={`${ROW_GRID} cursor-pointer border-t border-slate-100 px-4 py-3 text-[13px] transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none`}
                  >
                    {/* Complaint */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {complaint.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {/* {complaint.category} ·{" "} */}
                        {complaint.locationShort || "Location not specified"} ·{" "}
                        {formatDate(complaint.createdAt)}
                      </p>
                    </div>

                    {/* Department (no background color, full name visible) */}
                    <span className="text-sm leading-snug text-slate-700">
                      {!complaint.department || complaint.department === "none"
                        ? "Unassigned"
                        : complaint.department}
                    </span>

                    {/* Severity */}
                    <span>
                      <SeverityBadge severity={complaint.severity} />
                    </span>

                    {/* Status */}
                    <span>
                      <StatusBadge status={complaint.status} />
                    </span>

                    {/* Officer */}
                    <span
                      className={
                        complaint.officer
                          ? "truncate text-slate-900"
                          : "text-slate-400"
                      }
                    >
                      {complaint.officer || "Unclaimed"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {!loadFailed && (
        <div className="mt-3 flex items-center justify-end text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={pagination.page <= 1 || loading}
              aria-label="Previous page"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FiChevronLeft size={16} />
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              aria-label="Next page"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selected && (
        <ComplaintModal
          complaint={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}