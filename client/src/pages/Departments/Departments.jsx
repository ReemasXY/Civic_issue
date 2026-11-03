import { useNavigate } from "react-router";
import axios from "axios";
import { FaRoad, FaLightbulb, FaWater, FaTrash, FaArrowRight } from "react-icons/fa";
import BlurText from "../../utils/Blurtext";
import ScrollReveal from "../../utils/ScrollReveal";

/* ---------------------------------------------------------------- */
/* Content (static)                                                  */
/* ---------------------------------------------------------------- */

const DEPARTMENTS = [
  {
    name: "Road Department",
    category: "Road Damage",
    icon: FaRoad,
    description:
      "Receives reports about damaged roads, so that repairs can be planned for the places that need them most.",
    examples: ["Potholes", "Cracked roads", "Broken surfaces"],
  },
  {
    name: "Public Works Department",
    category: "Streetlight Damage",
    icon: FaLightbulb,
    description:
      "Receives reports about faulty streetlights, so that dark and unsafe stretches of road can be restored to working order.",
    examples: ["Broken lights", "Flickering lights", "Damaged poles"],
  },
  {
    name: "Water Supply Department",
    category: "Drainage",
    icon: FaWater,
    description:
      "Receives reports about drainage problems, so that blocked or overflowing drains are cleared before they cause flooding.",
    examples: ["Blocked drains", "Overflowing drains", "Standing water"],
  },
  {
    name: "Environment Management Department",
    category: "Garbage / Waste",
    icon: FaTrash,
    description:
      "Receives reports about garbage and waste, so that clean-up and collection can be arranged for affected areas.",
    examples: ["Uncollected garbage", "Overflowing bins", "Dumped waste"],
  },
];

const STEPS = [
  {
    title: "You report",
    text: "Choose a category, add a photo of the problem and pin its location on the map.",
  },
  {
    title: "We check",
    text: "The photo is checked against the category and the urgency of the problem is rated.",
  },
  {
    title: "It is assigned",
    text: "The report goes straight to the department that handles that category.",
  },
  {
    title: "An officer acts",
    text: "The department's officers verify the report, start the work and mark it resolved. You are notified at every step.",
  },
];

/* ---------------------------------------------------------------- */
/* Departments page                                                  */
/* ---------------------------------------------------------------- */

export default function Departments() {
  const navigate = useNavigate();

  // Same behaviour as the "Report an Issue" button on the home page.
  // This only runs when the button is clicked, not when the page loads.
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
            DEPARTMENTS
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <BlurText
              text="The right team,"
              delay={200}
              animateBy="words"
              direction="top"
              className="justify-center"
            />
            <BlurText
              text="for every issue."
              delay={200}
              animateBy="words"
              direction="top"
              className="mt-4 justify-center text-teal-600"
            />
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-justify text-sm leading-relaxed text-slate-500 [text-align-last:center] sm:text-base">
            CivicCare sorts every report by category and sends it to the
            municipal department responsible for it, so each problem reaches
            the people who can fix it.
          </p>
        </div>
      </section>

      {/* ================= DEPARTMENT CARDS ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {DEPARTMENTS.map((department, index) => {
            const Icon = department.icon;

            return (
              <ScrollReveal
                key={department.name}
                as="element"
                baseOpacity={0.05}
                enableBlur
                baseRotation={1.5}
                blurStrength={7}
                delay={(index % 2) * 0.15}
              >
                <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold leading-snug text-slate-900">
                        {department.name}
                      </h2>

                      <span className="mt-1.5 inline-flex rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        Handles: {department.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-5 text-justify text-sm leading-relaxed text-slate-600 hyphens-auto">
                    {department.description}
                  </p>

                  {/* Examples */}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {department.examples.map((example) => (
                      <span
                        key={example}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ================= HOW A REPORT REACHES A DEPARTMENT ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-700">
            HOW ROUTING WORKS
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            From your report to the right desk
          </h2>

          <p className="mt-3 text-justify text-sm leading-relaxed text-slate-500 [text-align-last:center] sm:text-base">
            You never have to work out who is responsible. Pick a category and
            the rest happens automatically.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <ScrollReveal
              key={step.title}
              as="element"
              baseOpacity={0.05}
              enableBlur
              baseRotation={1.5}
              blurStrength={7}
              delay={(index % 4) * 0.12}
            >
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                  {index + 1}
                </div>

                <h3 className="font-bold text-slate-900">{step.title}</h3>

                <p className="mt-2 text-justify text-sm leading-relaxed text-slate-500 hyphens-auto">
                  {step.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="mx-auto max-w-[1150px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 md:flex-row">
          <div className="text-center md:text-left">
            <p className="mb-2 text-sm font-semibold text-slate-400">
              NOT SURE WHO HANDLES IT?
            </p>

            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              You don't need to know.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Pick a category and CivicCare routes your report to the right
              team.
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