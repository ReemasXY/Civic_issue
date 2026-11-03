import pool from "../config/dbConnection.js";

// Statuses that visitors are allowed to see.
// Rejected reports are never listed publicly.
const PUBLIC_STATUSES = ["pending", "verified", "in-progress", "resolved"];

/**
 * List reported issues for everyone (no login needed).
 * GET /api/reports/public
 *
 * Query params: page, limit (max 24), search, category, status
 *
 * Only information that is safe to show publicly is returned:
 * no citizen names or ids, no exact coordinates.
 */
export const getPublicComplaints = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 12, 1),
      24
    );
    const offset = (page - 1) * limit;

    const { search, category, status } = req.query;

    // $1 is always the list of public statuses.
    const params = [PUBLIC_STATUSES];
    const conditions = ["r.status = ANY($1::text[])"];

    if (typeof status === "string" && PUBLIC_STATUSES.includes(status)) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (typeof category === "string" && category.trim()) {
      params.push(category.trim());
      conditions.push(`r.category = $${params.length}`);
    }

    if (typeof search === "string" && search.trim()) {
      // Escape LIKE wildcards so "50%" or "_" are searched literally.
      const term = `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`;
      params.push(term);
      const i = params.length;

      conditions.push(
        `(r.title ILIKE $${i}
          OR r.category ILIKE $${i}
          OR r.location_short_label ILIKE $${i}
          OR r.location_full_label ILIKE $${i})`
      );
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

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
         r.category,
         r.status,
         r.severity_level,
         r.location_short_label,
         r.image_url,
         r.created_at,
         LEFT(r.description, 300) AS description,
         (
           SELECT COUNT(*) FROM report_supporters s
           WHERE s.report_id = r.report_id
         )::int AS supporter_count
       FROM reports r
       ${where}
       ORDER BY r.created_at DESC
       LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams
    );

    return res.status(200).json({
      success: true,
      complaints: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("❌ Error in getPublicComplaints:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching issues.",
    });
  }
};