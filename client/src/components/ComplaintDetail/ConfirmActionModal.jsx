import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  confirmClassName = "bg-[#1F8A70] hover:bg-[#19735F]",
  isLoading,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
        
          <h3 className="text-base font-bold text-[#14233b]">{title}</h3>
        </div>

        <p className="mb-6 text-sm text-slate-500">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}