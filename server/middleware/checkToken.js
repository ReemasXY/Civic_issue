import jwt from "jsonwebtoken";
import pool from "../config/dbConnection.js";

export const checkToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      return res.status(401).json({
        error: ["Not authenticated"]
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If user is an officer, check if their account is still active
    if (decoded.role === 'officer') {
      const result = await pool.query(
        `SELECT is_active FROM officers WHERE user_id = $1`,
        [decoded.user_id]
      );

      // If officer not found or is deactivated, clear token and reject
      if (result.rows.length === 0 || !result.rows[0].is_active) {
        res.clearCookie("token", {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.set("Pragma", "no-cache");
        return res.status(403).json({
          error: ["Your account has been deactivated. Please contact your administrator."]
        });
      }
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    return res.status(401).json({
      error: ["Invalid or Expired Token"]
    });
  }
};