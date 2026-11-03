import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  FiSearch,
  FiMapPin,
  FiUsers,
  FiX,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import BlurText from "../../utils/Blurtext";
import ScrollReveal from "../../utils/ScrollReveal";
import SplitImage from "../../utils/SplitImage";
import issuesImage from "/reportIssues.png";
import FilterDropdown from "../../components/ComplaintsFilter/FilterDropdown";

const PAGE_SIZE = 9;

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Road Damage", label: "Road Damage" },
  { value: "Garbage / Waste", label: "Garbage / Waste" },
  { value: "Streetlight Damage", label: "Streetlight Damage" },
  { value: "Drainage", label: "Drainage" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

// Same colours as the Recent Complaints cards on the home page
const STATUS_STYLES = {
  resolved: "bg-green-100 text-green-700",
  verified: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  pending: "bg-gray-100 text-gray-700",
};

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");
};

const formatTimeAgo = (dateString) => {
  const diffMs = new Date() - new Date(dateString);
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return `${days} ${days === 1 ? "day" : "days"} ago`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ---------------------------------------------------------------- */
/* Issue card (same look as the Recent Complaints cards)             */
/* ---------------------------------------------------------------- */

function IssueCard({ issue, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(issue)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(issue)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-200"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`${issue.image_url}`}
          alt={issue.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute right-3 top-3 rounded-md px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[issue.status] || STATUS_STYLES.pending
          }`}
        >
          {formatStatus(issue.status)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          title={issue.title}
          className="mb-2 line-clamp-1 text-base font-semibold text-[#14233B]"
        >
          {issue.title}
        </h3>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {issue.category}
          </span>

          {issue.supporter_count > 0 && (
            <span className="flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <FiUsers className="h-3 w-3" />
              Reported by {issue.supporter_count + 1} citizens
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
          <div className="flex min-w-0 items-center gap-1.5">
            <FiMapPin className="h-4 w-4 shrink-0 text-green-600" />
            <span className="truncate">
              {issue.location_short_label || "Location not provided"}
            </span>
          </div>

          <span className="shrink-0">{formatTimeAgo(issue.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Loading placeholder                                               */
/* ---------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="h-48 animate-pulse bg-gray-100" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Details popup (read-only)                                         */
/* ---------------------------------------------------------------- */

function IssueModal({ issue, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    // Stop the page behind the popup from scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(15,23,42,0.25)]"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-56 shrink-0 ">
          <img
            src={`${issue.image_url}`}
            alt={issue.title}
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                STATUS_STYLES[issue.status] || STATUS_STYLES.pending
              }`}
            >
              {formatStatus(issue.status)}
            </span>

            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {issue.category}
            </span>

            {issue.severity_level && (
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  SEVERITY_STYLES[issue.severity_level.toLowerCase()] ||
                  "bg-gray-100 text-gray-700"
                }`}
              >
                {issue.severity_level} severity
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[#14233B]">
            {issue.title}
          </h2>

          <div className="mt-3 space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4 shrink-0 text-green-600" />
              <span>{issue.location_short_label || "Location not provided"}</span>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4 shrink-0" />
              <span>Reported on {formatDate(issue.created_at)}</span>
            </div>

            {issue.supporter_count > 0 && (
              <div className="flex items-center gap-2 text-teal-700">
                <FiUsers className="h-4 w-4 shrink-0" />
                <span>
                  Reported by {issue.supporter_count + 1} citizens
                </span>
              </div>
            )}
          </div>

          {issue.description && (
            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
              {issue.description}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* View Issues page                                                  */
/* ---------------------------------------------------------------- */

export default function ViewIssues() {
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);

  const gridRef = useRef(null);
  const filtersRef = useRef(null);

  // Always open the page from the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Wait until the visitor stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const fetchIssues = async () => {
      setLoading(true);
      setError("");

      try {
        const params = { page, limit: PAGE_SIZE };

        if (debouncedSearch) params.search = debouncedSearch;
        if (category !== "all") params.category = category;
        if (status !== "all") params.status = status;

        const response = await axios.get("/api/reports/public", { params });

        if (cancelled) return;

        if (response.data.success) {
          setIssues(response.data.complaints);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Error fetching issues:", err);
        setError("Could not load the issues. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchIssues();

    // Ignore the answer if the filters changed before it arrived
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, category, status]);

  // Go back if the visitor came from another page of the site.
  // If /issues was opened directly, go to the home page instead.
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const openIssue = useCallback((issue) => setSelected(issue), []);
  const closeIssue = useCallback(() => setSelected(null), []);

  // After changing the page, scroll so the search bar and the filters
  // stay visible just below the fixed navbar (73px) with the new cards under them.
  const goToPage = (nextPage) => {
    setPage(nextPage);

    const target = filtersRef.current || gridRef.current;

    const top = target
      ? target.getBoundingClientRect().top + window.scrollY - 95
      : 0;

    window.scrollTo({ top, behavior: "smooth" });
  };

  // The cards are built once per result list. This keeps the scroll
  // animation from replaying when you type or open a popup.
  const cards = useMemo(
    () =>
      issues.map((issue, index) => (
        <ScrollReveal
          key={issue.report_id}
          as="element"
          baseOpacity={0.05}
          enableBlur
          baseRotation={1.5}
          blurStrength={7}
          delay={(index % 3) * 0.15}
        >
          <IssueCard issue={issue} onOpen={openIssue} />
        </ScrollReveal>
      )),
    [issues, openIssue]
  );

  return (
    <main className="min-h-screen bg-white">
      {/* ================= HEADER =================
          Fills the whole screen with the heading and image centred in it,
          so the filters below stay out of sight until the visitor scrolls. */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-white pt-[73px]">
        {/* ---------- BACK BUTTON (pinned to the top of the section) ---------- */}
        <div className="absolute inset-x-0 top-[73px] z-[60]">
          <div className="mx-auto max-w-[1150px] px-5 pt-6 sm:px-8 lg:px-8">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              Back
            </button>
          </div>
        </div>

        {/* ---------- HEADING + IMAGE (centred) ---------- */}
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1150px]
            grid-cols-1
            items-center
            gap-8
            px-5
            pb-12
            pt-24
            sm:px-8
            lg:grid-cols-[48fr_52fr]
            lg:gap-4
            lg:px-8
            lg:py-12
            bg-white
          "
        >
          {/* ---------- LEFT SIDE ---------- */}
          <div className="relative z-50 bg-white">
            {/* Heading */}
            <h1
              className="
                max-w-[650px]
                text-[42px]
                font-bold
                leading-[1.15]
                tracking-[-1.5px]
                text-slate-900
                sm:text-[48px]
              "
            >
              <BlurText
                text="Every reported issue"
                delay={200}
                animateBy="words"
                direction="top"
                className=" md:whitespace-nowrap mb-1"
              />
              <BlurText
                text="tracked in public."
                delay={200}
                animateBy="words"
                direction="top"
                className="text-teal-600"
              />
            </h1>

            {/* Description */}
            <p
              className="
                mt-5
                max-w-[500px]
                text-[16px]
                font-normal
                leading-[1.7]
                text-slate-600
              "
            >
              Browse the problems citizens have reported, see which ones are
              being fixed, and follow their progress.
            </p>
          </div>

          {/* ---------- RIGHT SIDE ---------- */}
          <div className="relative w-full">
            <SplitImage
              src={issuesImage}
              alt="A citizen reporting a damaged road from their phone"
              className="relative z-10 w-full object-contain"
              delay={300}
              duration={2}
              ease="power3.out"
              from={{
                opacity: 0,
                y: 40,
              }}
              to={{
                opacity: 1,
                y: 0,
              }}
              threshold={0.1}
              rootMargin="-100px"
            />
          </div>
        </div>
      </section>

      {/* ================= FILTERS + RESULTS ================= */}
      <section className="mx-auto max-w-[1150px] px-5 pb-12 pt-6 sm:px-8 lg:px-8">
        {/* ================= FILTERS (appear on scroll) ================= */}
        <motion.div
          ref={filtersRef}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category or area"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <FilterDropdown
            label="Category"
            value={category}
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={CATEGORY_OPTIONS}
          />

          <FilterDropdown
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </motion.div>

        {/* ================= RESULTS ================= */}
        <div ref={gridRef}>
          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-600">
              {error}
            </div>
          ) : loading && issues.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-700">
                No issues match your search
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try a different word, category or status.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-6 transition-opacity duration-200 md:grid-cols-2 lg:grid-cols-3 ${
                loading ? "opacity-60" : ""
              }`}
            >
              {cards}
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {!error && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-600">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              aria-label="Previous page"
              className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pagination.totalPages || loading}
              aria-label="Next page"
              className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* ================= DETAILS POPUP ================= */}
      <AnimatePresence>
        {selected && (
          <IssueModal
            key={selected.report_id}
            issue={selected}
            onClose={closeIssue}
          />
        )}
      </AnimatePresence>
    </main>
  );
}