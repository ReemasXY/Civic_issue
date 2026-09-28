import { FiXCircle, FiAlertTriangle } from "react-icons/fi";

export default function RejectionReason({ rejectionReason }) {
  if (!rejectionReason) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.06)] sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <FiXCircle className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="text-[18px] font-bold text-slate-900">
              Report Rejected
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              This report requires your attention
            </p>
          </div>
        </div>
{/* Alert Banner */}
<div className="mb-4 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/70 p-4">
  <FiAlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />

  <div>
    <h3 className="text-sm font-semibold text-slate-900">
      This report has been rejected
    </h3>

    <p className="mt-1 text-xs leading-relaxed text-slate-600">
      The reviewing officer has determined that this report does not
      meet the criteria for processing.
    </p>
  </div>
</div>

        {/* Rejection Reason */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Reason for Rejection
          </h3>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {rejectionReason}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-700">
            What happens next?
          </h4>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
              <span>This report will not be processed further.</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
              <span>
                You may submit a new report if you believe the rejection was
                incorrect.
              </span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
              <span>
                Contact support if you need clarification about the rejection.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}