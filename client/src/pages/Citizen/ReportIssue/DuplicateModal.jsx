import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiMapPin,
  FiUsers,
  FiBookmark,
} from "react-icons/fi";

const STATUS_LABELS = {
  pending: "Pending",
  verified: "Verified",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

const STATUS_STYLES = {
  pending: "bg-yellow-500 text-white",
  verified: "bg-blue-500 text-white",
  "in-progress": "bg-orange-500 text-white",
  resolved: "bg-green-500 text-white",
};

/**
 * Shown when complaints of the same category already exist close to the
 * location the citizen picked.
 *
 * Props:
 *  - isOpen          show / hide the popup
 *  - duplicates      nearby complaints returned by /check-duplicates
 *  - followingId     report_id currently being followed (disables buttons)
 *  - error           error message to show, if following failed
 *  - followedReport  set after a successful follow, switches to the success view
 *  - onFollow        (duplicate) => void  "Same issue, follow it"
 *  - onContinue      () => void           "Different issue, continue"
 *  - onCancel        () => void           close and go back to the form
 *  - onFollowedDone  () => void           close the success view
 */
export default function DuplicateModal({
  isOpen,
  duplicates = [],
  followingId = null,
  error = "",
  followedReport = null,
  onFollow,
  onContinue,
  onCancel,
  onFollowedDone,
}) {
  if (!isOpen) return null;

  const busy = followingId !== null;

  // ---------------------------------------------------------
  // SUCCESS VIEW (after following)
  // ---------------------------------------------------------

  if (followedReport) {
    return (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]" />

        <div className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.20)]">
          <div className="h-[3px] w-full bg-emerald-500" />

          <div className="px-7 pb-7 pt-8 text-center">
            <div className="mx-auto mb-5 flex h-[62px] w-[62px] items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
              <FiCheckCircle size={30} />
            </div>

            <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-slate-800">
              You're following this complaint
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No new report was created. We'll notify you about every update
              on{" "}
              <span className="font-medium text-slate-700">
                "{followedReport.title}"
              </span>
              .
            </p>

            <button
              type="button"
              onClick={onFollowedDone}
              className="mt-6 w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
            >
              Go to My Complaints
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 py-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
        onClick={busy ? undefined : onCancel}
      />

      {/* Card */}
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.20)]">
        <div className="h-[3px] w-full shrink-0 bg-amber-500" />

        {/* Header */}
        <div className="shrink-0 px-6 pb-3 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
              <FiAlertCircle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                A similar issue was already reported
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {duplicates.length === 1
                  ? "This complaint is very close to the location you picked."
                  : "These complaints are very close to the location you picked."}{" "}
                If it's the same problem, follow it instead of creating a
                duplicate.
              </p>
            </div>
          </div>
        </div>

        {/* Matches */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-3">
          {duplicates.map((duplicate) => {
            const isFollowingThis = followingId === duplicate.report_id;

            return (
              <div
                key={duplicate.report_id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <div className="flex gap-3">
                  <img
                    src={`${duplicate.image_url}`}
                    alt={duplicate.title}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {duplicate.title}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {duplicate.location_short_label ||
                          "Location not specified"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_STYLES[duplicate.status] ||
                          "bg-gray-500 text-white"
                        }`}
                      >
                        {STATUS_LABELS[duplicate.status] || duplicate.status}
                      </span>

                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        about {duplicate.distance_m} m away
                      </span>

                      {duplicate.supporter_count > 0 && (
                        <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          <FiUsers className="h-3 w-3" />
                          {duplicate.supporter_count + 1} citizens
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action for this match */}
                <div className="mt-3">
                  {duplicate.is_own ? (
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600">
                      You already reported this issue
                    </p>
                  ) : duplicate.is_following ? (
                    <p className="flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-center text-xs font-medium text-teal-700">
                      <FiBookmark className="h-3.5 w-3.5" />
                      You're already following this
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onFollow && onFollow(duplicate)}
                      disabled={busy}
                      className="w-full cursor-pointer rounded-lg border border-teal-300 bg-white px-3 py-2 text-sm font-semibold text-teal-700 transition-all hover:border-teal-500 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isFollowingThis
                        ? "Following..."
                        : "Same issue, follow it"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={busy}
              className="cursor-pointer rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Different issue, continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}