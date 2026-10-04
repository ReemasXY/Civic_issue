import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Light palette matching the citizen / officer dashboards
const TRACK_BG = "#F1F5F9";
const TEAL = "#0D9488";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const BLUE = "#3B82F6";
const AXIS_TEXT = "#64748B";

const CARD_CLASS =
  "rounded-2xl border border-teal-50 bg-white shadow-[0_5px_20px_rgba(15,118,110,0.07)]";

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  fontSize: 12,
  color: "#0F172A",
};

const formatShortDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

/**
 * Custom X-axis tick that wraps long labels onto multiple lines.
 */
function WrappedTick({ x, y, payload }) {
  const MAX_CHARS = 14;
  const words = String(payload.value).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > MAX_CHARS && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill={AXIS_TEXT} fontSize={11}>
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 12 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      className={`${CARD_CLASS} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-[0_10px_25px_rgba(15,118,110,0.12)]`}
    >
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function BarRow({ label, count, max, color }) {
  const widthPct = max > 0 ? (count / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-16 shrink-0 truncate text-[13px] text-slate-500">
        {label}
      </span>

      <div
        className="h-2 flex-1 overflow-hidden rounded"
        style={{ background: TRACK_BG }}
      >
        <div
          className="h-full rounded"
          style={{
            width: `${widthPct}%`,
            background: color,
          }}
        />
      </div>

      <span className="w-6 shrink-0 text-right text-[13px] font-medium text-slate-900">
        {count}
      </span>
    </div>
  );
}

/**
 * One hotspot row.
 */
function HotspotRow({
  rank,
  area,
  total,
  open,
  max,
}) {
  const widthPct = max > 0 ? (total / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          rank === 1
            ? "bg-teal-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="truncate text-sm font-medium text-slate-900"
            title={area}
          >
            {area}
          </span>

          <span className="shrink-0 text-[11px] text-slate-500">
            {open} open
          </span>
        </div>

        <div
          className="mt-1.5 h-2 overflow-hidden rounded"
          style={{ background: TRACK_BG }}
        >
          <div
            className="h-full rounded"
            style={{
              width: `${widthPct}%`,
              background: rank === 1 ? RED : TEAL,
            }}
          />
        </div>
      </div>

      <span className="w-8 shrink-0 text-right text-sm font-bold text-slate-900">
        {total}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/overview",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching admin overview:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Loading overview...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Could not load the overview.
      </div>
    );
  }

  const {
    stats,
    dailyTrend = [],
    hotspots = [],
    byCategory = [],
    byDepartment = [],
    severity = [],
    resolutionTrend = [],
  } = data;

  const maxCategory = Math.max(
    1,
    ...byCategory.map((c) => c.count)
  );

  const maxSeverity = Math.max(
    1,
    ...severity.map((s) => s.count)
  );

  const maxHotspot = Math.max(
    1,
    ...hotspots.map((h) => h.total)
  );

  const resolutionChartData = resolutionTrend.map(
    (d) => ({
      ...d,
      label: formatShortDate(d.week),
    })
  );

  // 30-day totals and backlog change
  const newTotal = dailyTrend.reduce(
    (sum, d) => sum + d.newReports,
    0
  );

  const resolvedTotal = dailyTrend.reduce(
    (sum, d) => sum + d.resolved,
    0
  );

  const backlogChange =
    newTotal - resolvedTotal;

  const hasTrendActivity =
    newTotal > 0 || resolvedTotal > 0;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 lg:p-8 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Overview
        </h1>

        <p className="text-sm text-slate-500">
          City-wide status of all complaints and officers.
        </p>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div className="mb-4 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">

          <StatCard
            label="Total"
            value={stats.total}
          />

          <StatCard
            label="Pending"
            value={stats.unclaimed}
            accent={AMBER}
          />

          <StatCard
            label="In Progress"
            value={stats.inProgress}
          />

          <StatCard
            label="Resolved"
            value={stats.resolved}
            accent={TEAL}
          />

          {/* NEW REJECTED CARD */}
          <StatCard
            label="Rejected"
            value={stats.rejected}
            accent={RED}
          />

        </div>

        {/* =====================================================
            ROW 1: NEW VS RESOLVED + HOTSPOTS
        ====================================================== */}

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">

          {/* New vs Resolved */}
          <div className={`${CARD_CLASS} p-5`}>

            <div className="mb-3.5 flex items-baseline justify-between">
              <p className="text-base font-semibold text-slate-900">
                New vs resolved complaints
              </p>

              <span className="text-[11px] text-slate-500">
                Last 30 days
              </span>
            </div>

            {!hasTrendActivity ? (
              <p className="text-[13px] text-slate-500">
                No complaint activity in the last 30 days.
              </p>
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={200}
                >
                  <LineChart
                    data={dailyTrend}
                    margin={{
                      top: 8,
                      right: 12,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="day"
                      tickFormatter={formatShortDate}
                      interval={4}
                      tick={{
                        fill: AXIS_TEXT,
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tick={{
                        fill: AXIS_TEXT,
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{
                        color: "#0F172A",
                      }}
                      labelFormatter={formatShortDate}
                    />

                    <Line
                      type="monotone"
                      dataKey="newReports"
                      name="New reports"
                      stroke={AMBER}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="resolved"
                      name="Resolved"
                      stroke={TEAL}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-2.5 flex gap-4 text-[13px] text-slate-500">
                  <span>
                    <span
                      className="mr-1.5 inline-block h-2.5 w-2.5 rounded"
                      style={{ background: AMBER }}
                    />
                    New reports
                  </span>

                  <span>
                    <span
                      className="mr-1.5 inline-block h-2.5 w-2.5 rounded"
                      style={{ background: TEAL }}
                    />
                    Resolved
                  </span>
                </div>

                <p className="mt-2 text-[13px] text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {newTotal}
                  </span>{" "}
                  new,{" "}
                  <span className="font-semibold text-slate-900">
                    {resolvedTotal}
                  </span>{" "}
                  resolved.{" "}

                 
                </p>
              </>
            )}
          </div>

          {/* Hotspots */}
          <div className={`${CARD_CLASS} p-5`}>

            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-base font-semibold text-slate-900">
                Hotspot areas
              </p>

              <span className="text-[11px] text-slate-500">
                Last 30 days
              </span>
            </div>

            {hotspots.length === 0 ? (
              <p className="text-[13px] text-slate-500">
                No complaints with a location in the last 30 days.
              </p>
            ) : (
              <div className="flex flex-col gap-5.5">
                {hotspots.map((h, i) => (
                  <HotspotRow
                    key={h.area}
                    rank={i + 1}
                    area={h.area}
                    total={h.total}
                    open={h.open}
                    max={maxHotspot}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            ROW 2: DEPARTMENTS + CATEGORY
        ====================================================== */}

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">

          {/* Departments */}
          <div className={`${CARD_CLASS} p-5`}>

            <p className="mb-3.5 text-base font-semibold text-slate-900">
              Departments compared
            </p>

            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <BarChart
                data={byDepartment}
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <XAxis
                  dataKey="department"
                  interval={0}
                  height={58}
                  tick={<WrappedTick />}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{
                    color: "#0F172A",
                  }}
                  cursor={{
                    fill: "#F1F5F9",
                  }}
                />

                <Bar
                  dataKey="resolved"
                  fill={TEAL}
                  radius={[3, 3, 0, 0]}
                  name="Resolved"
                />

                <Bar
                  dataKey="total"
                  fill={AMBER}
                  radius={[3, 3, 0, 0]}
                  name="Total"
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-2.5 flex gap-4 text-[13px] text-slate-500">

              <span>
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 rounded"
                  style={{ background: TEAL }}
                />
                Resolved
              </span>

              <span>
                <span
                  className="mr-1.5 inline-block h-2.5 w-2.5 rounded"
                  style={{ background: AMBER }}
                />
                Total
              </span>

            </div>
          </div>

          {/* Category */}
          <div className={`${CARD_CLASS} p-5`}>

            <p className="mb-3.5 text-base font-semibold text-slate-900">
              By category
            </p>

            <div className="flex flex-col gap-4.5">

              {byCategory.length === 0 ? (
                <p className="text-[13px] text-slate-500">
                  No data yet.
                </p>
              ) : (
                byCategory.map((c) => (
                  <BarRow
                    key={c.category}
                    label={c.category}
                    count={c.count}
                    max={maxCategory}
                    color={TEAL}
                  />
                ))
              )}

            </div>
          </div>
        </div>

        {/* =====================================================
            ROW 3: RESOLUTION TREND + SEVERITY
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Resolution Trend */}
          <div className={`${CARD_CLASS} p-5`}>

            <p className="mb-3.5 text-base font-semibold text-slate-900">
              Average resolution time trend
            </p>

            {resolutionChartData.length === 0 ? (
              <p className="text-[13px] text-slate-500">
                Not enough resolved complaints yet.
              </p>
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={90}
                >
                  <LineChart data={resolutionChartData}>
                    <XAxis
                      dataKey="label"
                      hide
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelStyle={{
                        color: "#0F172A",
                      }}
                      formatter={(value) => [
                        `${value} days`,
                        "Avg",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="avgDays"
                      stroke={BLUE}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <p className="mt-2 text-[13px] text-slate-500">
                  Currently averaging{" "}
                  <span className="font-semibold text-slate-900">
                    {
                      resolutionChartData[
                        resolutionChartData.length - 1
                      ]?.avgDays ?? 0
                    }{" "}
                    days
                  </span>{" "}
                  to resolve
                </p>
              </>
            )}
          </div>

          {/* Severity */}
          <div className={`${CARD_CLASS} p-5`}>

            <p className="mb-3.5 text-base font-semibold text-slate-900">
              Severity breakdown
            </p>

            <div className="flex flex-col gap-2.5">

              {severity.map((s) => (
                <BarRow
                  key={s.level}
                  label={s.level}
                  count={s.count}
                  max={maxSeverity}
                  color={
                    s.level === "High" ||
                    s.level === "Critical"
                      ? RED
                      : s.level === "Medium"
                      ? AMBER
                      : TEAL
                  }
                />
              ))}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}