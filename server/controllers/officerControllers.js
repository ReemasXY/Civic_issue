import pool from "../config/dbConnection.js";
import { sendNotificationToUser } from "../websocket/notificationSocket.js";

// Statuses an officer is allowed to set a report to.
const ALLOWED_STATUSES = ["pending", "verified", "in-progress", "resolved", "rejected"];

// Which statuses a report is allowed to move to, from its current status.
// An empty array means that status is terminal — no further changes allowed.
const STATUS_TRANSITIONS = {
  pending: ["verified", "rejected"],
  verified: ["in-progress", "resolved"],
  "in-progress": ["resolved"],
  resolved: [],
  rejected: [],
};

// Only these statuses make an officer the handler of a report.
// Later steps (in-progress, resolved) never change who the handler is.
const HANDLER_ASSIGNING_STATUSES = ["verified", "rejected"];

// What to write into the `notifications` table for each status an officer
// can set. Keep `type` in sync with the CHECK constraint on that table,
// and the title/message text in sync with STATUS_META in the citizen's
// Notifications.jsx (once it reads from the real table instead of static
// data), so what officers write matches what citizens see.
const STATUS_NOTIFICATION_META = {
  verified: {
    type: "report_verified",
    title: "Report Verified",
    message: (reportTitle) =>
      `Your report "${reportTitle}" has been verified and assigned to a department.`,
  },
  "in-progress": {
    type: "report_in_progress",
    title: "Work In Progress",
    message: (reportTitle) =>
      `Officers are actively working on "${reportTitle}".`,
  },
  resolved: {
    type: "report_resolved",
    title: "Report Resolved",
    message: (reportTitle) => `Your report "${reportTitle}" has been resolved.`,
  },
  rejected: {
    type: "report_rejected",
    title: "Report Rejected",
    message: (reportTitle) =>
      `Your report "${reportTitle}" was not accepted. Click to view details.`,
  },
};

/**
 * Get dashboard data for officers
 * Returns complaints in the officer's department that are either still
 * unhandled (handled_by IS NULL) or handled by this officer.
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

    // Get officer's department (officers now live in their own table)
    const officerQuery = `
      SELECT department FROM officers WHERE user_id = $1
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

    // Get statistics grouped by status. A report counts for this officer
    // only if nobody is handling it yet, or this officer is the handler.
    const statsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'verified') as verified,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) as total
      FROM reports
      WHERE assigned_department = $1
        AND (handled_by IS NULL OR handled_by = $2)
    `;

    const statsResult = await pool.query(statsQuery, [department, user_id]);
    const stats = statsResult.rows[0];

    // Get recent reports (up to 3 most recent) visible to this officer
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
    handled_by,
    created_at,
    updated_at
  FROM reports
  WHERE assigned_department = $1
    AND (handled_by IS NULL OR handled_by = $2)
  ORDER BY created_at DESC
  LIMIT 3
`;

    const reportsResult = await pool.query(reportsQuery, [department, user_id]);
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
 * Get all complaints visible to the officer: unhandled ones in their
 * department, plus every complaint this officer is handling.
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

    // Get officer's department (officers now live in their own table)
    const officerQuery = `
      SELECT department FROM officers WHERE user_id = $1
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

    // Get all complaints visible to this officer
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
        handled_by,
        created_at,
        updated_at
      FROM reports
      WHERE assigned_department = $1
        AND (handled_by IS NULL OR handled_by = $2)
      ORDER BY created_at DESC
    `;

    const complaintsResult = await pool.query(complaintsQuery, [department, user_id]);
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

/**
 * Update the status of a complaint in the officer's department.
 * PATCH /api/officer/complaints/:id/status
 * When status is "rejected", body must include rejection_reason —
 * that reason gets logged in `rejected_complaints`.
 *
 * Status changes must also follow STATUS_TRANSITIONS — a report can only
 * move to a status that's a valid "next step" from its current status.
 *
 * Handler rules: an unhandled report (handled_by IS NULL) can be verified
 * or rejected by any officer in the department, and whoever does so becomes
 * its handler. After that, only the handler can change its status.
 */
