import ScrollReveal from "../../utils/ScrollReveal";

const complaints = [
  {
    title: "Large Pothole on Main Road",
    location: "Baneswor, Kathmandu",
    time: "2 hours ago",
    status: "In Progress",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Overflowing Garbage Bin",
    location: "Maitighar, Kathmandu",
    time: "5 hours ago",
    status: "Verified",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Broken Street Light",
    location: "New Baneswor, Kathmandu",
    time: "1 day ago",
    status: "Resolved",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
  },
   {
    title: "Large Pothole on Main Road",
    location: "Baneswor, Kathmandu",
    time: "2 hours ago",
    status: "In Progress",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Overflowing Garbage Bin",
    location: "Maitighar, Kathmandu",
    time: "5 hours ago",
    status: "Verified",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Broken Street Light",
    location: "New Baneswor, Kathmandu",
    time: "1 day ago",
    status: "Resolved",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
  }
];

const RecentComplaints = () => {
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

        {complaints.map((complaint, index) => (

          <ScrollReveal
            key={complaint.title}
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
                  src={complaint.image}
                  alt={complaint.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />

                {/* Status Badge */}
                <span
                  className={`absolute right-3 top-3 rounded-md px-3 py-1 text-xs font-medium ${
                    complaint.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : complaint.status === "Verified"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {complaint.status}
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
                      {complaint.location}
                    </span>

                  </div>

                  <span>
                    {complaint.time}
                  </span>

                </div>

              </div>

            </div>

          </ScrollReveal>

        ))}

      </div>
    </section>
  );
};

export default RecentComplaints;