import pool from "../config/dbConnection.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Duplicate detection settings. Change them here.
const DUPLICATE_RADIUS_METERS = 50; // same category within this distance

/**
 * Create a new civic issue report
 * Saves the uploaded image to server storage and records the report with image_url and status in PostgreSQL
 */
/**
 * Get dashboard statistics and recent reports for a specific user
 * Returns: total, pending, in-progress, resolved counts + recent reports list
 */
export const getDashboardData = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    // Get statistics grouped by status
    const statsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'verified') as verified,
        COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) as total
      FROM reports
      WHERE user_id = $1
    `;

    const statsResult = await pool.query(statsQuery, [user_id]);
    const stats = statsResult.rows[0];

    // Get recent reports (last 3)
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
        created_at,
        updated_at
      FROM reports
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 3
    `;

    const reportsResult = await pool.query(reportsQuery, [user_id]);
    const recentReports = reportsResult.rows;

    return res.status(200).json({
      success: true,
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
    console.error("❌ Error in getDashboardData:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching dashboard data.",
      details: error.message,
    });
  }
};

/**
 * Get all complaints for a specific user
 * Returns: all reports for the authenticated user
 */
export const getUserComplaints = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    // Reports the citizen filed + reports the citizen follows.
    // is_following tells the page which ones to mark with a badge.
    const reportsQuery = `
      SELECT
        r.report_id,
        r.title,
        r.description,
        r.category,
        r.location_short_label,
        r.location_full_label,
        r.latitude,
        r.longitude,
        r.image_url,
        r.status,
        r.severity_level,
        r.severity_score,
        r.created_at,
        r.updated_at,
        (r.user_id <> $1) AS is_following,
        (
          SELECT COUNT(*) FROM report_supporters s
          WHERE s.report_id = r.report_id
        )::int AS supporter_count
      FROM reports r
      WHERE r.user_id = $1
         OR EXISTS (
           SELECT 1 FROM report_supporters s
           WHERE s.report_id = r.report_id AND s.user_id = $1
         )
      ORDER BY r.created_at DESC
    `;

    const reportsResult = await pool.query(reportsQuery, [user_id]);
    const reports = reportsResult.rows;

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("❌ Error in getUserComplaints:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching complaints.",
      details: error.message,
    });
  }
};

/**
 * Get recent complaints for the home page (public, no auth required)
 * Returns: 6 most recent reports across all users
 */
export const getRecentComplaints = async (req, res) => {
  try {
    // Get 6 most recent reports from all users
    const reportsQuery = `
      SELECT
        report_id,
        title,
        category,
        location_short_label,
        image_url,
        status,
        created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT 6
    `;

    const reportsResult = await pool.query(reportsQuery);
    const recentComplaints = reportsResult.rows;

    return res.status(200).json({
      success: true,
      complaints: recentComplaints,
    });
  } catch (error) {
    console.error("❌ Error in getRecentComplaints:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching recent complaints.",
      details: error.message,
    });
  }
};

/**
 * Get one complaint that belongs to the logged-in user
 * GET /api/reports/:reportId
 * Used when a citizen opens a complaint from a notification.
 */
export const getComplaintById = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { reportId } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    // A citizen can open their own complaints and the ones they follow.
    const reportQuery = `
      SELECT
        r.report_id,
        r.title,
        r.description,
        r.category,
        r.location_short_label,
        r.location_full_label,
        r.latitude,
        r.longitude,
        r.image_url,
        r.status,
        r.severity_level,
        r.severity_score,
        r.created_at,
        r.updated_at,
        r.resolved_at,
        (r.user_id <> $2) AS is_following
      FROM reports r
      WHERE r.report_id = $1
        AND (
          r.user_id = $2
          OR EXISTS (
            SELECT 1 FROM report_supporters s
            WHERE s.report_id = r.report_id AND s.user_id = $2
          )
        )
    `;

    const reportResult = await pool.query(reportQuery, [reportId, user_id]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      report: reportResult.rows[0],
    });
  } catch (error) {
    // 22P02 = the id in the URL is not a valid UUID
    if (error.code === "22P02") {
      return res.status(404).json({
        success: false,
        error: "Report not found.",
      });
    }

    console.error("❌ Error in getComplaintById:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching the complaint.",
      details: error.message,
    });
  }
};

