import React from "react";
import { FiUpload, FiLoader } from "react-icons/fi";

export default function SubmittingModal() {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">

      {/* =========================
          BACKDROP
      ========================== */}

      <div
        className="
          absolute
          inset-0
          bg-slate-950/50
          backdrop-blur-[3px]
          animate-[modalBackdrop_0.25s_ease-out]
        "
      />

      {/* =========================
          SUBMITTING CARD
      ========================== */}

      <div
        className="
          relative
          w-full
          max-w-sm
          bg-white
          rounded-[24px]
          border
          border-slate-200
          shadow-[0_25px_70px_rgba(15,23,42,0.20)]
          overflow-hidden
          animate-[modalEnter_0.32s_cubic-bezier(0.16,1,0.3,1)]
        "
      >

        {/* =========================
            TOP ACCENT
        ========================== */}

        <div className="h-[3px] w-full bg-teal-600" />

        {/* =========================
            CONTENT
        ========================== */}

        <div className="px-7 sm:px-8 pt-8 pb-7 text-center">

          {/* =========================
              SPINNER
          ========================== */}

          <div className="relative w-[62px] h-[62px] mx-auto mb-5">

            <div
              className="
                absolute
                inset-0
                rounded-full
                border-[3px]
                border-slate-100
              "
            />

            <div
              className="
                absolute
                inset-0
                rounded-full
                border-[3px]
                border-transparent
                border-t-teal-600
                animate-spin
              "
            />

            <div
              className="
                absolute
                inset-[9px]
                rounded-full
                bg-teal-50
                border
                border-teal-100
                flex
                items-center
                justify-center
              "
            >
              <FiUpload
                size={19}
                className="text-teal-600"
              />
            </div>

          </div>

          {/* =========================
              TITLE
          ========================== */}

          <h2
            className="
              text-[20px]
              leading-7
              font-semibold
              tracking-[-0.02em]
              text-slate-800
            "
          >
            Submitting Your Report
          </h2>

          {/* =========================
              DESCRIPTION
          ========================== */}

          <p
            className="
              text-[13px]
              sm:text-sm
              text-slate-500
              mt-2
              leading-6
              max-w-sm
              mx-auto
            "
          >
            Please wait while we save your civic issue report to the database.
          </p>

          {/* =========================
              PROCESSING STEPS
          ========================== */}

          <div className="mt-6 space-y-2">

            <ProcessingStep
              text="Saving image to server"
            />

            <ProcessingStep
              text="Storing report details"
            />

            <ProcessingStep
              text="Recording location data"
            />

          </div>

          {/* =========================
              FOOTER
          ========================== */}

          <p
            className="
              text-[11px]
              text-slate-400
              mt-6
            "
          >
            Please don't close or refresh this page.
          </p>

        </div>

      </div>

      {/* =========================
          MODAL ANIMATIONS
      ========================== */}

      <style>
        {`
          @keyframes modalEnter {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes modalBackdrop {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }
        `}
      </style>

    </div>
  );
}


/* =========================
   PROCESSING STEP
========================= */

function ProcessingStep({ text }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        px-3.5
        py-2.5
        rounded-xl
        bg-slate-50
        border
        border-slate-100
      "
    >

      <div
        className="
          w-6
          h-6
          shrink-0
          rounded-full
          flex
          items-center
          justify-center
          bg-teal-50
          border
          border-teal-100
          text-teal-600
        "
      >
        <FiLoader
          size={12}
          className="animate-spin"
        />
      </div>

      <span
        className="
          text-xs
          font-medium
          text-slate-600
        "
      >
        {text}
      </span>

    </div>
  );
}
