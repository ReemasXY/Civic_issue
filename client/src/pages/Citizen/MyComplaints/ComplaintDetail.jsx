import { useState } from "react";
import ComplaintHeader from "../../components/ComplaintDetail/ComplaintHeader";
import ComplaintInformation from "../../components/ComplaintDetail/ComplaintInformation";
import StatusTimeline from "../../components/ComplaintDetail/StatusTimeline";
import MapModal from "../../components/ComplaintDetail/MapModal";
import { getStatusConfig } from "../../components/ComplaintDetail/utils/statusConfig";
import { getSeverityConfig } from "../../components/ComplaintDetail/utils/severityConfig";

export default function ComplaintDetail({ complaint, onBack }) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  if (!complaint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">
          No complaint data available
        </p>
      </div>
    );
  }

  const currentStatusConfig = getStatusConfig(complaint.status);
  const currentSeverityConfig = getSeverityConfig(complaint.severity_level);

  return (
    <div className="min-h-screen w-full bg-white px-4 py-5 sm:px-6 lg:px-8">
      <ComplaintHeader
        complaint={complaint}
        onBack={onBack}
        statusConfig={currentStatusConfig}
      />

      {/* MAIN CONTENT */}
      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <ComplaintInformation
          complaint={complaint}
          onMapClick={() => setIsMapExpanded(true)}
          severityConfig={currentSeverityConfig}
        />

        <StatusTimeline
          complaint={complaint}
          getStatusConfig={getStatusConfig}
        />
      </div>

      <MapModal
        isOpen={isMapExpanded}
        onClose={() => setIsMapExpanded(false)}
        latitude={complaint.latitude}
        longitude={complaint.longitude}
        locationLabel={
          complaint.location_short_label ||
          complaint.location_full_label ||
          "Complaint location"
        }
      />
    </div>
  );
}
