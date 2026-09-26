import { useState } from "react";
import {
  FiShield,
  FiXCircle,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import ConfirmActionModal from "./ConfirmActionModal";

export default function ReviewActions({
  onVerify,
  onReject,
  isUpdating,
}) {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const handleRejectClick = () => {
    if (!showReasonInput) {
      setShowReasonInput(true);
      return;
    }

    if (reason.trim().length === 0 || isUpdating) return;

    setPendingAction("reject");
  };

  const handleConfirm = () => {
    if (pendingAction === "verify") {
      onVerify();
    } else if (pendingAction === "reject") {
      onReject(reason.trim());
    }

    setPendingAction(null);
  };

  return (
    <div className="mb-6 h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <FiShield className="h-5 w-5 text-teal-600" />
          Review & Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review the submitted report and take the appropriate action.
        </p>
      </div>

      <div className="space-y-4">
        {/* VERIFY REPORT */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => setPendingAction("verify")}
          className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-teal-200 bg-teal-50/40 p-5 text-left transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-4">
            {/* VERIFY ICON */}
            <FiShield className="h-6 w-6 flex-shrink-0 text-teal-600" />

            <div>
              <p className="font-semibold text-slate-800">
                Verify Report
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Confirm that the issue is valid and matches the selected
                category.
              </p>
            </div>
          </div>

          <FiChevronRight className="h-5 w-5 flex-shrink-0 text-teal-500 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* REJECT REPORT */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => {
              if (showReasonInput) {
                setShowReasonInput(false);
              } else {
                setShowReasonInput(true);
              }
            }}
            className="group flex w-full cursor-pointer items-center justify-between rounded-xl p-5 text-left transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              {/* REJECT ICON */}
              <FiXCircle className="h-6 w-6 flex-shrink-0 text-red-500" />

              <div>
                <p className="font-semibold text-slate-800">
                  Reject Report
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Reject the report if it is invalid or not a civic issue.
                </p>
              </div>
            </div>

            <FiChevronRight
              className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                showReasonInput
                  ? "rotate-90 text-red-500"
                  : "group-hover:translate-x-1"
              }`}
            />
          </button>

          {/* REJECTION REASON */}
          {showReasonInput && (
            <div className="border-t border-slate-200 p-5">
              <div className="mb-3 flex items-start gap-2">
                <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />

                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Rejection Reason
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    Provide a short explanation that will be shown to the
                    citizen.
                  </p>
                </div>
              </div>

              <textarea
                value={reason}
                maxLength={200}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {reason.length}/200
                </span>

                <button
                  type="button"
                  disabled={
                    reason.trim().length === 0 || isUpdating
                  }
                  onClick={handleRejectClick}
                  className="cursor-pointer rounded-lg bg-red-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VERIFY CONFIRMATION */}
      <ConfirmActionModal
        isOpen={pendingAction === "verify"}
        title="Verify this report?"
        message="This confirms that the reported issue is valid and matches the selected category. The report will be marked as Verified."
        confirmLabel="Yes, Verify"
        confirmClassName="bg-teal-600 hover:bg-teal-700"
        isLoading={isUpdating}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />

      {/* REJECT CONFIRMATION */}
      <ConfirmActionModal
        isOpen={pendingAction === "reject"}
        title="Reject this report?"
        message="This will mark the report as rejected and provide the citizen with the rejection reason. This action cannot be undone."
        confirmLabel="Yes, Reject"
        confirmClassName="bg-red-500 hover:bg-red-600"
        isLoading={isUpdating}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}