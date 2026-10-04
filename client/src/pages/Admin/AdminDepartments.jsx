import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import Toast from "../../utils/Toast";
import errToast from "../../utils/ErrorToast";

const TEAL = "#0D9488";
const AXIS_TEXT = "#64748B";
const GRID = "#F1F5F9";

const CARD_CLASS =
  "rounded-2xl border border-teal-50 bg-white shadow-[0_5px_20px_rgba(15,118,110,0.07)]";

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  fontSize: 12,
  color: "#0F172A",
};

const STATUS_SERIES = [
  { key: "pending", label: "Pending", color: "#EAB308" },
  { key: "verified", label: "Verified", color: "#0D9488" },
  { key: "inProgress", label: "In Progress", color: "#F97316" },
  { key: "resolved", label: "Resolved", color: "#22C55E" },
  { key: "rejected", label: "Rejected", color: "#DC3545" },
];

const SEVERITY_SERIES = [
  { key: "critical", label: "Critical", color: "#EF4444" },
  { key: "high", label: "High", color: "#F97316" },
  { key: "medium", label: "Medium", color: "#EAB308" },
  { key: "low", label: "Low", color: "#22C55E" },
];

const shortName = (name) => name.replace(" Department", "");

const showApiError = (error, fallback) => {
  const data = error.response?.data?.error;
  const messages = Array.isArray(data) ? data : [data || fallback];

  messages.forEach((message) => errToast(message));
};

/* ---------------------------------------------------------------- */
/* Small pieces                                                     */
/* ---------------------------------------------------------------- */

function StatCard({ label, value, accent }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p
        className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function BarValueLabel({ x, y, width, index, data, suffix = "" }) {
  const item = data[index];

  const text =
    item && item.value !== null && item.value !== undefined
      ? `${item.value}${suffix}`
      : "No data";

  return (
    <text
      x={x + width / 2}
      y={y - 7}
      textAnchor="middle"
      fontSize={12}
      fontWeight={500}
      fill="#0F172A"
    >
      {text}
    </text>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className={`${CARD_CLASS} p-5`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      <p className="mb-4 text-xs text-slate-500">{subtitle}</p>

      <div className="h-[235px]">{children}</div>
    </div>
  );
}

function SmallBarChart({ data, max, suffix }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 28,
          right: 12,
          left: 4,
          bottom: 8,
        }}
      >
        <CartesianGrid stroke={GRID} vertical={false} />

        <XAxis
          dataKey="name"
          tick={{
            fill: AXIS_TEXT,
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />

        <YAxis
          tick={{
            fill: AXIS_TEXT,
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
          width={32}
          domain={[0, max]}
          allowDecimals={false}
        />

        <Tooltip
          cursor={{ fill: "#F8FAFC" }}
          contentStyle={tooltipStyle}
          formatter={(value) => [`${value}${suffix}`, ""]}
        />

        <Bar
          dataKey="value"
          fill={TEAL}
          radius={[5, 5, 0, 0]}
          barSize={36}
        >
          <LabelList
            dataKey="value"
            content={<BarValueLabel data={data} suffix={suffix} />}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------------------------------------------------------- */
/* Departments Page                                                 */
/* ---------------------------------------------------------------- */

export default function AdminDepartments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("status");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/departments",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        showApiError(error, "Could not load departments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans text-slate-500">
        Loading departments...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans text-slate-500">
        <Toast />
        Could not load departments.
      </div>
    );
  }

  const { summary, departments } = data;

  const series = mode === "status" ? STATUS_SERIES : SEVERITY_SERIES;

  const stackedData = departments.map((d) => ({
    label: `${shortName(d.name)} (${d.total})`,
    ...(mode === "status" ? d.byStatus : d.bySeverity),
  }));

  const rateData = departments.map((d) => ({
    name: shortName(d.name),
    value: d.resolvedRate,
  }));

  const daysData = departments.map((d) => ({
    name: shortName(d.name),
    value: d.avgDays,
  }));

  const maxDays = Math.max(1, ...daysData.map((d) => d.value || 0));

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 font-sans sm:p-6 lg:p-8 lg:px-10">
      <Toast />

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Departments
        </h1>

        <p className="text-sm text-slate-600">
          How each department is handling its complaints, side by side.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Complaints"
          value={summary.totalComplaints}
        />

        <StatCard
          label="Resolved"
          value={`${summary.resolvedRate}%`}
          accent={TEAL}
        />

        <StatCard
          label="Active officers"
          value={summary.activeOfficers}
        />
      </div>

      {/* Complaints by department */}
      <div className={`${CARD_CLASS} mb-5 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Complaints by department
          </h3>

          <div className="flex gap-2">
            {[
              {
                value: "status",
                label: "By status",
              },
              {
                value: "severity",
                label: "By severity",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  mode === option.value
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mb-3 mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
          {series.map((item) => (
            <span
              key={item.key}
              className="flex items-center gap-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  background: item.color,
                }}
              />

              {item.label}
            </span>
          ))}
        </div>

        <div className="h-[245px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stackedData}
              layout="vertical"
              margin={{
                top: 8,
                right: 18,
                left: 0,
                bottom: 8,
              }}
            >
              <CartesianGrid
                stroke={GRID}
                horizontal={false}
              />

              <XAxis
                type="number"
                tick={{
                  fill: AXIS_TEXT,
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <YAxis
                type="category"
                dataKey="label"
                width={170}
                tick={{
                  fill: "#334155",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "#F8FAFC",
                }}
                contentStyle={tooltipStyle}
              />

              {series.map((item) => (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  stackId="complaints"
                  fill={item.color}
                  barSize={30}
                >
                  <LabelList
                    dataKey={item.key}
                    position="center"
                    fill="#FFFFFF"
                    fontSize={11}
                    fontWeight={500}
                    formatter={(value) =>
                      value > 0 ? value : ""
                    }
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison charts */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ChartCard
          title="Resolved rate"
          subtitle="% of complaints resolved"
        >
          <SmallBarChart
            data={rateData}
            max={100}
            suffix="%"
          />
        </ChartCard>

        <ChartCard
          title="Time to resolve"
          subtitle="Average days, lower is better"
        >
          <SmallBarChart
            data={daysData}
            max={Math.ceil(maxDays * 1.3)}
            suffix=""
          />
        </ChartCard>
      </div>
    </div>
  );
}