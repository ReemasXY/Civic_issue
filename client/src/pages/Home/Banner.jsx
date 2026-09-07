import React from "react";
import ScrollReveal from "../../utils/ScrollReveal";

const stats = [
  { value: "9K+", label: "Active Users" },
  { value: "1.5K+", label: "Issues Submitted" },
  { value: "50+", label: "Issues Resolved Daily" },
  { value: "25M+", label: "Community Reach" },
];

export default function Banner() {
  return (
    <section className="bg-slate-50 py-12  sm:py-16">
      <div className="mx-auto max-w-[1150px] px-5 sm:px-8">

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4">
          <span className="h-[2px] w-10 bg-teal-600" />

          <span
            className="
              text-[13px]
              font-semibold
              tracking-[2.5px]
              text-teal-600
              sm:text-[14px]
            "
          >
            EVERY REPORT MATTERS

          </span>

          <span className="h-[2px] w-10 bg-teal-600" />
        </div>

        {/* Heading */}
        <h2
          className="
            mt-6
            text-center
            text-[42px]
            font-bold
            leading-[1.1]
            tracking-[-1.5px]
            text-slate-900

            sm:text-[48px]
            lg:text-[52px]
          "
        >
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={3}
            blurStrength={4}
          >
            Trusted By Communities
          </ScrollReveal>

          <br />

          <p className="text-teal-600 mt-4">
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={3}
              blurStrength={4}
            >
              Across the City
            </ScrollReveal>
          </p>
        </h2>

        {/* Subtext */}
        <p
          className="
            mx-auto
            mt-6
            max-w-[650px]
            text-center
            text-[16px]
            font-normal
            leading-[1.7]
            text-slate-600

            sm:text-[17px]
          "
        >
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={2}
            blurStrength={3}
          >
            A simple and reliable platform for citizens to report, track, and
            help resolve civic issues in their communities.
          </ScrollReveal>
        </p>

        {/* Stats */}
        <div
          className="
            mt-12
            grid
            grid-cols-2
            divide-y
            divide-slate-200
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
            sm:grid-cols-4
            sm:divide-x
            sm:divide-y-0
          "
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="
                flex
                flex-col
                items-center
                justify-center
                px-5
                py-8
                text-center

                sm:px-6
                sm:py-7
              "
            >
              <p
                className="
                  text-[32px]
                  font-bold
                  leading-tight
                  tracking-[-1px]
                  text-slate-900
                  sm:text-[30px]
                "
              >
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur
                  baseRotation={2}
                  blurStrength={3}
                >
                  {value}
                </ScrollReveal>
              </p>

              <p
                className="
                  mt-2
                  text-[14px]
                  font-normal
                  text-slate-500

                  sm:text-[15px]
                "
              >
                <ScrollReveal
                  baseOpacity={0.1}
                  enableBlur
                  baseRotation={1}
                  blurStrength={2}
                >
                  {label}
                </ScrollReveal>
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}