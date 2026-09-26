import pool from "../config/dbConnection.js";

/**
 * Get all notifications for the logged-in citizen, most recent first.
 * GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const user_role = req.user?.role;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    if (user_role !== "citizen") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Citizen role required.",
      });
    }

    const result = await pool.query(
      `SELECT notification_id, report_id, type, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("❌ Error in getNotifications:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching notifications.",
      details: error.message,
    });
  }
};

/**
 * Mark a single notification as read.
 * PATCH /api/notifications/:id/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const { id: notification_id } = req.params;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    // Scoped to user_id so a citizen can only mark their own
    // notifications read, not anyone else's by guessing an id.
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [notification_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error in markNotificationRead:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while updating the notification.",
      details: error.message,
    });
  }
};

/**
 * Mark every unread notification for the logged-in citizen as read.
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("❌ Error in markAllNotificationsRead:", error);

    return res.status(500).json({
      success: false,
      error: "An error occurred while updating notifications.",
      details: error.message,
    });
  }
};