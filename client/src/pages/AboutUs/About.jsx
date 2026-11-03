import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaRobot,
  FaChartLine,
  FaRoute,
  FaUsers,
  FaBell,
  FaStar,
  FaRoad,
  FaLightbulb,
  FaWater,
  FaTrash,
  FaHardHat,
  FaArrowRight,
} from "react-icons/fa";
import BlurText from "../../utils/Blurtext";
import ScrollReveal from "../../utils/ScrollReveal";
import SplitImage from "../../utils/SplitImage";
import aboutImage from "/reportIssues2.png";

/* ---------------------------------------------------------------- */
/* Content                                                           */
/* ---------------------------------------------------------------- */

const FEATURES = [
  {
    icon: FaCamera,
    title: "Photo evidence",
    text: "Every report includes a photo, so officers can see the problem before they visit.",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Pinned location",
    text: "Mark the exact spot on a map so the right team can find the issue without guessing.",
  },
  {
    icon: FaRobot,
    title: "AI image check",
    text: "An image model checks that the photo matches the chosen category and filters out unrelated uploads.",
  },
  {
    icon: FaChartLine,
    title: "Severity rating",
    text: "A short questionnaire rates how urgent the problem is, so critical issues stand out.",
  },
  {
    icon: FaRoute,
    title: "Automatic routing",
    text: "Each report goes straight to the department responsible for that type of issue.",
  },
  {
    icon: FaUsers,
    title: "Follow, don't duplicate",
    text: "If the same issue was already reported nearby, you can follow it instead of filing it again.",
  },
  {
    icon: FaBell,
    title: "Live updates",
    text: "Get notified when an officer verifies, starts work on, or resolves your report.",
  },
  {
    icon: FaStar,
    title: "Rate the service",
    text: "Once an issue is resolved, rate the officer's work so good service is recognised.",
  },
];

const CATEGORIES = [
  { icon: FaRoad, name: "Road Damage", department: "Road Department" },
  {
    icon: FaLightbulb,
    name: "Streetlight Damage",
    department: "Public Works Department",
  },
  { icon: FaWater, name: "Drainage", department: "Water Supply Department" },
  {
    icon: FaTrash,
    name: "Garbage / Waste",
    department: "Environment Management Department",
  },
];

const ROLES = [
  {
    icon: FaUsers,
    title: "Citizens",
    text: "Report issues with a photo and location, follow reports from neighbours, track every status change and review the work once it is done.",
  },
  {
    icon: FaHardHat,
    title: "Officers",
    text: "See the complaints assigned to their department, verify or reject them with a clear reason, and update progress until the issue is resolved.",
  },
  {
    icon: FaChartLine,
    title: "Administrators",
    text: "Monitor the whole city from one dashboard: trends, problem areas, department performance, and officer accounts.",
  },
];

/* ---------------------------------------------------------------- */
/* Small shared piece: centred section heading                       */
/* ---------------------------------------------------------------- */

