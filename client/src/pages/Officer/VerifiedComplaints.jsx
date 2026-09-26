import { useState, useEffect } from "react";
import axios from "axios";
import FilterDropdown from "../../components/ComplaintsFilter/FilterDropdown";
import ComplaintCard from "../../components/ComplaintsFilter/ComplaintCard";
import EmptyState from "../../components/ComplaintsFilter/EmptyState";
import OfficerComplaintDetail from "./OfficerComplaintDetail";

// Only verified, in-progress, and resolved complaints are shown on this page
const VERIFIED_STATUSES = ["verified", "in-progress", "resolved"];

// Severity sort order used whenever "All Severity" is selected —
// most severe complaints surface first by default.
const SEVERITY_ORDER = { critical: 1, high: 2, medium: 3, low: 4 };

export default function VerifiedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("verified");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [department, setDepartment] = useState(null);

  const fetchVerifiedComplaints = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/officer/complaints",
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setComplaints(response.data.complaints);
        setDepartment(response.data.department);
      }
    } catch (error) {
      console.error("Error fetching verified complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedComplaints();
  }, []);

  useEffect(() => {
    // Filter to only verified, in-progress, and resolved complaints
    let filtered = complaints.filter((c) =>
      VERIFIED_STATUSES.includes(c.status)
    );

    // Apply status filter (no "all" option, always filter by specific status)
    filtered = filtered.filter((c) => c.status === statusFilter);

    // Apply severity filter if not "all"
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
  }, [statusFilter, severityFilter, complaints]);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedComplaint(null);
  };

  if (showDetail && selectedComplaint) {
    return (
      <OfficerComplaintDetail
        complaint={selectedComplaint}
        onBack={handleBackToList}
        onStatusUpdated={() => {
          // Refetch complaints after status update
          fetchVerifiedComplaints();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Verified Complaints
        </h1>
        <p className="text-slate-600">
          Complaints that are verified, in progress, or resolved in{" "}
          {department && <span className="font-semibold">{department}</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "verified", label: "Verified" },
            { value: "in-progress", label: "In Progress" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
        <FilterDropdown
          label="Severity"
          value={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: "all", label: "All Severity" },
            { value: "critical", label: "Critical" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </div>

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
