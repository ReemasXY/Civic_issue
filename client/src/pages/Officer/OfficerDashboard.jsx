import { useState, useEffect } from "react";
import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import axios from "axios";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import StatsCard from "../../components/Dashboard/StatsCard";
import RecentComplaintsList from "../../components/Dashboard/RecentComplaintsList";
import ComplaintCompletionChart from "../../components/Dashboard/ComplaintCompletionChart";
import OfficerComplaintDetail from "./OfficerComplaintDetail";

export default function OfficerDashboard() {
  const username = localStorage.getItem("username") || "Officer";

  const [stats, setStats] = useState([
    {
      label: "Pending",
      value: "0",
      icon: FiClock,
      iconColor: "text-teal-600",
    },
    {
      label: "Verified",
      value: "0",
      icon: FiShield,
      iconColor: "text-teal-600",
    },
    {
      label: "In Progress",
      value: "0",
      icon: FiRefreshCw,
      iconColor: "text-teal-600",
    },
    {
      label: "Resolved",
      value: "0",
      icon: FiCheckCircle,
      iconColor: "text-teal-600",
    },
  ]);

  const [completionData, setCompletionData] = useState([
    {
      name: "Resolved",
      value: 0,
    },
    {
      name: "In Progress",
      value: 0,
    },
    {
      name: "Pending",
      value: 0,
    },
    {
      name: "Verified",
      value: 0,
    },
  ]);

  const [totalComplaints, setTotalComplaints] = useState(0);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [allComplaints, setAllComplaints] = useState([]);
  const [department, setDepartment] = useState(null);
  const [noDepartment, setNoDepartment] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/officer/dashboard",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const { stats: apiStats, recentReports, department: officerDept } = response.data;

          if (!officerDept) {
            setNoDepartment(true);
            return;
          }

          setDepartment(officerDept);

          const pending = Number(apiStats.pending) || 0;
          const verified = Number(apiStats.verified) || 0;
          const inProgress = Number(apiStats.inProgress) || 0;
          const resolved = Number(apiStats.resolved) || 0;

          const total = pending + verified + inProgress + resolved;

          setTotalComplaints(total);

          setStats([
            {
              label: "Pending",
              value: pending.toString(),
              icon: FiClock,
              iconColor: "text-teal-600",
            },
            {
              label: "Verified",
              value: verified.toString(),
              icon: FiShield,
              iconColor: "text-teal-600",
            },
            {
              label: "In Progress",
              value: inProgress.toString(),
              icon: FiRefreshCw,
              iconColor: "text-teal-600",
            },
            {
              label: "Resolved",
              value: resolved.toString(),
              icon: FiCheckCircle,
              iconColor: "text-teal-600",
            },
          ]);

          setCompletionData([
            {
              name: "Resolved",
              value: resolved,
            },
            {
              name: "In Progress",
              value: inProgress,
            },
            {
              name: "Pending",
              value: pending,
            },
            {
              name: "Verified",
              value: verified,
            },
          ]);

          setAllComplaints(recentReports);

          const formattedReports = recentReports.map((report) => ({
            id: report.report_id,
            title: report.title,
            location:
              report.location_short_label ||
              report.location_full_label ||
              "Location not specified",
            status: report.status,
            statusLabel: getStatusLabel(report.status),
            date: formatDate(report.created_at),
            imageUrl: `http://localhost:5000${report.image_url}`,
          }));

          setRecentComplaints(formattedReports);
        }
      } catch (error) {
        console.error("Error fetching officer dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      verified: "Verified",
      "in-progress": "In Progress",
      resolved: "Resolved",
    };

    return labels[status] || status;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-orange-500 text-white";

      case "verified":
        return "bg-blue-500 text-white";

      case "resolved":
        return "bg-green-500 text-white";

      case "pending":
        return "bg-yellow-500 text-white";

      default:
        return "bg-gray-500 text-white";
    }
  };

  const chartColors = [
    "#22C55E",
    "#F97316",
    "#EAB308",
    "#3B82F6",
  ];

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedComplaint(null);
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
  };

  if (showDetail && selectedComplaint) {
    return (
      <OfficerComplaintDetail
        complaint={selectedComplaint}
        onBack={handleBackToList}
      />
    );
  }

  if (noDepartment) {
    return (
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 lg:p-8">
        <DashboardHeader username={username} />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mb-4 text-6xl">🏢</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              No Department Assigned
            </h2>
            <p className="text-slate-500">
              Please contact your administrator to assign you to a department.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 lg:p-8">
      <DashboardHeader username={username} />

      <div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <RecentComplaintsList
          complaints={recentComplaints}
          allComplaints={allComplaints}
          getStatusStyles={getStatusStyles}
          onViewDetails={handleViewDetails}
          title="Assigned Complaints"
        />

        <ComplaintCompletionChart
          completionData={completionData}
          totalComplaints={totalComplaints}
          chartColors={chartColors}
        />
      </div>
    </div>
  );
}
