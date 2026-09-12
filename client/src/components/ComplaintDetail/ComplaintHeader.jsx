import { FiArrowLeft, FiMapPin, FiCalendar } from "react-icons/fi";
import { formatDateTime } from "./utils/dateFormat";

export default function ComplaintHeader({ complaint, onBack, statusConfig }) {
  return (
    <>
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to My Complaints
      </button>

      {/* COMPLAINT HEADER */}
      <div className="mb-6 overflow-hidden rounded-xl border border-[#e2eaf4] bg-white shadow-[0_4px_18px_rgba(25,55,95,0.06)]">
        <div className="flex flex-col gap-5 bg-gradient-to-r from-[#ffffff] to-[#f2f7ff] p-5 sm:p-6 md:flex-row md:items-center">
          {/* Complaint Image */}
          <div className="w-full flex-shrink-0 md:w-[220px]">
            <img
              src={`http://localhost:5000${complaint.image_url}`}
              alt={complaint.title}
              className="h-[150px] w-full rounded-lg object-cover shadow-sm md:h-[130px]"
            />
          </div>

          {/* Header Information */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-[22px] font-bold tracking-[-0.4px] text-[#14233b] sm:text-[25px]">
                {complaint.title}
              </h1>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                {statusConfig.label}
              </span>
            </div>

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
              {/* Location */}
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-[#1554c0]" />
                <span>
                  {complaint.location_short_label ||
                    complaint.location_full_label ||
                    "Location not specified"}
                </span>
              </div>

              <div className="hidden h-4 w-px bg-slate-300 sm:block" />

              {/* Date */}
              <div className="flex items-center gap-2">
                <FiCalendar className="h-4 w-4 text-[#1554c0]" />
                <span>{formatDateTime(complaint.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
