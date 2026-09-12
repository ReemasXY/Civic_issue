import pool from "../config/dbConnection.js";

/**
 * Get dashboard data for officers
 * Returns complaints assigned to the officer's department
 */
export const getOfficerDashboardData = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const user_role = req.user?.role;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    if (user_role !== "officer") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Officer role required.",
      });
    }

    // Get officer's department
    const officerQuery = `
      SELECT department FROM users WHERE user_id = $1
    `;
    const officerResult = await pool.query(officerQuery, [user_id]);

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Officer not found.",
      });
    }

    const department = officerResult.rows[0].department;

    // Check if department is assigned (not NULL or 'none')
    if (!department || department.toLowerCase() === 'none') {
      return res.status(200).json({
        success: true,
        department: null,
        stats: {
          total: 0,
          pending: 0,
          verified: 0,
          inProgress: 0,
          resolved: 0,
        },
        recentReports: [],
        message: "No department assigned to this officer.",
      });
    }

    // Get statistics grouped by status for this department
    const statsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'verified') as verified,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) as total
      FROM reports
      WHERE assigned_department = $1
    `;

    const statsResult = await pool.query(statsQuery, [department]);
    const stats = statsResult.rows[0];

    // Get recent reports (last 3) for this department
    const reportsQuery = `
      SELECT
        report_id,
        title,
        description,
        category,
        location_short_label,
        location_full_label,
        latitude,
        longitude,
        image_url,
        status,
        severity_level,
        assigned_department,
        created_at,
        updated_at
      FROM reports
      WHERE assigned_department = $1
      ORDER BY created_at DESC
      LIMIT 3
    `;

    const reportsResult = await pool.query(reportsQuery, [department]);
    const recentReports = reportsResult.rows;

    return res.status(200).json({
      success: true,
      department,
      stats: {
        total: parseInt(stats.total, 10),
        pending: parseInt(stats.pending, 10),
        verified: parseInt(stats.verified, 10),
        inProgress: parseInt(stats.in_progress, 10),
        resolved: parseInt(stats.resolved, 10),
      },
      recentReports,
    });
  } catch (error) {
    console.error("❌ Error in getOfficerDashboardData:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching dashboard data.",
      details: error.message,
    });
  }
};

/**
 * Get all complaints assigned to the officer's department
 * Returns all complaints for the department (not just recent 3)
 */
export const getOfficerComplaints = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const user_role = req.user?.role;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    if (user_role !== "officer") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Officer role required.",
      });
    }

    // Get officer's department
    const officerQuery = `
      SELECT department FROM users WHERE user_id = $1
    `;
    const officerResult = await pool.query(officerQuery, [user_id]);

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Officer not found.",
      });
    }

    const department = officerResult.rows[0].department;

    // Check if department is assigned (not NULL or 'none')
    if (!department || department.toLowerCase() === 'none') {
      return res.status(200).json({
        success: true,
        department: null,
        complaints: [],
        message: "No department assigned to this officer.",
      });
    }

    // Get all complaints for this department
    const complaintsQuery = `
      SELECT
        report_id,
        title,
        description,
        category,
        location_short_label,
        location_full_label,
        latitude,
        longitude,
        image_url,
        status,
        severity_level,
        assigned_department,
        created_at,
        updated_at
      FROM reports
      WHERE assigned_department = $1
      ORDER BY created_at DESC
    `;

    const complaintsResult = await pool.query(complaintsQuery, [department]);
    const complaints = complaintsResult.rows;

    return res.status(200).json({
      success: true,
      department,
      complaints,
    });
  } catch (error) {
    console.error("❌ Error in getOfficerComplaints:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching complaints.",
      details: error.message,
    });
  }
};
