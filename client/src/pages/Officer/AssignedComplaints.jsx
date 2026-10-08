import { useState, useEffect } from "react";
import axios from "axios";
import ComplaintsFilters from "../../components/ComplaintsFilter/ComplaintsFilters";
import ComplaintCard from "../../components/ComplaintsFilter/ComplaintCard";
import EmptyState from "../../components/ComplaintsFilter/EmptyState";
import OfficerComplaintDetail from "./OfficerComplaintDetail";

// Only pending complaints are shown on this page — status filtering
// is intentionally not exposed to the officer here.
const PENDING_STATUS = "pending";

// Severity sort order used whenever "All Severity" is selected —
// most severe complaints surface first by default.
const SEVERITY_ORDER = { critical: 1, high: 2, medium: 3, low: 4 };

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [department, setDepartment] = useState(null);

  const fetchAssignedComplaints = async () => {
    try {
      const response = await axios.get(
        "/api/officer/complaints",
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setComplaints(response.data.complaints);
        setDepartment(response.data.department);
      }
    } catch (error) {
      console.error("Error fetching assigned complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  useEffect(() => {
    // Always restrict to pending complaints first.
    let filtered = complaints.filter((c) => c.status === PENDING_STATUS);

    // Then apply the officer's chosen severity filter, if any.
    if (severityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.severity_level?.toLowerCase() === severityFilter
      );
    }

    // Sort by severity: critical > high > medium > low
    filtered = [...filtered].sort((a, b) => {
      const severityA = SEVERITY_ORDER[a.severity_level?.toLowerCase()] || 5;
      const severityB = SEVERITY_ORDER[b.severity_level?.toLowerCase()] || 5;
      return severityA - severityB;
    });

    setFilteredComplaints(filtered);
  }, [severityFilter, complaints]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedComplaint(null);
    // Refresh the list to show updated statuses
    fetchAssignedComplaints();
  };

  if (showDetail && selectedComplaint) {
    return (
      <OfficerComplaintDetail
        complaint={selectedComplaint}
        onBack={handleBackToList}
        onStatusUpdated={(updatedReport) => {
          // Update the selected complaint with the new report data
          // so when user clicks back, they see the updated status
          setSelectedComplaint(updatedReport);

          // Also update the complaints list
          setComplaints(prevComplaints =>
            prevComplaints.map(c =>
              c.report_id === updatedReport.report_id ? updatedReport : c
            )
          );
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-6 lg:p-8 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Pending Complaints
        </h1>
        <p className="text-slate-600">
          Pending complaints assigned to{" "}
          {department && <span className="font-semibold">{department}</span>}
          , sorted by severity
        </p>
      </div>

      {/* Filters */}
      <ComplaintsFilters
        severityFilter={severityFilter}
        onSeverityChange={setSeverityFilter}
        showCategoryFilter={false}
        showStatusFilter={false}
      />

      {/* Complaints Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Loading complaints...</div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.report_id}
              complaint={complaint}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}