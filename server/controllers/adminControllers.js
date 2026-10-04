import bcrypt from "bcrypt";
import pool from "../config/dbConnection.js";

const ensureAdmin = (req, res) => {
  if (!req.user?.user_id) {
    res.status(401).json({ success: false, error: "User not authenticated." });
    return false;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ success: false, error: "Admin role required." });
    return false;
  }
  return true;
};
const COMPLAINT_STATUSES = ["pending", "verified", "in-progress", "resolved", "rejected"];
const COMPLAINT_SEVERITIES = ["Low", "Medium", "High", "Critical"];

/**
 * GET /api/admin/overview
 * City-wide stats, 30-day new-vs-resolved trend, 30-day hotspot areas,
 * and breakdowns for the admin dashboard.
 */
export const getAdminOverview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    // Top stat cards
    const statsResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'pending' AND handled_by IS NULL)::int AS unclaimed,
         COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM reports`
    );

    // New vs resolved reports per day, last 30 days.
    // generate_series guarantees one row per day, even days with no
    // activity, so the line chart has no gaps.
    const dailyTrendResult = await pool.query(
      `SELECT
         gs.day::date AS day,
         COALESCE(n.count, 0)::int AS new_reports,
         COALESCE(r.count, 0)::int AS resolved
       FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') AS gs(day)
       LEFT JOIN (
         SELECT DATE(created_at) AS d, COUNT(*) AS count
         FROM reports
         WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
         GROUP BY DATE(created_at)
       ) n ON n.d = gs.day::date
       LEFT JOIN (
         SELECT DATE(resolved_at) AS d, COUNT(*) AS count
         FROM reports
         WHERE resolved_at IS NOT NULL
           AND resolved_at >= CURRENT_DATE - INTERVAL '29 days'
         GROUP BY DATE(resolved_at)
       ) r ON r.d = gs.day::date
       ORDER BY gs.day`
    );

    // Hotspot areas: the 5 neighbourhoods with the most reports created
    // in the last 30 days (same window as the chart above).
    const hotspotResult = await pool.query(
      `SELECT
         MIN(TRIM(location_short_label)) AS area,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status NOT IN ('resolved', 'rejected'))::int AS open
       FROM reports
       WHERE location_short_label IS NOT NULL
         AND TRIM(location_short_label) <> ''
         AND created_at >= CURRENT_DATE - INTERVAL '29 days'
       GROUP BY LOWER(TRIM(location_short_label))
       ORDER BY total DESC, open DESC, area ASC
       LIMIT 5`
    );

    // Complaints by category
    const categoryResult = await pool.query(
      `SELECT category, COUNT(*)::int AS count
       FROM reports
       WHERE category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC
       LIMIT 8`
    );

    // Departments: total vs resolved
    const departmentResult = await pool.query(
      `SELECT
         assigned_department AS department,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
       FROM reports
       WHERE assigned_department IS NOT NULL
         AND assigned_department != 'none'
       GROUP BY assigned_department
       ORDER BY total DESC`
    );

    // Severity breakdown
    const severityResult = await pool.query(
      `SELECT severity_level, COUNT(*)::int AS count
       FROM reports
       WHERE severity_level IS NOT NULL
       GROUP BY severity_level`
    );

    const severityOrder = ["Low", "Medium", "High", "Critical"];
    const severityMap = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    severityResult.rows.forEach((row) => {
      if (severityMap[row.severity_level] !== undefined) {
        severityMap[row.severity_level] = row.count;
      }
    });
    const severity = severityOrder.map((level) => ({
      level,
      count: severityMap[level],
    }));

    // Average resolution time (in days), by week, last 6 weeks
    const resolutionTrendResult = await pool.query(
      `SELECT
         DATE_TRUNC('week', resolved_at)::date AS week,
         AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400)::float AS avg_days
       FROM reports
       WHERE resolved_at IS NOT NULL
         AND resolved_at >= CURRENT_DATE - INTERVAL '6 weeks'
       GROUP BY week
       ORDER BY week`
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      stats: {
        total: stats.total,
        unclaimed: stats.unclaimed,
        inProgress: stats.in_progress,
        resolved: stats.resolved,
        rejected: stats.rejected,
      },
      dailyTrend: dailyTrendResult.rows.map((row) => ({
        day: row.day,
        newReports: row.new_reports,
        resolved: row.resolved,
      })),
      hotspots: hotspotResult.rows,
      byCategory: categoryResult.rows,
      byDepartment: departmentResult.rows,
      severity,
      resolutionTrend: resolutionTrendResult.rows.map((row) => ({
        week: row.week,
        avgDays: row.avg_days ? Number(row.avg_days.toFixed(1)) : 0,
      })),
    });
  } catch (error) {
    console.error("❌ Error in getAdminOverview:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching the overview.",
    });
  }
};

/**
 * GET /api/admin/officers
 * Every officer with their workload and rating.
 *  - openCases:     handled by the officer, not yet resolved or rejected
 *  - resolvedCases: handled by the officer and resolved
 *  - rating:        average review rating (null when never reviewed)
 */
export const getAdminOfficers = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const result = await pool.query(
      `SELECT
         o.user_id,
         o.username,
         o.email,
         o.phone_number,
         o.department,
         COALESCE(o.is_active, true) AS is_active,
         COALESCE(rs.open_cases, 0)::int AS open_cases,
         COALESCE(rs.resolved_cases, 0)::int AS resolved_cases,
         rv.avg_rating,
         COALESCE(rv.review_count, 0)::int AS review_count
       FROM officers o
       LEFT JOIN (
         SELECT
           handled_by,
           COUNT(*) FILTER (WHERE status NOT IN ('resolved', 'rejected')) AS open_cases,
           COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_cases
         FROM reports
         WHERE handled_by IS NOT NULL
         GROUP BY handled_by
       ) rs ON rs.handled_by = o.user_id
       LEFT JOIN (
         SELECT
           officer_id,
           AVG(rating)::float AS avg_rating,
           COUNT(*) AS review_count
         FROM reviews
         WHERE officer_id IS NOT NULL
         GROUP BY officer_id
       ) rv ON rv.officer_id = o.user_id
       ORDER BY o.is_active DESC, o.username ASC`
    );

    const officers = result.rows.map((row) => ({
      userId: row.user_id,
      username: row.username,
      email: row.email,
      phoneNumber: row.phone_number,
      department: row.department,
      isActive: row.is_active,
      openCases: row.open_cases,
      resolvedCases: row.resolved_cases,
      rating: row.avg_rating != null ? Number(row.avg_rating.toFixed(1)) : null,
      reviewCount: row.review_count,
    }));

    return res.status(200).json({ success: true, officers });
  } catch (error) {
    console.error("❌ Error in getAdminOfficers:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching officers.",
    });
  }
};

/**
 * Is this email / username / phone already used by a citizen, officer or
 * admin? Postgres can't enforce UNIQUE across tables, so we check all three.
 */
const isTaken = async (column, value) => {
  if (!["email", "username", "phone_number"].includes(column)) {
    throw new Error("Invalid column");
  }
  const result = await pool.query(
    `SELECT user_id FROM citizens WHERE ${column} = $1
     UNION ALL
     SELECT user_id FROM officers WHERE ${column} = $1
     UNION ALL
     SELECT user_id FROM admins WHERE ${column} = $1`,
    [value]
  );
  return result.rows.length > 0;
};

/**
 * POST /api/admin/officers
 * Body: { username, email, phone_number, department, password }
 *
 * Input shape is already checked and trimmed by createOfficerValidator
 * (middleware/validation.js), so this only checks for duplicates across
 * the three account tables and inserts the officer with a hashed password.
 */
export const createOfficer = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { username, email, phone_number, department, password } = req.body;

    if (await isTaken("email", email)) {
      return res.status(409).json({
        success: false,
        error: "Email is already registered.",
      });
    }
    if (await isTaken("username", username)) {
      return res.status(409).json({
        success: false,
        error: "Username is already taken.",
      });
    }
    if (await isTaken("phone_number", phone_number)) {
      return res.status(409).json({
        success: false,
        error: "Phone number is already registered.",
      });
    }

    const saltRounds = process.env.SALT_ROUNDS || 10;
    const salt = await bcrypt.genSalt(Number(saltRounds));
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO officers (email, username, phone_number, password_hash, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, email, username, phone_number, department`,
      [email, username, phone_number, password_hash, department]
    );

    const row = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Officer added.",
      officer: {
        userId: row.user_id,
        username: row.username,
        email: row.email,
        phoneNumber: row.phone_number,
        department: row.department,
      },
    });
  } catch (error) {
    // Unique violation (race between the check above and the insert)
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "An account with those details already exists.",
      });
    }
    console.error("❌ Error in createOfficer:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while creating the officer.",
    });
  }
};

