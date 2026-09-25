import { useEffect, useState } from "react";
import ScrollReveal from "../../utils/ScrollReveal";
import axios from "axios";

const RecentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentComplaints = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/reports/recent");

        if (response.data.success) {
          setComplaints(response.data.complaints);
        }
      } catch (err) {
        console.error("Error fetching recent complaints:", err);
        setError("Failed to load recent complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentComplaints();
  }, []);

  // Format the time difference
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
  };
  if (loading) {
    return (
      <section className="px-6 py-12 md:px-10 mx-auto max-w-[1150px]">
        <div className="text-center text-gray-500">Loading recent complaints...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 py-12 md:px-10 mx-auto max-w-[1150px]">
        <div className="text-center text-red-500">{error}</div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12 md:px-10 mx-auto max-w-[1150px]">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold tracking-tight text-[#14233B]">
          <ScrollReveal
            baseOpacity={0.05}
            enableBlur
            baseRotation={1}
            blurStrength={6}
          >
            Recent Complaints
          </ScrollReveal>
        </h2>

        <button className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-[#14233B] transition hover:bg-gray-50">
          View All
        </button>

      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {complaints.length > 0 ? (
          complaints.map((complaint, index) => (

            <ScrollReveal
              key={complaint.report_id}
              as="element"
              baseOpacity={0.05}
              enableBlur
              baseRotation={1.5}
              blurStrength={7}
              delay={index * 0.15}
            >

              <div
                className="max-w-[350px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >

                {/* Image */}
                <div className="relative h-48 overflow-hidden">

                  <img
                    src={`http://localhost:5000${complaint.image_url}`}
                    alt={complaint.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />

                  {/* Status Badge */}
                  <span
                    className={`absolute right-3 top-3 rounded-md px-3 py-1 text-xs font-medium ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : complaint.status === "verified"
                        ? "bg-yellow-100 text-yellow-700"
                        : complaint.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {formatStatus(complaint.status)}
                  </span>

                </div>

                {/* Content */}
                <div className="p-4">

                  <h3 className="mb-3 text-base font-semibold text-[#14233B]">
                    {complaint.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-500">

                    {/* Location */}
                    <div className="flex items-center gap-1.5">

                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                        />

                        <circle
                          cx="12"
                          cy="9"
                          r="2.5"
                        />

                      </svg>

                      <span>
                        {complaint.location_short_label || "Location not provided"}
                      </span>

                    </div>

                    <span>
                      {formatTimeAgo(complaint.created_at)}
                    </span>

                  </div>

                </div>

              </div>

            </ScrollReveal>

          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No complaints available yet
          </div>
        )}

      </div>
    </section>
  );
};

export default RecentComplaints;