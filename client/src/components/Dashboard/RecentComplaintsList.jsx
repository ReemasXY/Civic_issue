import { FiMapPin } from "react-icons/fi";

export default function RecentComplaintsList({
  complaints,
  allComplaints,
  getStatusStyles,
  onViewDetails,
  title = "My Complaints"
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-teal-50 bg-white p-6 shadow-[0_6px_24px_rgba(15,118,110,0.07)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <a
          href="#"
          className="flex-shrink-0 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
        >
          View All
        </a>
      </div>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="flex min-w-0 gap-5 rounded-xl border border-teal-50 bg-white p-5 shadow-[0_4px_16px_rgba(15,118,110,0.06)] transition-all duration-200 hover:border-teal-100 hover:shadow-[0_8px_22px_rgba(15,118,110,0.11)]"
          >
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
            />

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
              <h3 className="truncate font-semibold text-slate-900">
                {complaint.title}
              </h3>

              <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                <FiMapPin className="h-3.5 w-3.5 flex-shrink-0 text-teal-600" />
                <span className="truncate">{complaint.location}</span>
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
              <button
                onClick={() => {
                  const fullComplaint = allComplaints.find(
                    (c) => c.report_id === complaint.id
                  );
                  if (fullComplaint) {
                    onViewDetails(fullComplaint);
                  }
                }}
                className="cursor-pointer whitespace-nowrap rounded-lg border border-teal-100 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow-[0_3px_10px_rgba(15,118,110,0.06)] transition-all duration-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white hover:shadow-[0_6px_16px_rgba(15,118,110,0.18)]"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