/**
 * PATCH /api/admin/officers/:officerId/deactivate
 * Soft delete: deactivate an officer account (set is_active = false).
 * If they have open cases (verified or in-progress), those are reset to
 * pending and the affected citizens are notified.
 */
export const deactivateOfficer = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;

    const { officerId } = req.params;

    await client.query("BEGIN");

    // Check if officer exists and is active
    const officerResult = await client.query(
      `SELECT user_id, username, is_active FROM officers WHERE user_id = $1`,
      [officerId]
    );

    if (officerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "Officer not found.",
      });
    }

    const officer = officerResult.rows[0];

    if (!officer.is_active) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: "Officer is already deactivated.",
      });
    }

    // Find all open cases (verified or in-progress) handled by this officer
    const openCasesResult = await client.query(
      `SELECT report_id, user_id, title, status
       FROM reports
       WHERE handled_by = $1
         AND status IN ('verified', 'in-progress')`,
      [officerId]
    );

    const openCases = openCasesResult.rows;
    const affectedCount = openCases.length;

    // Reset open cases to pending and unassign them
    if (affectedCount > 0) {
      await client.query(
        `UPDATE reports
         SET status = 'pending', handled_by = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE handled_by = $1
           AND status IN ('verified', 'in-progress')`,
        [officerId]
      );

      // Create notifications for affected citizens
      const notificationValues = openCases.map((complaint) => {
        return `(
          '${complaint.user_id}',
          '${complaint.report_id}',
          'report_in_progress',
          'Officer Account Deactivated',
          'The officer handling your complaint "${complaint.title}" has been deactivated. Your complaint has been returned to pending status and will be reassigned soon.'
        )`;
      });

      if (notificationValues.length > 0) {
        await client.query(
          `INSERT INTO notifications (user_id, report_id, type, title, message)
           VALUES ${notificationValues.join(", ")}`
        );
      }
    }

    // Deactivate the officer
    await client.query(
      `UPDATE officers SET is_active = false WHERE user_id = $1`,
      [officerId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        affectedCount > 0
          ? `Officer ${officer.username} has been deactivated. ${affectedCount} open case(s) have been reset to pending and affected citizens have been notified.`
          : `Officer ${officer.username} has been deactivated.`,
      affectedCases: affectedCount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in deactivateOfficer:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while deactivating the officer.",
    });
  } finally {
    client.release();
  }
};

