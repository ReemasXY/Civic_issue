import pool from "../config/dbConnection.js";

const ensureOfficer = (req, res) => {
  if (!req.user?.user_id) {
    res.status(401).json({ success: false, error: "User not authenticated." });
    return false;
  }
  if (req.user.role !== "officer") {
    res.status(403).json({ success: false, error: "Officer role required." });
    return false;
  }
  return true;
};

/**
 * GET /api/officer/profile
 * Officer details, average rating, rating breakdown, most common
 * feedback tags, and the officer's most recent reviews.
 */
export const getOfficerProfile = async (req, res) => {
  try {
    if (!ensureOfficer(req, res)) return;

    const user_id = req.user.user_id;

    const officerResult = await pool.query(
      `SELECT user_id, username, email, phone_number, department, created_at
       FROM officers
       WHERE user_id = $1`,
      [user_id]
    );

    if (officerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Officer not found." });
    }

    const officer = officerResult.rows[0];

    // Average rating + total review count
    const summaryResult = await pool.query(
      `SELECT
         COUNT(*)::int              AS total_reviews,
         COALESCE(AVG(rating), 0)   AS average_rating
       FROM reviews
       WHERE officer_id = $1`,
      [user_id]
    );

    const { total_reviews, average_rating } = summaryResult.rows[0];

    // Rating breakdown: how many reviews at each star value (1-5)
    const breakdownResult = await pool.query(
      `SELECT rating, COUNT(*)::int AS count
       FROM reviews
       WHERE officer_id = $1
       GROUP BY rating`,
      [user_id]
    );

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdownResult.rows.forEach((row) => {
      ratingBreakdown[row.rating] = row.count;
    });

    // Most common feedback tags, highest count first
    const tagsResult = await pool.query(
      `SELECT tag, COUNT(*)::int AS count
       FROM reviews, UNNEST(tags) AS tag
       WHERE officer_id = $1
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 6`,
      [user_id]
    );

    // Most recent reviews
    const recentReviewsResult = await pool.query(
      `SELECT
         rv.review_id,
         rv.rating,
         rv.comment,
         rv.created_at,
         r.title
       FROM reviews rv
       JOIN reports r ON r.report_id = rv.report_id
       WHERE rv.officer_id = $1
       ORDER BY rv.created_at DESC
       LIMIT 5`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      officer: {
        username: officer.username,
        email: officer.email,
        phone_number: officer.phone_number,
        department: officer.department,
        member_since: officer.created_at,
      },
      rating: {
        average: Number(average_rating).toFixed(1),
        total: total_reviews,
        breakdown: ratingBreakdown,
      },
      commonFeedback: tagsResult.rows,
      recentReviews: recentReviewsResult.rows,
    });
  } catch (error) {
    console.error("❌ Error in getOfficerProfile:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching the profile.",
    });
  }
};