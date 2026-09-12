import { useState, useEffect } from "react";
import axios from "axios";
import ComplaintsFilters from "../../components/ComplaintsFilter/ComplaintsFilters";
import ComplaintCard from "../../components/ComplaintsFilter/ComplaintCard";
import EmptyState from "../../components/ComplaintsFilter/EmptyState";
import OfficerComplaintDetail from "./OfficerComplaintDetail";

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/officer/complaints",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setComplaints(response.data.complaints);
          setFilteredComplaints(response.data.complaints);
          setDepartment(response.data.department);
        }
      } catch (error) {
        console.error("Error fetching assigned complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.severity_level?.toLowerCase() === severityFilter
      );
    }

    // Sort by severity: critical > high > medium > low
    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    filtered = filtered.sort((a, b) => {
      const severityA = severityOrder[a.severity_level?.toLowerCase()] || 5;
      const severityB = severityOrder[b.severity_level?.toLowerCase()] || 5;
      return severityA - severityB;
    });

    setFilteredComplaints(filtered);
  }, [statusFilter, categoryFilter, severityFilter, complaints]);

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
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Assigned Complaints
        </h1>
        <p className="text-slate-600">
          View and manage all complaints assigned to{" "}
          {department && <span className="font-semibold">{department}</span>}
        </p>
      </div>

      {/* Filters */}
      <ComplaintsFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        severityFilter={severityFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        onSeverityChange={setSeverityFilter}
        showCategoryFilter={false}
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