function SectionHeading({ label, title, text }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-700">
        {label}
      </span>

      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>

      {text && (
        <p className="mt-3 text-justify text-sm leading-relaxed text-slate-500 [text-align-last:center] sm:text-base">
          {text}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* About page                                                        */
/* ---------------------------------------------------------------- */

export default function About() {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({ total: null, resolved: null });

  // Live numbers from the public issues endpoint
  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const [all, resolved] = await Promise.all([
          axios.get("/api/reports/public", { params: { limit: 1 } }),
          axios.get("/api/reports/public", {
            params: { limit: 1, status: "resolved" },
          }),
        ]);

        if (cancelled) return;

        setCounts({
          total: all.data.pagination.total,
          resolved: resolved.data.pagination.total,
        });
      } catch (error) {
        // Keep the dashes if the request fails
        console.error("Could not load stats:", error);
      }
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { value: counts.total ?? "–", label: "Issues reported" },
    { value: counts.resolved ?? "–", label: "Issues resolved" },
    { value: "4", label: "Issue categories" },
    { value: "4", label: "Municipal departments" },
  ];

  // Same behaviour as the "Report an Issue" button on the home page
  const handleReportIssue = async () => {
    try {
      const response = await axios.get("/api/auth/getuser", {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (response.data.user) {
        const userRole = response.data.user.role;

        if (userRole === "officer") {
          navigate("/officer/dashboard");
        } else if (userRole === "admin") {
          navigate("/admin/overview");
        } else {
          navigate("/citizen/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ================= HERO ================= */}
      <section className="mx-auto max-w-[1150px] px-4 pb-16 pt-40 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            ABOUT CIVICCARE
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <BlurText
              text="Fixing our city,"
              delay={200}
              animateBy="words"
              direction="top"
              className="justify-center"
            />
            <BlurText
              text="one report at a time."
              delay={200}
              animateBy="words"
              direction="top"
              className="mt-4 justify-center text-teal-600"
            />
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-justify text-sm leading-relaxed text-slate-500 [text-align-last:center] sm:text-base">
            CivicCare is a civic issue reporting platform for Nepal. It gives
            citizens a simple way to report broken roads, faulty streetlights,
            blocked drains and uncollected waste, and gives municipal teams a
            clear way to act on them.
          </p>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Text */}
          <div>
            <span className="text-xs font-semibold tracking-wide text-teal-600">
              OUR MISSION
            </span>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              Reporting a problem should be easy. Seeing it fixed should be
              visible.
            </h2>

            <p className="mt-5 text-justify text-sm leading-relaxed text-slate-600 hyphens-auto sm:text-base">
              A damaged road or an overflowing drain is often noticed by
              everyone and reported by no one. When people do report, they
              rarely hear back.
            </p>

            <p className="mt-4 text-justify text-sm leading-relaxed text-slate-600 hyphens-auto sm:text-base">
              CivicCare closes that gap. Every report is checked, sent to the
              responsible department and tracked in the open, so citizens can
              see what has been reported, who is handling it, and when it is
              resolved.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Open to everyone: anyone can browse reported issues without logging in.",
                "Every status change reaches the citizen as a notification.",
                "Every resolved issue can be reviewed, which keeps the service accountable.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span className="text-justify leading-relaxed hyphens-auto">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image */}
          <div className="relative w-full">
            <div className="overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(15,118,110,0.12)] ring-1 ring-slate-100">
              <SplitImage
                src={aboutImage}
                alt="A citizen reporting a damaged road from their phone in Kathmandu"
                className="w-full object-cover"
                delay={300}
                duration={2}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= AT A GLANCE ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:p-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WHAT MAKES IT WORK ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          label="WHAT WE OFFER"
          title="Built to take a report from photo to fix"
          text="Each step is designed to reduce guesswork for citizens and for the teams who respond."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <ScrollReveal
                key={feature.title}
                as="element"
                baseOpacity={0.05}
                enableBlur
                baseRotation={1.5}
                blurStrength={7}
                delay={(index % 4) * 0.12}
              >
                <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon size={18} />
                  </div>

                  <h3 className="font-bold text-slate-900">{feature.title}</h3>

                  <p className="mt-2 text-justify text-sm leading-relaxed text-slate-500 hyphens-auto">
                    {feature.text}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ================= ISSUES WE HANDLE ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          label="ISSUES WE HANDLE"
          title="The right report reaches the right department"
          text="Choose a category and CivicCare sends your report to the team responsible for it."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;

            return (
              <ScrollReveal
                key={category.name}
                as="element"
                baseOpacity={0.05}
                enableBlur
                baseRotation={1.5}
                blurStrength={7}
                delay={(index % 4) * 0.12}
              >
                <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon size={18} />
                  </div>

                  <h3 className="font-bold text-slate-900">{category.name}</h3>

                  <p className="mt-3 text-xs font-semibold tracking-wide text-slate-400">
                    HANDLED BY
                  </p>
                  <p className="mt-1 text-sm font-medium text-teal-700">
                    {category.department}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ================= WHO IT'S FOR ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          label="WHO IT'S FOR"
          title="One platform, three roles"
          text="Everyone involved in fixing a civic issue works from the same, transparent record."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLES.map((role, index) => {
            const Icon = role.icon;

            return (
              <ScrollReveal
                key={role.title}
                as="element"
                baseOpacity={0.05}
                enableBlur
                baseRotation={1.5}
                blurStrength={7}
                delay={index * 0.15}
              >
                <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-7">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon size={18} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {role.title}
                  </h3>

                  <p className="mt-2 text-justify text-sm leading-relaxed text-slate-500 hyphens-auto">
                    {role.text}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 md:flex-row">
          <div className="text-center md:text-left">
            <p className="mb-2 text-sm font-semibold text-slate-400">
              JOIN CIVICCARE
            </p>

            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Help make your community better.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Report an issue, or see what your neighbours have already
              reported.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleReportIssue}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Report an Issue
              <FaArrowRight size={12} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/issues")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-slate-400 hover:bg-slate-800"
            >
              View Issues
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}