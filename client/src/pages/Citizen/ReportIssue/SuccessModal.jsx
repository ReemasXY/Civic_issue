import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function SuccessModal({
  isOpen,
  onDone,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

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
        onClick={onDone}
      />

      {/* =========================
          SUCCESS CARD
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

        <div className="h-[3px] w-full bg-emerald-500" />

        {/* =========================
            CONTENT
        ========================== */}

        <div className="px-7 sm:px-8 pt-8 pb-7 text-center">

          {/* =========================
              SUCCESS ICON
          ========================== */}

          <div className="w-[62px] h-[62px] mx-auto mb-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <FiCheckCircle size={30} />
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
            Report Submitted Successfully!
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
            Your civic issue report has been registered and is now available in your dashboard.
          </p>

          {/* =========================
              ACTION BUTTON
          ========================== */}

          <button
            type="button"
            onClick={onDone}
            className="
              mt-6
              w-full
              rounded-xl
              bg-slate-900
              px-5 py-3
              text-sm
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-slate-800
              active:scale-[0.98]
              cursor-pointer
              shadow-sm
            "
          >
            Go to Dashboard
          </button>

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
