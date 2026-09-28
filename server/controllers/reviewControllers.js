import pool from "../config/dbConnection.js";

// Quick-feedback chips the citizen can pick. Keep in sync with TAG_OPTIONS
// in the frontend Reviews.jsx.
const ALLOWED_TAGS = [
  "Quick response",
  "Quality of work",
  "Solved the issue fully",
  "Worked efficiently",
];

const ensureCitizen = (req, res) => {
  if (!req.user?.user_id) {
    res.status(401).json({ success: false, error: "User not authenticated." });
    return false;
  }
  if (req.user.role !== "citizen") {
    res.status(403).json({ success: false, error: "Citizen role required." });
    return false;
  }
  return true;
};

/**
 * GET /api/reviews/pending
 * Resolved complaints of this citizen that have no review yet.
 */
export const getPendingReviews = async (req, res) => {
  try {
    if (!ensureCitizen(req, res)) return;

    const result = await pool.query(
      `SELECT
         r.report_id,
         r.title,
         r.location_short_label,
         r.updated_at AS resolved_at,
         o.username   AS officer_name,
         o.department AS officer_department
       FROM reports r
       LEFT JOIN officers o ON o.user_id = r.handled_by
       LEFT JOIN reviews rv ON rv.report_id = r.report_id
       WHERE r.user_id = $1
         AND r.status = 'resolved'
         AND rv.review_id IS NULL
       ORDER BY r.updated_at DESC`,
      [req.user.user_id]
    );

    return res.status(200).json({ success: true, pending: result.rows });
  } catch (error) {
    console.error("❌ Error in getPendingReviews:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching complaints to review.",
    });
  }
};

/**
 * GET /api/reviews/mine
 * Reviews this citizen has already given.
 */
export const getMyReviews = async (req, res) => {
  try {
    if (!ensureCitizen(req, res)) return;

    const result = await pool.query(
      `SELECT
         rv.review_id,
         rv.rating,
         rv.tags,
         rv.comment,
         rv.created_at,
         r.title,
         o.username AS officer_name
       FROM reviews rv
       JOIN reports r ON r.report_id = rv.report_id
       LEFT JOIN officers o ON o.user_id = rv.officer_id
       WHERE rv.citizen_id = $1
       ORDER BY rv.created_at DESC`,
      [req.user.user_id]
    );

    return res.status(200).json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error("❌ Error in getMyReviews:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching your reviews.",
    });
  }
};

/**
 * POST /api/reviews
 * Body: { report_id, rating (1-5), tags: [], comment }
 */
export const createReview = async (req, res) => {
  try {
    if (!ensureCitizen(req, res)) return;

    const user_id = req.user.user_id;
    const { report_id, rating, tags = [], comment = "" } = req.body;

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be a whole number from 1 to 5.",
      });
    }

    const cleanTags = Array.isArray(tags)
      ? tags.filter((t) => ALLOWED_TAGS.includes(t))
      : [];
    const cleanComment = String(comment).trim().slice(0, 500);

    // The report must belong to this citizen and be resolved.
    const reportResult = await pool.query(
      `SELECT report_id, status, handled_by
       FROM reports
       WHERE report_id = $1 AND user_id = $2`,
      [report_id, user_id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found.",
      });
    }

    const report = reportResult.rows[0];

    if (report.status !== "resolved") {
      return res.status(400).json({
        success: false,
        error: "You can only review a complaint after it is resolved.",
      });
    }

    const insertResult = await pool.query(
      `INSERT INTO reviews (report_id, citizen_id, officer_id, rating, tags, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [report_id, user_id, report.handled_by, ratingNum, cleanTags, cleanComment || null]
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted.",
      review: insertResult.rows[0],
    });
  } catch (error) {
    // 23505 = unique violation: this complaint already has a review
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "You have already reviewed this complaint.",
      });
    }
    // 22P02 = invalid UUID in report_id
    if (error.code === "22P02") {
      return res.status(400).json({
        success: false,
        error: "Invalid complaint id.",
      });
    }

    console.error("❌ Error in createReview:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while submitting your review.",
    });
  }
};