import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiPlus,
  FiX,
  FiEye,
  FiEyeOff,
  FiStar,
  FiUserX,
  FiAlertCircle,
} from "react-icons/fi";
import Toast from "../../utils/Toast";
import successToast from "../../utils/SuccessToast";
import errToast from "../../utils/ErrorToast";

// Must match the values the server assigns to reports.assigned_department
const DEPARTMENTS = [
  "Public Works Department",
  "Water Supply Department",
  "Environment Management Department",
];

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100";

const MODAL_INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100";

const ROW_GRID =
  "grid grid-cols-[minmax(0,2.3fr)_minmax(0,1.9fr)_60px_80px_70px_100px] items-center gap-3";

const getInitials = (name) =>
  String(name)
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Show every error from the server as its own toast
const showApiError = (error, fallback) => {
  const data = error.response?.data?.error;
  const messages = Array.isArray(data) ? data : [data || fallback];
  messages.forEach((message) => errToast(message));
};

/* ---------------------------------------------------------------- */
/* Deactivate officer confirmation dialog                            */
/* ---------------------------------------------------------------- */

function DeactivateConfirmModal({ officer, onClose, onConfirm }) {
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDeactivate = async () => {
    if (deactivating) return;

    setDeactivating(true);

    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setDeactivating(false);
    }
  };

  const hasOpenCases = officer.openCases > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-100">
            <FiUserX size={20} className="text-red-600" />
          </div>

          <div className="flex-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Deactivate officer account
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Deactivate{" "}
              <span className="font-medium text-slate-900">
                {officer.username}
              </span>
              ?
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          {hasOpenCases && (
            <div className="flex gap-2 rounded-lg border border-amber-100 p-3">
              <FiAlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div className="text-sm">
                <p className="font-medium text-amber-900">
                  This officer has {officer.openCases} open case
                  {officer.openCases !== 1 ? "s" : ""}
                </p>

                <p className="mt-1 text-amber-800">
                  All open cases will be reset to pending status and affected
                  citizens will be notified.
                </p>
              </div>
            </div>
          )}

          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>The officer will no longer be able to log in</li>
            <li>
              Their historical resolved cases and reviews will be preserved
            </li>
            <li>
              You can view them in the officers list (marked as inactive)
            </li>
          </ul>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deactivating ? "Deactivating..." : "Deactivate account"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Add officer dialog                                                */
/* ---------------------------------------------------------------- */

function AddOfficerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    department: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    const messages = [];
    const username = form.username.trim();

    if (username.length < 8 || username.length > 50) {
      messages.push("Username must be between 8 and 50 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      messages.push("Please enter a valid email");
    }

    if (!/^(?:\+977[- ]?)?(?:98|97)\d{8}$/.test(form.phone_number.trim())) {
      messages.push("Please enter a valid Nepal phone number");
    }

    if (!form.department) {
      messages.push("Please choose a valid department");
    }

    if (form.password.length < 8) {
      messages.push("Password must be at least 8 characters long");
    }

    messages.forEach((message) => errToast(message));

    return messages.length === 0;
  };

  const handleSubmit = async () => {
    if (saving || !validate()) return;

    setSaving(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/officers",
        {
          username: form.username.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim(),
          department: form.department,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      successToast(`Officer ${response.data.officer.username} added`);

      onCreated(response.data.officer);
      onClose();
    } catch (error) {
      showApiError(error, "Could not add the officer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Add officer
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Create an account for a municipal officer.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="e.g. ramesh_shrestha"
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              className={MODAL_INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Email
            </label>

            <input
              id="email"
              type="text"
              placeholder="name@kmc.gov.np"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className={MODAL_INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Phone number
            </label>

            <input
              id="phone"
              type="text"
              placeholder="9841000000"
              value={form.phone_number}
              onChange={(e) => setField("phone_number", e.target.value)}
              className={MODAL_INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Department
            </label>

            <select
              id="department"
              value={form.department}
              onChange={(e) => setField("department", e.target.value)}
              className={MODAL_INPUT_CLASS}
            >
              <option value="">Select a department</option>

              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Temporary password
            </label>

            <div className="flex gap-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className={`${MODAL_INPUT_CLASS} flex-1`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="rounded-lg border border-slate-200 px-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                {showPassword ? (
                  <FiEyeOff size={15} />
                ) : (
                  <FiEye size={15} />
                )}
              </button>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              Share this with the officer securely. It is stored hashed.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create officer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Officers page                                                     */
/* ---------------------------------------------------------------- */

export default function AdminOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all, "active", "inactive"
  const [showModal, setShowModal] = useState(false);
  const [freshId, setFreshId] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/officers",
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setOfficers(response.data.officers);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      setLoadFailed(true);
      showApiError(error, "Could not load officers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    if (!freshId) return;

    const timer = setTimeout(() => setFreshId(null), 3500);

    return () => clearTimeout(timer);
  }, [freshId]);

  const handleCreated = async (officer) => {
    setSearch("");
    setDeptFilter("");
    setStatusFilter("");
    setFreshId(officer.userId);

    await fetchOfficers();
  };

  const handleDeactivate = async (officer) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/officers/${officer.userId}/deactivate`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        successToast(response.data.message);
        await fetchOfficers();
      }
    } catch (error) {
      showApiError(error, "Could not deactivate officer.");
      throw error;
    }
  };

  const handleActivate = async (officer) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/admin/officers/${officer.userId}/activate`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        successToast(response.data.message);
        await fetchOfficers();
      }
    } catch (error) {
      showApiError(error, "Could not activate officer.");
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return officers.filter((officer) => {
      // Department filter
      if (deptFilter && officer.department !== deptFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !officer.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && officer.isActive) {
        return false;
      }

      // Search filter
      if (!term) {
        return true;
      }

      return (
        officer.username.toLowerCase().includes(term) ||
        officer.email.toLowerCase().includes(term) ||
        String(officer.phoneNumber).includes(term)
      );
    });
  }, [officers, search, deptFilter, statusFilter]);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 font-sans text-slate-900 sm:p-6 lg:p-8 lg:px-10">
      <Toast />

      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Officers
            </h1>

            <p className="text-sm text-slate-500">
              Workload and performance of every officer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            <FiPlus size={16} />
            Add officer
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mb-3 mt-6 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            placeholder="Search by username, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} flex-1`}
          />

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className={`${INPUT_CLASS} sm:w-64`}
          >
            <option value="">All departments</option>

            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${INPUT_CLASS} sm:w-40`}
          >
            <option value="">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        {/* Officers Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,118,110,0.07)]">
          <div className="overflow-x-auto">
            <div className="min-w-[740px]">
              {/* Table Header */}
              <div
                className={`${ROW_GRID} border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500`}
              >
                <span>Officer</span>
                <span>Department</span>
                <span className="text-right">Open</span>
                <span className="text-right">Resolved</span>
                <span className="text-right">Rating</span>
                <span className="text-right">Actions</span>
              </div>

              {loading ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  Loading officers...
                </div>
              ) : loadFailed ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  Could not load officers.
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  {officers.length === 0
                    ? "No officers yet. Add the first one."
                    : "No officers match your filters."}
                </div>
              ) : (
                filtered.map((officer) => (
                  <div
                    key={officer.userId}
                    className={`${ROW_GRID} border-t border-slate-100 px-4 py-3 text-[13px] transition-colors duration-300 hover:bg-slate-50 ${
                      !officer.isActive ? "opacity-50" : ""
                    }`}
                  >
                    {/* Officer */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-teal-200 text-xs font-semibold text-teal-700">
                        {getInitials(officer.username)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {officer.username}

                          {!officer.isActive && (
                            <span className="ml-2 text-xs text-slate-500">
                              (Inactive)
                            </span>
                          )}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {officer.email} · {officer.phoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Department
                        No background color here */}
                    <span className="truncate text-sm text-slate-700">
                      {officer.department === "none"
                        ? "Unassigned"
                        : officer.department}
                    </span>

                    {/* Open Cases */}
                    <span className="text-right font-medium text-slate-900">
                      {officer.openCases}
                    </span>

                    {/* Resolved Cases */}
                    <span className="text-right text-slate-700">
                      {officer.resolvedCases}
                    </span>

                    {/* Rating */}
                    <span className="flex items-center justify-end gap-1 text-slate-700">
                      {officer.rating == null ? (
                        "—"
                      ) : (
                        <>
                          <FiStar
                            size={13}
                            className="text-amber-500"
                          />
                          {officer.rating.toFixed(1)}
                        </>
                      )}
                    </span>

                    {/* Actions */}
                    <div className="flex justify-end">
                      {officer.isActive ? (
                        <button
                          type="button"
                          onClick={() => setDeactivateTarget(officer)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivate(officer)}
                          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      
      </div>

      {/* Add Officer Modal */}
      {showModal && (
        <AddOfficerModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Deactivate Modal */}
      {deactivateTarget && (
        <DeactivateConfirmModal
          officer={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => handleDeactivate(deactivateTarget)}
        />
      )}
    </div>
  );
}