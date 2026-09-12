import express from "express";
import { getOfficerDashboardData, getOfficerComplaints } from "../controllers/officerControllers.js";
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

export default router;
