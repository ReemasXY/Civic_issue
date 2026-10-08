import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import axios from "axios";

import ComplaintDetail from "./MyComplaints/ComplaintDetail";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import StatsCard from "../../components/Dashboard/StatsCard";
import RecentComplaintsList from "../../components/Dashboard/RecentComplaintsList";
import RecentNotifications from "../../components/Dashboard/RecentNotifications";

export default function Dashboard() {
  const username = localStorage.getItem("username") || "User";
  const navigate = useNavigate();

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

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [allComplaints, setAllComplaints] = useState([]);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          "/api/reports/dashboard",
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const { stats: apiStats, recentReports } = response.data;

          const pending = Number(apiStats.pending) || 0;
          const verified = Number(apiStats.verified) || 0;
          const inProgress = Number(apiStats.inProgress) || 0;
          const resolved = Number(apiStats.resolved) || 0;

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
            imageUrl: `${report.image_url}`,
          }));

          setRecentComplaints(formattedReports);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

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

  const handleViewComplaintFromNotification = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetail(true);
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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-white p-4 sm:p-6 lg:p-8 lg:px-10">
      <DashboardHeader username={username} showNotifications={true} userRole="citizen" />

      <div className="mb-8 grid min-w-0 grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <RecentComplaintsList
          complaints={recentComplaints}
          allComplaints={allComplaints}
          getStatusStyles={getStatusStyles}
          onViewDetails={handleViewDetails}
        />

        <RecentNotifications onViewComplaint={handleViewComplaintFromNotification} />
      </div>
    </div>
  );
}