/**
 * Check whether a similar complaint already exists near a location.
 * POST /api/reports/check-duplicates
 * Body: { category, latitude, longitude }
 *
 * A complaint counts as a possible duplicate when it has the same category,
 * is within DUPLICATE_RADIUS_METERS, and is still open (pending, verified
 * or in-progress). Age does not matter. Nobody's name is returned.
 */
export const checkDuplicates = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        error: "Citizen role required.",
      });
    }

    const { category } = req.body;
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);

    // Without a category and a location there is nothing to compare.
    if (
      !category ||
      typeof category !== "string" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(200).json({ success: true, duplicates: [] });
    }

    // Size of a small search box around the point (about the radius).
    // It lets PostgreSQL skip far-away rows before doing the exact maths.
    const latDelta = DUPLICATE_RADIUS_METERS / 111320;
    const lonDelta =
      DUPLICATE_RADIUS_METERS /
      (111320 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));

    const duplicatesQuery = `
      SELECT * FROM (
        SELECT
          r.report_id,
          r.title,
          r.category,
          r.image_url,
          r.status,
          r.severity_level,
          r.location_short_label,
          r.created_at,
          (r.user_id = $4::uuid) AS is_own,
          EXISTS (
            SELECT 1 FROM report_supporters s
            WHERE s.report_id = r.report_id AND s.user_id = $4::uuid
          ) AS is_following,
          (
            SELECT COUNT(*) FROM report_supporters s
            WHERE s.report_id = r.report_id
          )::int AS supporter_count,
          ROUND(
            6371000 * 2 * ASIN(SQRT(LEAST(1.0::float8,
              POWER(SIN(RADIANS(r.latitude::float8 - $2::float8) / 2), 2) +
              COS(RADIANS($2::float8)) * COS(RADIANS(r.latitude::float8)) *
              POWER(SIN(RADIANS(r.longitude::float8 - $3::float8) / 2), 2)
            )))
          )::int AS distance_m
        FROM reports r
        WHERE r.category = $1::varchar
          AND r.latitude IS NOT NULL
          AND r.longitude IS NOT NULL
          AND r.latitude::float8  BETWEEN $2::float8 - $6::float8 AND $2::float8 + $6::float8
          AND r.longitude::float8 BETWEEN $3::float8 - $7::float8 AND $3::float8 + $7::float8
          AND r.status IN ('pending', 'verified', 'in-progress')
      ) nearby
      WHERE nearby.distance_m <= $5::int
      ORDER BY nearby.distance_m ASC, nearby.created_at DESC
      LIMIT 3
    `;

    const result = await pool.query(duplicatesQuery, [
      category.trim(),
      latitude,
      longitude,
      user_id,
      DUPLICATE_RADIUS_METERS,
      latDelta,
      lonDelta,
    ]);

    return res.status(200).json({
      success: true,
      duplicates: result.rows,
    });
  } catch (error) {
    console.error("❌ Error in checkDuplicates:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while checking for similar complaints.",
      details: error.message,
    });
  }
};

/**
 * Follow an existing complaint instead of creating a duplicate.
 * POST /api/reports/:reportId/support
 *
 * The citizen is added to report_supporters. From then on they receive the
 * same status notifications as the original reporter, and the officer sees
 * "Reported by N citizens".
 */
export const supportReport = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { reportId } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        error: "Citizen role required.",
      });
    }

    const reportResult = await pool.query(
      `SELECT report_id, user_id, status FROM reports WHERE report_id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Report not found.",
      });
    }

    const report = reportResult.rows[0];

    if (report.user_id === user_id) {
      return res.status(400).json({
        success: false,
        error: "This is your own report, so you are already following it.",
      });
    }

    if (!["pending", "verified", "in-progress"].includes(report.status)) {
      return res.status(400).json({
        success: false,
        error: "This complaint is already closed and can no longer be followed.",
      });
    }

    // ON CONFLICT: following twice is harmless.
    const insertResult = await pool.query(
      `INSERT INTO report_supporters (report_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (report_id, user_id) DO NOTHING
       RETURNING report_id`,
      [reportId, user_id]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS supporter_count
       FROM report_supporters
       WHERE report_id = $1`,
      [reportId]
    );

    return res.status(200).json({
      success: true,
      alreadyFollowing: insertResult.rows.length === 0,
      supporterCount: countResult.rows[0].supporter_count,
    });
  } catch (error) {
    // 22P02 = the id in the URL is not a valid UUID
    if (error.code === "22P02") {
      return res.status(404).json({
        success: false,
        error: "Report not found.",
      });
    }

    console.error("❌ Error in supportReport:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while following the complaint.",
      details: error.message,
    });
  }
};