export const updateComplaintStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user?.user_id;
    const user_role = req.user?.role;
    const { id: report_id } = req.params;
    const { status, rejection_reason } = req.body;

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

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    if (status === "rejected" && !rejection_reason?.trim()) {
      return res.status(400).json({
        success: false,
        error: "A rejection reason is required when rejecting a report.",
      });
    }

    // Look up the officer's department
    const officerResult = await client.query(
      `SELECT department FROM officers WHERE user_id = $1`,
      [user_id]
    );

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Officer not found.",
      });
    }

    const department = officerResult.rows[0].department;

    if (!department || department.toLowerCase() === "none") {
      return res.status(403).json({
        success: false,
        error: "No department assigned to this officer.",
      });
    }

    await client.query("BEGIN");

    // Look up the report's current status first — this is what lets us
    // enforce the transition rules below. It's scoped to the officer's
    // department AND to reports that are unhandled or handled by this
    // officer, so another officer's report gives a clean 404.
    const statusCheckResult = await client.query(
      `SELECT status FROM reports
       WHERE report_id = $1
         AND assigned_department = $2
         AND (handled_by IS NULL OR handled_by = $3)`,
      [report_id, department, user_id]
    );

    if (statusCheckResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error:
          "Complaint not found, or it is being handled by another officer.",
      });
    }

    const currentStatus = statusCheckResult.rows[0].status;

    // Enforce the status transition rules — a report can only move to a
    // status that's a valid "next step" from where it currently is.
    // (rejected/resolved have an empty allowed list, so they're terminal.)
    const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      await client.query("ROLLBACK");

      const isTerminal = allowedNextStatuses.length === 0;

      return res.status(400).json({
        success: false,
        error: isTerminal
          ? `This report is already "${currentStatus}" and cannot be updated further.`
          : `Cannot change status from "${currentStatus}" to "${status}".`,
      });
    }

    // Verifying or rejecting makes this officer the handler. For any other
    // status we pass null, so COALESCE keeps the existing handler.
    const handlerId = HANDLER_ASSIGNING_STATUSES.includes(status)
      ? user_id
      : null;

    // Now update the report since the transition is valid. The handled_by
    // condition in WHERE also protects against two officers verifying the
    // same report at the same moment — only the first one gets a row back.
    const updateResult = await client.query(
      `UPDATE reports
       SET status = $1,
           handled_by = COALESCE(handled_by, $4::uuid),
           updated_at = CURRENT_TIMESTAMP
       WHERE report_id = $2
         AND assigned_department = $3
         AND (handled_by IS NULL OR handled_by = $5)
       RETURNING *`,
      [status, report_id, department, handlerId, user_id]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        error:
          "Complaint not found, or it is being handled by another officer.",
      });
    }

    // Log the rejection with its reason. ON CONFLICT covers the edge
    // case where a report is rejected, changed, then rejected again.
    if (status === "rejected") {
      await client.query(
        `INSERT INTO rejected_complaints (report_id, rejected_by, reason)
         VALUES ($1, $2, $3)
         ON CONFLICT (report_id) DO UPDATE SET
           rejected_by = EXCLUDED.rejected_by,
           reason = EXCLUDED.reason,
           rejected_at = CURRENT_TIMESTAMP`,
        [report_id, user_id, rejection_reason.trim()]
      );
    }

    // Record this status change as a notification for the citizen who
    // filed the report, so they see what the officer did and when.
    const updatedReport = updateResult.rows[0];
    const notificationMeta = STATUS_NOTIFICATION_META[status];
    let insertedNotification = null;

    if (notificationMeta) {
      const message = notificationMeta.message(updatedReport.title);

      const notificationResult = await client.query(
        `INSERT INTO notifications (user_id, report_id, type, title, message)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          updatedReport.user_id,
          updatedReport.report_id,
          notificationMeta.type,
          notificationMeta.title,
          message,
        ]
      );

      insertedNotification = notificationResult.rows[0];
    }

    await client.query("COMMIT");

    // Push the new notification over WebSocket only after the commit
    // succeeds — no point telling the citizen about something that
    // ended up rolled back.
    if (insertedNotification) {
      sendNotificationToUser(insertedNotification.user_id, insertedNotification);
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      report: updateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Error in updateComplaintStatus:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while updating status.",
      details: error.message,
    });
  } finally {
    client.release();
  }
};