import { FiAlertTriangle } from "react-icons/fi";

export default function EmptyState({ message, submessage }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 text-slate-400">
        <FiAlertTriangle className="h-12 w-12" />
      </div>
      <p className="text-lg font-medium text-slate-600">
        {message || "No complaints found"}
      </p>
      <p className="text-sm text-slate-500">
        {submessage || "Try adjusting your filters or report a new issue"}
      </p>
    </div>
  );
}