export const createReport = async (req, res) => {
  try {
    console.log("========================================");
    console.log("CREATE REPORT REQUEST RECEIVED");
    console.log("========================================");

    // 1. Get authenticated user from JWT (checkToken) or from request body
    const user_id = req.user?.user_id || req.body.userId;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: ["User not authenticated. Please log in."],
      });
    }

    // 2. Extract report fields from request body
    const {
      title,
      description,
      category,
      locationShortLabel,
      locationFullLabel,
      latitude,
      longitude,
      severityScore,
      severityLevel,
    } = req.body;

    console.log("Report fields:", {
      user_id,
      title,
      category,
      severityScore,
      severityLevel,
    });

    // 3. Validation
    const errors = [];
    if (!title || title.trim() === "") errors.push("Title is required");
    if (!description || description.trim() === "") errors.push("Description is required");
    if (!category || category.trim() === "") errors.push("Category is required");
    if (!req.file) errors.push("Image is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors,
      });
    }

    // 4. Save uploaded image to filesystem
    const uploadsDir = path.join(__dirname, "..", "uploads", "reports");
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const fileExtension = path.extname(req.file.originalname) || ".jpg";
    const uniqueFilename = `${user_id}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, req.file.buffer);
    console.log("Image saved to:", filePath);

    // Relative image URL stored in the database
    const imageUrl = `/uploads/reports/${uniqueFilename}`;

    // 4.5. Determine assigned department based on category
    const categoryLower = category.trim().toLowerCase();
    let assignedDepartment = null;

    if (categoryLower === "road damage") {
      assignedDepartment = "Road Department";
    } else if (categoryLower === "streetlight damage") {
      assignedDepartment = "Public Works Department";
    } else if (categoryLower === "drainage") {
      assignedDepartment = "Water Supply Department";
    } else if (categoryLower === "garbage / waste") {
      assignedDepartment = "Environment Management Department";
    }

    console.log("Category:", category.trim(), "-> Department:", assignedDepartment);

    // 5. Insert into reports table
    const insertQuery = `
      INSERT INTO reports (
        user_id,
        title,
        description,
        category,
        location_short_label,
        location_full_label,
        latitude,
        longitude,
        image_url,
        severity_score,
        severity_level,
        status,
        assigned_department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      user_id,
      title.trim(),
      description.trim(),
      category.trim(),
      locationShortLabel || null,
      locationFullLabel || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      imageUrl,
      severityScore !== undefined && severityScore !== null && severityScore !== "" ? parseInt(severityScore, 10) : null,
      severityLevel || null,
      "pending", // Default status
      assignedDepartment,
    ];

    const result = await pool.query(insertQuery, values);
    const newReport = result.rows[0];

    console.log("Report inserted successfully! Report ID:", newReport.report_id);
    console.log("========================================");

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully!",
      report: newReport,
    });
  } catch (error) {
    console.error("❌ Error in createReport:", error);

    return res.status(500).json({
      success: false,
      error: ["An error occurred while submitting your report. Please try again."],
      details: error.message,
    });
  }
};

/**
 * Get rejection reason for a specific report
 * Returns: rejection reason from rejected_complaints table
 */
export const getRejectionReason = async (req, res) => {
  try {
    const { reportId } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    // First verify that this report belongs to the user
    const reportQuery = `
      SELECT user_id FROM reports WHERE report_id = $1
    `;
    const reportResult = await pool.query(reportQuery, [reportId]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Report not found.",
      });
    }

    if (reportResult.rows[0].user_id !== user_id) {
      // Citizens who follow the complaint may see the reason as well.
      const followerResult = await pool.query(
        `SELECT 1 FROM report_supporters WHERE report_id = $1 AND user_id = $2`,
        [reportId, user_id]
      );

      if (followerResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to view this report.",
        });
      }
    }

    // Fetch rejection reason
    const rejectionQuery = `
      SELECT reason FROM rejected_complaints WHERE report_id = $1
    `;
    const rejectionResult = await pool.query(rejectionQuery, [reportId]);

    if (rejectionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No rejection reason found for this report.",
      });
    }

    return res.status(200).json({
      success: true,
      rejectionReason: rejectionResult.rows[0].reason,
    });
  } catch (error) {
    console.error("❌ Error in getRejectionReason:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching rejection reason.",
      details: error.message,
    });
  }
};