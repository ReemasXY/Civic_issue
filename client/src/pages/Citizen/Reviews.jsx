import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiStar,
  FiArrowLeft,
  FiMapPin,
  FiCheckCircle,
  FiMessageSquare,
  FiClipboard,
} from "react-icons/fi";
import successToast from "../../utils/SuccessToast";
import errToast from "../../utils/ErrorToast";

const API = "http://localhost:5000/api/reviews";

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

const TAG_OPTIONS = [
  "Quick response",
  "Quality of work",
  "Solved the issue fully",
  "Worked efficiently",
];

const getInitials = (name = "") =>
  name.slice(0, 2).toUpperCase() || "OF";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function StaticStars({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          className={`h-4 w-4 ${
            n <= value ? "text-amber-400" : "text-slate-300"
          }`}
          fill={n <= value ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [pending, setPending] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pendingRes, mineRes] = await Promise.all([
        axios.get(`${API}/pending`, {
          withCredentials: true,
        }),
        axios.get(`${API}/mine`, {
          withCredentials: true,
        }),
      ]);

      if (pendingRes.data.success) {
        setPending(pendingRes.data.pending);
      }

      if (mineRes.data.success) {
        setPast(mineRes.data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openReview = (complaint) => {
    setSelected(complaint);
    setRating(0);
    setTags([]);
    setComment("");
    setFormError("");
  };

  const closeReview = () => {
    setSelected(null);
  };

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!rating) {
      setFormError("Please select a star rating.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        API,
        {
          report_id: selected.report_id,
          rating,
          tags,
          comment,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        successToast("Thanks, your review was submitted");
        await fetchData();
        closeReview();
      }
    } catch (error) {
      errToast(
        error.response?.data?.error ||
          "Could not submit your review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const average =
    past.length > 0
      ? (
          past.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / past.length
        ).toFixed(1)
      : "–";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiStar className="mx-auto mb-3 h-6 w-6 animate-pulse text-teal-600" />

          <p className="text-sm text-slate-500">
            Loading reviews...
          </p>
        </div>
      </div>
    );
  }

  if (selected) {
    const officerName =
      selected.officer_name || "Assigned officer";

    return (
      <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={closeReview}
            className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to reviews
          </button>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Officer Information */}
            <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">
                    {getInitials(officerName)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">
                      {officerName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selected.officer_department ||
                        "Department not recorded"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <FiCheckCircle className="h-4.5 w-4.5 text-emerald-600" />

                  <span className="text-sm font-semibold text-emerald-700">
                    Resolved
                  </span>
                </div>
              </div>
            </div>

            {/* Complaint Information */}
            <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <FiClipboard className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900">
                    {selected.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="h-4 w-4" />
                      {selected.location_short_label ||
                        "Location not recorded"}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span>
                      Resolved{" "}
                      {formatDate(selected.resolved_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="px-5 py-6 sm:px-7 sm:py-7">
              {/* Rating */}
              <div className="mb-7">
                <p className="text-base font-semibold text-slate-900">
                  Overall rating
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  How would you rate the officer's handling
                  of this complaint?
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setRating(n);
                          setFormError("");
                        }}
                        className="cursor-pointer rounded-md p-1 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${n} star${
                          n > 1 ? "s" : ""
                        }`}
                      >
                        <FiStar
                          className={`h-7 w-7 transition-colors ${
                            n <= rating
                              ? "text-amber-400"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                          fill={
                            n <= rating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    ))}
                  </div>

                  <span
                    className={`ml-1 text-sm font-medium ${
                      rating
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {rating
                      ? RATING_LABELS[rating - 1]
                      : "Select a rating"}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-7">
                <p className="text-base font-semibold text-slate-900">
                  What went well?
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Select anything that describes your
                  experience.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((tag) => {
                    const active = tags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-slate-50"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="h-5 w-5 text-slate-500" />

                  <p className="text-base font-semibold text-slate-900">
                    Additional feedback
                  </p>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Share anything else about how your
                  complaint was handled.
                </p>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  maxLength={500}
                  rows={5}
                  placeholder="Write your feedback..."
                  className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                />

                <div className="mt-1.5 text-right text-xs text-slate-400">
                  {comment.length}/500
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={closeReview}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="cursor-pointer rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit review"}
                </button>

                {formError && (
                  <span className="text-sm font-medium text-red-600 sm:ml-2">
                    {formError}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Citizen feedback
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Rate officer work
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Share your experience with how your resolved
            complaints were handled.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Awaiting review
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {pending.length}
                </p>
              </div>

              <FiStar className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Reviews given
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {past.length}
                </p>
              </div>

              <FiMessageSquare className="h-5 w-5 text-teal-600" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Your average
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900">
                    {average}
                  </p>

                  {average !== "–" && (
                    <FiStar
                      className="h-5 w-5 text-amber-400"
                      fill="currentColor"
                    />
                  )}
                </div>
              </div>

              <FiCheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Awaiting your review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Resolved complaints that still need your
                feedback
              </p>
            </div>

            {pending.length > 0 && (
              <span className="text-sm font-semibold text-teal-700">
                {pending.length} pending
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
              <FiCheckCircle className="mx-auto h-6 w-6 text-emerald-600" />

              <p className="mt-4 text-sm font-medium text-slate-700">
                You're all caught up
              </p>

              <p className="mt-1 text-sm text-slate-500">
                No resolved complaints are waiting for a
                review.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {pending.map((complaint, index) => {
                const officerName =
                  complaint.officer_name ||
                  "Assigned officer";

                return (
                  <div
                    key={complaint.report_id}
                    className={`flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-5 ${
                      index !== pending.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">
                      {getInitials(officerName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                        {complaint.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {officerName}

                        {complaint.officer_department && (
                          <>
                            <span className="mx-1.5 text-slate-300">
                              •
                            </span>

                            {complaint.officer_department}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="hidden shrink-0 text-right md:block">
                      <p className="text-sm font-medium text-slate-500">
                        Resolved
                      </p>

                      <p className="mt-0.5 text-sm text-slate-400">
                        {formatDate(
                          complaint.resolved_at
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openReview(complaint)
                      }
                      className="w-full shrink-0 cursor-pointer rounded-lg border border-teal-300 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition-all hover:border-teal-500 hover:bg-teal-50 sm:w-auto"
                    >
                      Review complaint
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Reviews */}
        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Your past reviews
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Feedback you've already submitted
            </p>
          </div>

          {past.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
              <FiMessageSquare className="mx-auto h-6 w-6 text-slate-500" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No reviews yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your submitted reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {past.map((review, index) => (
                <div
                  key={review.review_id}
                  className={`flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-5 ${
                    index !== past.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">
                        {review.officer_name ||
                          "Assigned officer"}
                      </p>

                      <span className="text-slate-300">
                        •
                      </span>

                      <span className="text-sm text-slate-400">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {review.title}
                    </p>

                    {review.comment && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {review.comment}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <StaticStars
                      value={review.rating}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}