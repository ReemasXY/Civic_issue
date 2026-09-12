import FilterDropdown from "./FilterDropdown";

export default function ComplaintsFilters({
  statusFilter,
  categoryFilter,
  severityFilter,
  onStatusChange,
  onCategoryChange,
  onSeverityChange,
  showCategoryFilter = true,
}) {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Pothole", label: "Pothole" },
    { value: "Garbage / Waste", label: "Garbage / Waste" },
    { value: "Water Supply", label: "Water Supply" },
    { value: "Drainage", label: "Drainage" },
    { value: "Road Damage", label: "Road Damage" },
  ];

  const severityOptions = [
    { value: "all", label: "All Severity" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <FilterDropdown
        label="Status"
        value={statusFilter}
        onChange={onStatusChange}
        options={statusOptions}
      />

      {showCategoryFilter && (
        <FilterDropdown
          label="Category"
          value={categoryFilter}
          onChange={onCategoryChange}
          options={categoryOptions}
        />
      )}

      <FilterDropdown
        label="Severity"
        value={severityFilter}
        onChange={onSeverityChange}
        options={severityOptions}
      />
    </div>
  );
}
