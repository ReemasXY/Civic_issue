import { FiTag, FiAlertCircle, FiMapPin, FiFileText } from "react-icons/fi";

export default function ComplaintInformation({ complaint, onMapClick, severityConfig }) {
  return (
    <div className="min-w-0 lg:h-full">
      {/* Complaint Information */}
      <div className="flex h-full flex-col rounded-xl border border-[#e1e9f3] bg-white p-5 shadow-[0_4px_18px_rgba(25,55,95,0.05)] sm:p-6">
        {/* Section Header */}
        <div className="mb-5 flex items-center gap-3 border-b border-[#e8eef5] pb-4">
          <h2 className="text-[18px] font-bold text-[#14233b]">
            Complaint Information
          </h2>
        </div>

        {/* Information Grid */}
        <div className="space-y-8">
          {/* Severity and Category - Side by Side */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <FiTag className="h-3.5 w-3.5" />
                Category
              </div>

              <p className="text-sm font-semibold text-[#14233b]">
                {complaint.category}
              </p>
            </div>

            {/* Severity */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <FiAlertCircle className="h-3.5 w-3.5" />
                Severity
              </div>

              <div className="flex justify-end">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityConfig.bgColor} ${severityConfig.textColor}`}
                >
                  {complaint.severity_level
                    ? complaint.severity_level.charAt(0).toUpperCase() +
                      complaint.severity_level.slice(1)
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Location - Limited Width */}
          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                <FiMapPin className="h-3.5 w-3.5" />
                Location
              </div>

              {complaint.latitude && complaint.longitude && (
                <button
                  onClick={onMapClick}
                  className="flex-shrink-0 text-xs text-[#1554c0] transition-colors hover:text-[#0d3d85] hover:underline"
                >
                  View on map
                </button>
              )}
            </div>

            <p className="max-w-sm text-justify text-sm font-medium leading-relaxed text-[#14233b]">
              {complaint.location_full_label ||
                complaint.location_short_label ||
                "Location not specified"}
            </p>
          </div>

          {/* Description - Full Width */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <FiFileText className="h-3.5 w-3.5" />
              Description
            </div>

            <p className="text-justify text-sm leading-6 text-slate-600">
              {complaint.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* UPLOADED IMAGE */}
        <div className="mt-7 border-t border-[#e8eef5] pt-6">
          <div className="rounded-lg border border-[#e2eaf4] bg-white p-3">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#14233b]">
                Uploaded Image
              </h3>
            </div>

            <img
              src={`http://localhost:5000${complaint.image_url}`}
              alt={complaint.title}
              className="h-[300px] w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
