import React from "react";
import {
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

export default function VerificationModal({
  isOpen,
  onClose,
  onTryAgain,
  verificationResult,
  category,
}) {
  if (!isOpen) return null;

  const isError =
    verificationResult?.status === "error";

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
        onClick={onClose}
      />

      {/* =========================
          MODAL
      ========================== */}

      <div
        className="
          relative
          w-full
          max-w-md
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

        <div
          className={`
            h-[3px]
            w-full
            ${
              isError
                ? "bg-red-500"
                : "bg-teal-600"
            }
          `}
        />

        {/* =========================
            CLOSE BUTTON
        ========================== */}

        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-10
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            border
            border-slate-200
            bg-white
            text-slate-400
            hover:text-slate-700
            hover:bg-slate-50
            hover:border-slate-300
            transition-all
            duration-200
            cursor-pointer
          "
          aria-label="Close"
        >
          <FiX size={18} strokeWidth={1.8} />
        </button>

        {/* =========================
            CONTENT
        ========================== */}

        <div className="px-7 sm:px-8 pt-8 pb-7">

          {/* =========================
              ICON
          ========================== */}

          <div className="flex justify-center mb-5">
            <div
              className={`
                w-[62px]
                h-[62px]
                rounded-[18px]
                flex
                items-center
                justify-center
                border
                shadow-sm

                ${
                  isError
                    ? "bg-red-50 border-red-100 text-red-600"
                    : "bg-teal-50 border-teal-100 text-teal-600"
                }
              `}
            >
              {isError ? (
                <FiX
                  size={27}
                  strokeWidth={2}
                />
              ) : (
                <FiAlertTriangle
                  size={26}
                  strokeWidth={1.8}
                />
              )}
            </div>
          </div>

          {/* =========================
              HEADING
          ========================== */}

          <div className="text-center">

            <h2
              className="
                text-[21px]
                leading-7
                font-semibold
                tracking-[-0.02em]
                text-slate-800
              "
            >
              {isError
                ? "Verification Failed"
                : "Image Doesn't Match"}
            </h2>

            <p
              className="
                text-[13px]
                sm:text-sm
                text-slate-500
                mt-2.5
                leading-6
                max-w-sm
                mx-auto
              "
            >
              {verificationResult?.message ||
                `The uploaded image does not appear to match the selected category "${category}". Please upload a relevant image.`}
            </p>

          </div>

          {/* =========================
              VERIFICATION INFORMATION
          ========================== */}

          {!isError && (
            <div
              className="
                mt-6
                rounded-[14px]
                border
                border-slate-200
                bg-slate-50/70
                overflow-hidden
              "
            >

              {/* Header */}

              <div
                className="
                  px-4
                  py-3
                  border-b
                  border-slate-200
                  bg-white
                "
              >
                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.08em]
                    font-semibold
                    text-slate-500
                  "
                >
                  Verification Details
                </p>
              </div>

              {/* Selected Category */}

              <InfoRow
                label="Selected category"
                value={
                  verificationResult?.selectedCategory ||
                  category ||
                  "Unknown"
                }
              />

              {/* Detected Category */}

              <InfoRow
                label="Detected category"
                value={
                  verificationResult?.predictedCategory ||
                  "Unknown"
                }
                last
              />

            </div>
          )}

          {/* =========================
              ERROR INFORMATION
          ========================== */}

          {isError && (
            <div
              className="
                mt-6
                flex
                gap-3
                items-start
                rounded-[14px]
                border
                border-red-100
                bg-red-50/70
                px-4
                py-3
              "
            >

              <FiAlertTriangle
                size={16}
                className="
                  mt-0.5
                  shrink-0
                  text-red-500
                "
              />

              <p
                className="
                  text-xs
                  leading-5
                  text-red-700
                "
              >
                Image verification could not be
                completed. Please check your image and
                try again.
              </p>

            </div>
          )}

          {/* =========================
              BUTTONS
          ========================== */}

          <div className="flex gap-3 mt-7">

            {/* Cancel */}

            <button
              type="button"
              onClick={onClose}
              className="
                flex-1
                h-11
                px-4
                rounded-xl
                border
                border-slate-200
                bg-white
                text-sm
                font-semibold
                text-slate-600
                hover:bg-slate-50
                hover:border-slate-300
                hover:text-slate-700
                transition-all
                duration-200
                cursor-pointer
              "
            >
              Cancel
            </button>

            {/* Try Again */}

            <button
              type="button"
              onClick={onTryAgain}
              className="
                flex-1
                h-11
                px-4
                rounded-xl
                bg-slate-900
                text-white
                text-sm
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-slate-800
                active:scale-[0.98]
                transition-all
                duration-200
                cursor-pointer
              "
            >
              <FiRefreshCw size={15} />

              Upload Again
            </button>

          </div>

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
   INFORMATION ROW
========================= */

function InfoRow({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-4
        px-4
        py-3

        ${
          !last
            ? "border-b border-slate-200"
            : ""
        }
      `}
    >

      <span
        className="
          text-xs
          font-medium
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className="
          text-xs
          font-semibold
          text-slate-700
          text-right
        "
      >
        {value}
      </span>

    </div>
  );
}