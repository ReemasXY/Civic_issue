import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiStar,
  FiCalendar,
  FiMail,
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatFullDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatShortDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getInitials = (name = "") =>
  name.slice(0, 2).toUpperCase() || "OF";

function StaticStars({ value }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          className="h-4 w-4"
          fill={n <= value ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

export default function OfficerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/officer/profile",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching officer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-500">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-medium text-slate-500">
          Could not load your profile.
        </p>
      </div>
    );
  }

  const { officer, rating, commonFeedback, recentReviews } = profile;

  const displayName = officer.username;

  const maxBreakdown = Math.max(
    1,
    ...Object.values(rating.breakdown)
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:p-8 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Profile
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">
            Your account details and work summary.
          </p>
        </div>

        {/* Officer Profile Card */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold tracking-wide text-white">
              {getInitials(displayName)}
            </div>

            {/* Officer Information */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                {displayName}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-teal-600">
                <FiBriefcase className="h-4 w-4" />
                <span>{officer.department}</span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">

                <span className="flex items-center gap-2">
                  <FiMail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="break-all">
                    {officer.email}
                  </span>
                </span>

                <span className="flex items-center gap-2">
                  <FiPhone className="h-4 w-4 shrink-0 text-slate-400" />
                  {officer.phone_number}
                </span>

                <span className="flex items-center gap-2">
                  <FiCalendar className="h-4 w-4 shrink-0 text-slate-400" />
                  Officer since {formatFullDate(officer.member_since)}
                </span>

              </div>
            </div>

            {/* Rating */}
            <div className="border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <FiStar
                  className="h-5 w-5 text-amber-500"
                  fill="currentColor"
                />

                <span className="text-2xl font-bold text-slate-900">
                  {rating.average}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {rating.total} review
                {rating.total === 1 ? "" : "s"}
              </p>
            </div>

          </div>
        </div>

        {/* Rating Graph/ Breakdown*/}
<section className="mb-7">
  <div className="mb-3 flex items-center justify-between">
    <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
      Rating breakdown
    </h2>

    <span className="text-xs font-medium text-slate-400">
      {rating.total} total
    </span>
  </div>

  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[
            {
              rating: "5",
              reviews: rating.breakdown[5] || 0,
            },
            {
              rating: "4",
              reviews: rating.breakdown[4] || 0,
            },
            {
              rating: "3",
              reviews: rating.breakdown[3] || 0,
            },
            {
              rating: "2",
              reviews: rating.breakdown[2] || 0,
            },
            {
              rating: "1",
              reviews: rating.breakdown[1] || 0,
            },
          ]}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="rating"
            tick={{
              fill: "#64748b",
              fontSize: 13,
              fontWeight: 500,
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} ★`}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fill: "#94a3b8",
              fontSize: 12,
            }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
              fontSize: "13px",
            }}
            formatter={(value) => [
              `${value} review${value === 1 ? "" : "s"}`,
              "Rating",
            ]}
            labelFormatter={(label) => `${label} Star`}
          />

          <Bar
            dataKey="reviews"
            fill="#14b8a6"
            radius={[6, 6, 0, 0]}
            barSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</section>

        {/* Most Common Feedback */}
        <section className="mb-7">
          <h2 className="mb-3 text-base font-semibold text-slate-800 sm:text-lg">
            Most common feedback
          </h2>

          {commonFeedback.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No feedback tags yet.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-2.5">
                {commonFeedback.map((item) => (
                  <div
                    key={item.tag}
                    className="flex items-center gap-2 rounded-lg border border-teal-100 bg-teal-50/60 px-3.5 py-2 text-sm font-medium text-teal-700"
                  >
                    <span>{item.tag}</span>

                    <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold text-teal-600">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Recent Reviews */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              Recent reviews
            </h2>

            {recentReviews.length > 0 && (
              <span className="text-xs font-medium text-slate-400">
                Latest reviews
              </span>
            )}
          </div>

          {recentReviews.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
              <FiStar className="mx-auto mb-3 h-6 w-6 text-slate-300" />

              <p className="text-sm font-medium text-slate-500">
                No reviews yet.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Reviews from citizens will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {recentReviews.map((review, index) => (
                <div
                  key={review.review_id}
                  className={`px-5 py-5 sm:px-6 ${
                    index !== recentReviews.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-800 sm:text-[15px]">
                      {review.title}
                    </p>

                    <StaticStars value={review.rating} />
                  </div>

                  {review.comment && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {review.comment}
                    </p>
                  )}

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    {formatShortDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}