import express from "express";
import { getOfficerDashboardData, getOfficerComplaints, updateComplaintStatus } from "../controllers/officerControllers.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

/**
 * GET /api/officer/dashboard
 * Fetches dashboard data for officers - shows complaints assigned to their department
 */
router.get("/dashboard", checkToken, getOfficerDashboardData);

/**
 * GET /api/officer/complaints
 * Fetches all complaints assigned to the officer's department
 */
router.get("/complaints", checkToken, getOfficerComplaints);

/**
 * PATCH /api/officer/complaints/:id/status
 * Updates the status of a complaint assigned to the officer's department
 */
router.patch("/complaints/:id/status", checkToken, updateComplaintStatus);

export default router;