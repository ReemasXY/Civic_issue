import { useState, useEffect } from "react";
import { FiRefreshCw, FiLock } from "react-icons/fi";
import ConfirmActionModal from "./ConfirmActionModal";

const STATUS_LABELS = {
  pending: "Pending Verification",
  verified: "Verified",
  "in-progress": "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

// Which statuses a report is allowed to move to, from its current status.
// Mirrors STATUS_TRANSITIONS in server/controllers/officerControllers.js —
// keep both in sync if the workflow ever changes.
const STATUS_TRANSITIONS = {
  pending: ["verified", "rejected"],
  verified: ["in-progress", "resolved"],
  "in-progress": ["resolved"],
  resolved: [],
  rejected: [],
};

const getLabel = (value) => STATUS_LABELS[value] || value;

export default function UpdateStatusCard({ currentStatus, onSave, isUpdating }) {
  const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];
  const isTerminal = allowedNextStatuses.length === 0;

  const [selectedStatus, setSelectedStatus] = useState(
    allowedNextStatuses[0] || currentStatus
  );
  const [showConfirm, setShowConfirm] = useState(false);

  // Update selectedStatus when currentStatus or allowedNextStatuses changes
  useEffect(() => {
    setSelectedStatus(allowedNextStatuses[0] || currentStatus);
  }, [currentStatus, allowedNextStatuses]);

  const handleSaveClick = () => {
    if (selectedStatus === currentStatus || isUpdating || isTerminal) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSave(selectedStatus);
    setShowConfirm(false);
  };

  // resolved/rejected are terminal — no further status changes allowed.
  if (isTerminal) {
    return (
      <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-[0_4px_18px_rgba(220,53,69,0.06)]">
        <h2 className="flex items-center gap-2 text-base font-semibold text-red-900">
          <FiLock className="h-5 w-5 text-red-600" />
          Status Locked
        </h2>
        <p className="mt-2 text-sm text-red-700">
          This report is already &quot;{getLabel(currentStatus)}&quot; and
          cannot be updated further.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-[#e2eaf4] bg-white p-5 shadow-[0_4px_18px_rgba(25,55,95,0.06)]">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <FiRefreshCw className="h-5 w-5 text-teal-600" />
        Update Status
      </h2>
      <p className="mb-4 mt-1 text-sm text-slate-500">
        Change the current status of this report.
      </p>

      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        disabled={isUpdating}
        className="mb-4 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* Only statuses that are a valid next step from the current
            status are shown — matches the backend's transition rules. */}
        {allowedNextStatuses.map((value) => (
          <option key={value} value={value}>
            {getLabel(value)}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={selectedStatus === currentStatus || isUpdating}
        onClick={handleSaveClick}
        className="w-full cursor-pointer rounded-lg bg-[#14233B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F8A70] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save Status
      </button>

      <ConfirmActionModal
        isOpen={showConfirm}
        title="Update status?"
        message={`Change this report's status from "${getLabel(currentStatus)}" to "${getLabel(selectedStatus)}"? The citizen will see this update.`}
        confirmLabel="Yes, Update"
        confirmClassName="bg-[#14233B] hover:bg-[#1F8A70]"
        isLoading={isUpdating}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}