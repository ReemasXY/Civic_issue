import pool from "../config/dbConnection.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create a new civic issue report
 * Saves the uploaded image to server storage and records the report with image_url and status in PostgreSQL
 */
export const 

createReport = async (req, res) => {
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
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
