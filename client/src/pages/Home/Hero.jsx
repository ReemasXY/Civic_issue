import { FiPlus, FiCheckCircle } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { useNavigate } from "react-router";
import axios from "axios";
import BlurText from "../../utils/Blurtext";
import SplitImage from "../../utils/SplitImage";
import heroImage from "/hero-illustration.png"

export default function Hero() {
  const navigate = useNavigate();

  const handleReportIssue = async () => {
    try {
      // Check if user is authenticated
      const response = await axios.get(
        "http://localhost:5000/api/auth/getuser",
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      // If authenticated, redirect based on role
      if (response.data.user) {
        const userRole = response.data.user.role;

        if (userRole === "officer") {
          navigate("/officer/dashboard");
        } else {
          navigate("/citizen/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      // If not authenticated, redirect to login
      navigate("/login");
    }
  };
  return (
    <section className="relative overflow-hidden bg-white pt-8">
      <div
        className="
          mx-auto
          grid
          max-w-[1150px]
          grid-cols-1
          items-center
          gap-8
          px-5
          py-12
          sm:px-8
          lg:grid-cols-[1fr_1.1fr]
          lg:gap-0
          lg:px-8
          lg:py-12
          bg-white
        "
      >
        {/* ================= LEFT SIDE ================= */}
        <div className="relative z-50 bg-white">

          {/* Badge */}
          <span
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-teal-50
              px-4
              py-2
              text-[13px]
              font-medium
              text-teal-700
            "
          >
            <FiCheckCircle className="h-4 w-4" />
            For a Cleaner, Safer &amp; Better City
          </span>

          {/* Heading */}
          <h1
            className="
              mt-6
              max-w-[650px]
              text-[42px]
              font-bold
              leading-[1.15]
              tracking-[-1.5px]
              text-slate-900
              sm:text-[48px]
            "
          >
            <BlurText
              text="Report. Track. Resolve."
              delay={200}
              animateBy="words"
              direction="top"
              className=" md:whitespace-nowrap mb-1"
            />
            <BlurText
              text="Together for a better city."
              delay={200}
              animateBy="words"
              direction="top"
              className="text-teal-600"
            />

          </h1>

          {/* Description */}
          <p
            className="
              mt-5
              max-w-[500px]
              text-[16px]
              font-normal
              leading-[1.7]
              text-slate-600
            "
          >
            Report civic issues in your area, track their status in real-time
            and help make your community cleaner, safer and better.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">

            {/* Primary Button */}
            <button
              onClick={handleReportIssue}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:bg-slate-800
                hover:shadow-md
              "
            >
              <FiPlus className="h-4 w-4" />
              Report an Issue
            </button>

            {/* Secondary Button */}
            <button
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-300
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-700
                transition-all
                duration-200
                hover:border-teal-300
                hover:bg-teal-50
                hover:text-teal-700
              "
            >
              <HiOutlineDocumentText className="h-4 w-4" />
              View Issues
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div
          className="
            relative
            flex
            items-center
            justify-center
            lg:justify-end
          "
        >
          {/* <BlurImage
          src={heroImage}
          alt="Civic issue reporting"
          className=" relative
              z-10
              w-full
              max-w-[700px]
              object-contain
              -translate-x-8

              sm:-translate-x-10
              lg:w-[680px]
              lg:-translate-x-14"
          direction="right"
          delay={0.2}
          duration={0.8}
        /> */}
          <SplitImage
            src={heroImage}
            alt="Civic issue reporting"
            className="relative
              z-10
              w-full
              max-w-[700px]
              object-contain
              -translate-x-8

              sm:-translate-x-10
              lg:w-[680px]
              lg:-translate-x-14"
            delay={300}
            duration={2}
            ease="power3.out"
            from={{
              opacity: 0,
              y: 40
            }}
            to={{
              opacity: 1,
              y: 0
            }}
            threshold={0.1}
            rootMargin="-100px"
          />
        </div>
      </div>
    </section>
  );
}