import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  FaFileAlt,
  FaSearch,
  FaUserCog,
  FaCheckCircle,
  FaClipboardCheck,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    icon: FaFileAlt,
    title: "Report an Issue",
    description:
      "Submit a civic issue by selecting a category, adding the location, describing the problem, and uploading a photo.",
  },
  {
    number: "02",
    icon: FaSearch,
    title: "Report Verification",
    description:
      "The system reviews your complaint and checks the submitted information for duplicate or invalid reports.",
  },
  {
    number: "03",
    icon: FaUserCog,
    title: "Assigned to Department",
    description:
      "Once verified, the complaint is forwarded to the appropriate municipal department for further action.",
  },
  {
    number: "04",
    icon: FaClipboardCheck,
    title: "Action is Taken",
    description:
      "The responsible department investigates the issue, takes the necessary action, and updates the complaint status.",
  },
  {
    number: "05",
    icon: FaCheckCircle,
    title: "Issue Resolved",
    description:
      "Once the issue is fixed, the complaint is marked as resolved and you receive an update about the outcome.",
  },
];

function StepCard({ step, index }) {
  const Icon = step.icon;
  const stepRef = useRef(null);

  useEffect(() => {
    const element = stepRef.current;

    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 70,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, stepRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={stepRef}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 py-10"
    >
      {/* Left / Right Text */}
      <div
        className={`${
          index % 2 === 0
            ? "md:text-right md:order-1"
            : "md:text-left md:order-3"
        } text-center`}
      >
        <span className="text-sm font-bold text-slate-400">
          STEP {step.number}
        </span>

        <h3 className="mt-1 text-xl font-bold text-slate-900">
          {step.title}
        </h3>

        <p className="mt-2 max-w-md mx-auto md:mx-0 text-sm leading-relaxed text-slate-500">
          {step.description}
        </p>
      </div>

      {/* Center Icon */}
      <div className="relative md:order-2 flex justify-center">
        {index !== steps.length - 1 && (
          <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-px h-[125px] bg-slate-200" />
        )}

        <div className="relative z-10 h-20 w-20 rounded-full bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.08)] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
            <Icon
              size={21}
              className="text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Empty Side */}
      <div
        className={`hidden md:block ${
          index % 2 === 0
            ? "md:order-3"
            : "md:order-1"
        }`}
      />
    </div>
  );
}

export default function StepsTimeline() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div>
        {steps.map((step, index) => (
          <StepCard
            key={step.number}
            step={step}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}