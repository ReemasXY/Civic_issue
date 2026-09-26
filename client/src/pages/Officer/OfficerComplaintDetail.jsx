import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import ComplaintHeader from "../../components/ComplaintDetail/ComplaintHeader";
import ComplaintInformation from "../../components/ComplaintDetail/ComplaintInformation";
import MapModal from "../../components/ComplaintDetail/MapModal";
import ReviewActions from "../../components/ComplaintDetail/ReviewActions";
import UpdateStatusCard from "../../components/ComplaintDetail/UpdateStatusCard";
import { getStatusConfig } from "../../components/ComplaintDetail/utils/statusConfig";
import { getSeverityConfig } from "../../components/ComplaintDetail/utils/severityConfig";
import successToast from "../../utils/SuccessToast";
import errToast from "../../utils/ErrorToast";

export default function OfficerComplaintDetail({ complaint, onBack, onStatusUpdated }) {
  const navigate = useNavigate();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(complaint?.status);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!complaint) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">
          No complaint data available
        </p>
      </div>
    );
  }

  const currentStatusConfig = getStatusConfig(currentStatus);
  const currentSeverityConfig = getSeverityConfig(complaint.severity_level);

  const handleStatusChange = async (newStatus, reason) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/officer/complaints/${complaint.report_id}/status`,
        reason ? { status: newStatus, rejection_reason: reason } : { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCurrentStatus(newStatus);
        successToast("Status updated successfully.");

        // Always update parent with new report data
        if (onStatusUpdated) {
          onStatusUpdated(response.data.report);
        }

        // If the complaint was verified or rejected, redirect to pending complaints page
        if (newStatus === "verified" || newStatus === "rejected") {
          setTimeout(() => {
            navigate("/officer/complaints");
          }, 1500); // Give time to see the success message
        }
      }
    } catch (error) {
      if (error.response?.data?.error) {
        errToast(error.response.data.error);
      } else {
        errToast("Failed to update status. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white px-4 py-5 sm:px-6 lg:px-8">
      <ComplaintHeader
        complaint={complaint}
        onBack={onBack}
        statusConfig={currentStatusConfig}
      />

      {/* TWO-COLUMN LAYOUT: details on the left, actions on the right */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <ComplaintInformation
          complaint={complaint}
          onMapClick={() => setIsMapExpanded(true)}
          severityConfig={currentSeverityConfig}
        />

        <div className="min-w-0">
          {currentStatus === "pending" ? (
            <ReviewActions
              isUpdating={isUpdating}
              onVerify={() => handleStatusChange("verified")}
              onReject={(reason) => handleStatusChange("rejected", reason)}
            />
          ) : (
            <UpdateStatusCard
              currentStatus={currentStatus}
              isUpdating={isUpdating}
              onSave={(newStatus) => handleStatusChange(newStatus)}
            />
          )}
        </div>
      </div>

      <MapModal
        isOpen={isMapExpanded}
        onClose={() => setIsMapExpanded(false)}
        latitude={complaint.latitude}
        longitude={complaint.longitude}
        locationLabel={
          complaint.location_short_label || complaint.location_full_label
        }
      />
    </div>
  );
}