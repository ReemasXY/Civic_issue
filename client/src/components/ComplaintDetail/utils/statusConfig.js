import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

export const getStatusConfig = (status) => {
  const configs = {
    submitted: {
      label: "Submitted",
      icon: FiCheckCircle,
      bgColor: "bg-[#5FAF8A]",
      textColor: "text-white",
      lightBg: "bg-[#EFF8F3]",
      connectorColor: "bg-[#8BC6AA]",
      description: "Your complaint has been submitted successfully.",
    },

    verified: {
      label: "Verified",
      icon: FiCheckCircle,
      bgColor: "bg-[#4F7FBF]",
      textColor: "text-white",
      lightBg: "bg-[#EFF5FC]",
      connectorColor: "bg-[#7C9FC9]",
      description: "The complaint has been verified by the authority.",
    },

    assigned: {
      label: "Assigned",
      icon: FiAlertCircle,
      bgColor: "bg-[#7774A8]",
      textColor: "text-white",
      lightBg: "bg-[#F2F1F9]",
      connectorColor: "bg-[#9895BD]",
      description: "It has been assigned to the relevant department.",
    },

    "in-progress": {
      label: "In Progress",
      icon: FiRefreshCw,
      bgColor: "bg-[#C49A55]",
      textColor: "text-white",
      lightBg: "bg-[#FBF7ED]",
      connectorColor: "bg-[#D2B477]",
      description: "The team is currently working on the issue.",
    },

    resolved: {
      label: "Resolved",
      icon: FiCheckCircle,
      bgColor: "bg-[#5FAF8A]",
      textColor: "text-white",
      lightBg: "bg-[#EFF8F3]",
      connectorColor: "bg-[#8BC6AA]",
      description: "The issue has been resolved and is under review.",
    },

    closed: {
      label: "Closed",
      icon: FiXCircle,
      bgColor: "bg-[#94A0AF]",
      textColor: "text-white",
      lightBg: "bg-[#F3F5F7]",
      connectorColor: "bg-[#B5BDC7]",
      description: "The complaint will be closed after final confirmation.",
    },

    pending: {
      label: "Pending",
      icon: FiClock,
      bgColor: "bg-[#A8B1BC]",
      textColor: "text-white",
      lightBg: "bg-[#F4F6F8]",
      connectorColor: "bg-[#D1D7DE]",
      description: "Your complaint is pending review.",
    },
  };

  return configs[status] || configs.pending;
};
