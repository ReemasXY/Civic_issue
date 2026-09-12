import { FiClock } from "react-icons/fi";

export default function StatusTimeline({ complaint, getStatusConfig }) {
  const buildTimeline = () => {
    const defaultTimeline = [
      {
        status: "submitted",
        date: complaint.created_at,
        completed: true,
      },
      {
        status: "verified",
        date: complaint.verified_at || null,
        completed: [
          "verified",
          "assigned",
          "in-progress",
          "resolved",
          "closed",
        ].includes(complaint.status),
      },
      {
        status: "assigned",
        date: complaint.assigned_at || null,
        completed: [
          "assigned",
          "in-progress",
          "resolved",
          "closed",
        ].includes(complaint.status),
      },
      {
        status: "in-progress",
        date: complaint.in_progress_at || null,
        completed: [
          "in-progress",
          "resolved",
          "closed",
        ].includes(complaint.status),
      },
      {
        status: "resolved",
        date: complaint.resolved_at || null,
        completed: [
          "resolved",
          "closed",
        ].includes(complaint.status),
      },
    ];

    return defaultTimeline;
  };

  const timeline = buildTimeline();

  return (
    <div className="min-w-0">
      <div className="rounded-xl border border-[#e1e9f3] bg-white p-5 shadow-[0_4px_18px_rgba(25,55,95,0.05)] sm:p-6">
        {/* Timeline Header */}
        <div className="mb-6 flex items-center gap-3 border-b border-[#e8eef5] pb-4">
          <h2 className="text-[18px] font-bold text-[#14233b]">
            Status Timeline
          </h2>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {timeline.map((item, index) => {
            const config = getStatusConfig(item.status);
            const Icon = config.icon;
            const isLast = index === timeline.length - 1;
            const isPending = !item.completed;

            return (
              <div key={item.status} className="relative flex gap-4">
                {/* Timeline Connector */}
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-[31px] h-[calc(100%-8px)] w-[2px] ${
                      isPending ? "bg-[#e3e9f1]" : "bg-[#35b77d]"
                    }`}
                  />
                )}

                {/* Timeline Icon */}
                <div
                  className={`relative z-10 flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                    isPending ? "bg-[#e2e7ee]" : config.bgColor
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isPending ? "text-slate-400" : "text-white"
                    }`}
                  />
                </div>

                {/* Timeline Content */}
                <div
                  className={`min-w-0 flex-1 ${!isLast ? "pb-7" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-semibold ${
                          isPending ? "text-slate-400" : "text-[#14233b]"
                        }`}
                      >
                        {config.label}
                      </h3>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          isPending ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {config.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
