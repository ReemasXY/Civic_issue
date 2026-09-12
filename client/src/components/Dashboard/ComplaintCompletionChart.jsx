import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ComplaintCompletionChart({ completionData, totalComplaints, chartColors }) {
  return (
    <section className="min-w-0 rounded-2xl border border-teal-50 bg-white p-6 shadow-[0_6px_24px_rgba(15,118,110,0.07)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Complaint Completion
        </h2>

        <button className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-teal-50">
          <svg
            className="h-4 w-4 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      </div>

      <div className="relative mx-auto mb-6 h-[230px] w-full max-w-[230px]">
        {totalComplaints > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-[180px] w-[180px] rounded-full border-[24px] border-teal-50" />
          </div>
        )}

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="mb-1 text-xs text-slate-400">
            Total
            <br />
            Complaints
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalComplaints}</div>
        </div>
      </div>

      <div className="space-y-3">
        {completionData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartColors[index] }}
              />
              <span className="text-sm text-slate-600">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
