import { useState, useEffect } from "react";
import axios from "axios";
import ComplaintsFilters from "./ComplaintsFilters";
import ComplaintCard from "./ComplaintCard";
import EmptyState from "./EmptyState";
import ComplaintDetail from "./ComplaintDetail";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/reports/user",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setComplaints(response.data.reports);
          setFilteredComplaints(response.data.reports);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
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
      <ComplaintDetail
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
          My Complaints
        </h1>
        <p className="text-slate-600">
          Track and manage all your reported civic issues.
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
