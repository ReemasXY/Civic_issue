import { useState, useEffect } from "react";
import axios from "axios";
import ComplaintHeader from "../../../components/ComplaintDetail/ComplaintHeader";
import ComplaintInformation from "../../../components/ComplaintDetail/ComplaintInformation";
import StatusTimeline from "../../../components/ComplaintDetail/StatusTimeline";
import RejectionReason from "../../../components/ComplaintDetail/RejectionReason";
import MapModal from "../../../components/ComplaintDetail/MapModal";
import { getStatusConfig } from "../../../components/ComplaintDetail/utils/statusConfig";
import { getSeverityConfig } from "../../../components/ComplaintDetail/utils/severityConfig";

export default function ComplaintDetail({ complaint, onBack }) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loadingRejection, setLoadingRejection] = useState(false);

  // Fetch rejection reason if the report is rejected
  useEffect(() => {
    const fetchRejectionReason = async () => {
      if (complaint?.status === "rejected" && complaint?.report_id) {
        setLoadingRejection(true);
        try {
          const response = await axios.get(
            `http://localhost:5000/api/reports/${complaint.report_id}/rejection`,
            { withCredentials: true }
          );

          if (response.data.success && response.data.rejectionReason) {
            setRejectionReason(response.data.rejectionReason);
          }
        } catch (error) {
          console.error("Error fetching rejection reason:", error);
        } finally {
          setLoadingRejection(false);
        }
      }
    };

    fetchRejectionReason();
  }, [complaint?.status, complaint?.report_id]);

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

        {complaint.status === "rejected" ? (
          loadingRejection ? (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-500">Loading rejection details...</p>
            </div>
          ) : rejectionReason ? (
            <RejectionReason rejectionReason={rejectionReason} />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
              <p className="text-sm text-slate-500">No rejection reason available</p>
            </div>
          )
        ) : (
          <StatusTimeline
            complaint={complaint}
            getStatusConfig={getStatusConfig}
          />
        )}
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
