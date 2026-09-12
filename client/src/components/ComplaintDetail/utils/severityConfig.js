export const getSeverityConfig = (severity) => {
  const configs = {
    critical: {
      bgColor: "bg-red-500",
      textColor: "text-white",
    },
    high: {
      bgColor: "bg-orange-500",
      textColor: "text-white",
    },
    medium: {
      bgColor: "bg-yellow-500",
      textColor: "text-white",
    },
    low: {
      bgColor: "bg-green-500",
      textColor: "text-white",
    },
  };

  return configs[severity?.toLowerCase()] || { bgColor: "bg-gray-500", textColor: "text-white" };
};
