import pool from "../config/dbConnection.js";

const ensureAdmin = (req, res) => {
  if (!req.user?.user_id) {
    res.status(401).json({
      success: false,
      error: "User not authenticated.",
    });
    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Admin role required.",
    });
    return false;
  }

  return true;
};

/**
 * GET /api/admin/overview
 *
 * City-wide statistics, 30-day new-vs-resolved trend,
 * 30-day hotspot areas, category breakdown,
 * department breakdown, severity breakdown,
 * and average resolution time.
 */
export const getAdminOverview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    // ============================================================
    // TOP STAT CARDS
    // ============================================================

    const statsResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total,

         COUNT(*) FILTER (
           WHERE status = 'pending'
           AND handled_by IS NULL
         )::int AS unclaimed,

         COUNT(*) FILTER (
           WHERE status = 'in-progress'
         )::int AS in_progress,

         COUNT(*) FILTER (
           WHERE status = 'resolved'
         )::int AS resolved,

         COUNT(*) FILTER (
           WHERE status = 'rejected'
         )::int AS rejected

       FROM reports`
    );

    // ============================================================
    // NEW VS RESOLVED REPORTS - LAST 30 DAYS
    // ============================================================

    const dailyTrendResult = await pool.query(
      `SELECT
         gs.day::date AS day,

         COALESCE(n.count, 0)::int AS new_reports,

         COALESCE(r.count, 0)::int AS resolved

       FROM generate_series(
         CURRENT_DATE - INTERVAL '29 days',
         CURRENT_DATE,
         '1 day'
       ) AS gs(day)

       LEFT JOIN (
         SELECT
           DATE(created_at) AS d,
           COUNT(*) AS count

         FROM reports

         WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'

         GROUP BY DATE(created_at)
       ) n
         ON n.d = gs.day::date

       LEFT JOIN (
         SELECT
           DATE(resolved_at) AS d,
           COUNT(*) AS count

         FROM reports

         WHERE resolved_at IS NOT NULL
           AND resolved_at >= CURRENT_DATE - INTERVAL '29 days'

         GROUP BY DATE(resolved_at)
       ) r
         ON r.d = gs.day::date

       ORDER BY gs.day`
    );

    // ============================================================
    // HOTSPOT AREAS - TOP 5
    // ============================================================

    const hotspotResult = await pool.query(
      `SELECT
         MIN(TRIM(location_short_label)) AS area,

         COUNT(*)::int AS total,

         COUNT(*) FILTER (
           WHERE status NOT IN ('resolved', 'rejected')
         )::int AS open

       FROM reports

       WHERE location_short_label IS NOT NULL
         AND TRIM(location_short_label) <> ''
         AND created_at >= CURRENT_DATE - INTERVAL '29 days'

       GROUP BY LOWER(TRIM(location_short_label))

       ORDER BY
         total DESC,
         open DESC,
         area ASC

       LIMIT 5`
    );

    // ============================================================
    // COMPLAINTS BY CATEGORY
    // ============================================================

    const categoryResult = await pool.query(
      `SELECT
         category,
         COUNT(*)::int AS count

       FROM reports

       WHERE category IS NOT NULL

       GROUP BY category

       ORDER BY count DESC

       LIMIT 8`
    );

    // ============================================================
    // DEPARTMENTS
    // ============================================================

    const departmentResult = await pool.query(
      `SELECT
         assigned_department AS department,

         COUNT(*)::int AS total,

         COUNT(*) FILTER (
           WHERE status = 'resolved'
         )::int AS resolved

       FROM reports

       WHERE assigned_department IS NOT NULL
         AND assigned_department != 'none'

       GROUP BY assigned_department

       ORDER BY total DESC`
    );

    // ============================================================
    // SEVERITY BREAKDOWN
    // ============================================================

    const severityResult = await pool.query(
      `SELECT
         severity_level,
         COUNT(*)::int AS count

       FROM reports

       WHERE severity_level IS NOT NULL

       GROUP BY severity_level`
    );

    // Keep severity in a fixed order for the frontend.
    const severityOrder = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const severityMap = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    severityResult.rows.forEach((row) => {
      if (
        severityMap[row.severity_level] !== undefined
      ) {
        severityMap[row.severity_level] = row.count;
      }
    });

    const severity = severityOrder.map((level) => ({
      level,
      count: severityMap[level],
    }));

    // ============================================================
    // AVERAGE RESOLUTION TIME - LAST 6 WEEKS
    // ============================================================

    const resolutionTrendResult = await pool.query(
      `SELECT
         DATE_TRUNC('week', resolved_at)::date AS week,

         AVG(
           EXTRACT(
             EPOCH FROM (resolved_at - created_at)
           ) / 86400
         )::float AS avg_days

       FROM reports

       WHERE resolved_at IS NOT NULL
         AND resolved_at >= CURRENT_DATE - INTERVAL '6 weeks'

       GROUP BY week

       ORDER BY week`
    );

    // ============================================================
    // PREPARE STATISTICS
    // ============================================================

    const stats = statsResult.rows[0];

    // ============================================================
    // SEND RESPONSE
    // ============================================================

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

      resolutionTrend: resolutionTrendResult.rows.map(
        (row) => ({
          week: row.week,
          avgDays: row.avg_days
            ? Number(row.avg_days.toFixed(1))
            : 0,
        })
      ),
    });
  } catch (error) {
    console.error(
      "❌ Error in getAdminOverview:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "An error occurred while fetching the overview.",
    });
  }
};