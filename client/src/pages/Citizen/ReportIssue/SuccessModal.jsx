import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function SuccessModal({
  isOpen,
  isClosing,
  onDone,
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`
        absolute inset-0 z-[9999]
        flex items-center justify-center
        px-4
        ${
          isClosing
            ? "animate-[fadeOut_0.3s_ease-in]"
            : "animate-[fadeIn_0.25s_ease-out]"
        }
      `}
    >
      <div
        className={`
          w-full max-w-[340px]
          rounded-2xl
          border border-slate-200
          bg-white
          p-6
          text-center
          shadow-[0_20px_60px_rgba(15,23,42,0.25)]
          ${
            isClosing
              ? "animate-[modalHide_0.3s_ease-in]"
              : "animate-[modalShow_0.3s_ease-out]"
          }
        `}
      >
        {/* Success Icon */}
        <div
          className="
            mx-auto
            flex h-14 w-14
            items-center justify-center
            rounded-full
            bg-emerald-50
            text-emerald-600
          "
        >
          <FiCheckCircle size={28} />
        </div>

        {/* Title */}
        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Report Submitted Successfully
        </h2>

        {/* Message */}
        <p className="mt-2 text-[12px] leading-5 text-slate-400">
          Your issue has been submitted successfully.
        </p>

        {/* Done Button */}
        <button
          type="button"
          onClick={onDone}
          className="
            mt-5
            w-full
            rounded-lg
            bg-slate-900
            px-4 py-2.5
            text-[12px]
            font-bold
            text-white
            transition-all
            duration-200
            hover:bg-slate-800
            active:scale-[0.98]
            cursor-pointer
          "
        >
          Done
        </button>
      </div>
    </div>
  );
}