/**
 * PATCH /api/admin/officers/:officerId/activate
 * Reactivate a deactivated officer account (set is_active = true).
 * Allows the officer to log in again.
 */
export const activateOfficer = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { officerId } = req.params;

    // Check if officer exists and is inactive
    const officerResult = await pool.query(
      `SELECT user_id, username, is_active FROM officers WHERE user_id = $1`,
      [officerId]
    );

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Officer not found.",
      });
    }

    const officer = officerResult.rows[0];

    if (officer.is_active) {
      return res.status(400).json({
        success: false,
        error: "Officer is already active.",
      });
    }

    // Activate the officer
    await pool.query(
      `UPDATE officers SET is_active = true WHERE user_id = $1`,
      [officerId]
    );

    return res.status(200).json({
      success: true,
      message: `Officer ${officer.username} has been reactivated and can now log in.`,
    });
  } catch (error) {
    console.error("❌ Error in activateOfficer:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while activating the officer.",
    });
  }
};



/**
 * GET /api/admin/complaints
 * Every complaint in the city, newest first.
 * Query params: page, limit, search, status, department, severity
 */
export const getAdminComplaints = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;

    const { search, status, department, severity } = req.query;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      // Escape LIKE wildcards so "50%" or "_" are searched literally
      const term = `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`;
      params.push(term);
      const i = params.length;
      conditions.push(
        `(r.title ILIKE $${i} OR r.category ILIKE $${i}
          OR r.location_short_label ILIKE $${i}
          OR r.location_full_label ILIKE $${i})`
      );
    }

    if (status && COMPLAINT_STATUSES.includes(status)) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (department) {
      params.push(department);
      conditions.push(`r.assigned_department = $${params.length}`);
    }

    if (severity && COMPLAINT_SEVERITIES.includes(severity)) {
      params.push(severity);
      conditions.push(`r.severity_level = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM reports r ${where}`,
      params
    );
    const total = countResult.rows[0].total;

    const listParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT
         r.report_id,
         r.title,
         r.description,
         r.category,
         r.assigned_department,
         r.severity_level,
         r.status,
         r.image_url,
         r.location_short_label,
         r.location_full_label,
         r.created_at,
         r.resolved_at,
         c.username AS citizen_name,
         o.username AS officer_name,
         rc.reason  AS rejection_reason
       FROM reports r
       LEFT JOIN citizens c ON c.user_id = r.user_id
       LEFT JOIN officers o ON o.user_id = r.handled_by
       LEFT JOIN rejected_complaints rc ON rc.report_id = r.report_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return res.status(200).json({
      success: true,
      complaints: result.rows.map((row) => ({
        id: row.report_id,
        title: row.title,
        description: row.description,
        category: row.category,
        department: row.assigned_department,
        severity: row.severity_level,
        status: row.status,
        imageUrl: row.image_url,
        locationShort: row.location_short_label,
        locationFull: row.location_full_label,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
        citizen: row.citizen_name,
        officer: row.officer_name,
        rejectionReason: row.rejection_reason,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("❌ Error in getAdminComplaints:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching complaints.",
    });
  }
};

const DEPARTMENT_NAMES = [
  "Public Works Department",
  "Water Supply Department",
  "Environment Management Department",
];

/**
 * GET /api/admin/departments
 * Per-department comparison: complaints by status and severity,
 * resolved rate, average days to resolve and active officers.
 */
export const getAdminDepartments = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const reportResult = await pool.query(
      `SELECT
         assigned_department AS department,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'verified')::int AS verified,
         COUNT(*) FILTER (WHERE status = 'in-progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
         COUNT(*) FILTER (WHERE severity_level = 'Critical')::int AS critical,
         COUNT(*) FILTER (WHERE severity_level = 'High')::int AS high,
         COUNT(*) FILTER (WHERE severity_level = 'Medium')::int AS medium,
         COUNT(*) FILTER (WHERE severity_level = 'Low')::int AS low,
         (AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400)
           FILTER (WHERE status = 'resolved' AND resolved_at IS NOT NULL))::float AS avg_days
       FROM reports
       WHERE assigned_department = ANY($1)
       GROUP BY assigned_department`,
      [DEPARTMENT_NAMES]
    );

    const officerResult = await pool.query(
      `SELECT
         department,
         COUNT(*) FILTER (WHERE COALESCE(is_active, true))::int AS active_officers
       FROM officers
       WHERE department = ANY($1)
       GROUP BY department`,
      [DEPARTMENT_NAMES]
    );

    const reportsByDept = new Map(reportResult.rows.map((r) => [r.department, r]));
    const officersByDept = new Map(
      officerResult.rows.map((r) => [r.department, r.active_officers])
    );

    const departments = DEPARTMENT_NAMES.map((name) => {
      const r = reportsByDept.get(name);
      const total = r?.total || 0;
      const resolved = r?.resolved || 0;

      return {
        name,
        total,
        byStatus: {
          pending: r?.pending || 0,
          verified: r?.verified || 0,
          inProgress: r?.in_progress || 0,
          resolved,
          rejected: r?.rejected || 0,
        },
        bySeverity: {
          critical: r?.critical || 0,
          high: r?.high || 0,
          medium: r?.medium || 0,
          low: r?.low || 0,
        },
        resolvedRate: total ? Math.round((resolved / total) * 100) : 0,
        avgDays: r?.avg_days != null ? Number(r.avg_days.toFixed(1)) : null,
        activeOfficers: officersByDept.get(name) || 0,
      };
    });

    const totalComplaints = departments.reduce((sum, d) => sum + d.total, 0);
    const totalResolved = departments.reduce(
      (sum, d) => sum + d.byStatus.resolved,
      0
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalComplaints,
        resolvedRate: totalComplaints
          ? Math.round((totalResolved / totalComplaints) * 100)
          : 0,
        activeOfficers: departments.reduce((sum, d) => sum + d.activeOfficers, 0),
      },
      departments,
    });
  } catch (error) {
    console.error("❌ Error in getAdminDepartments:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching departments.",
    });
  }
};
