import express from "express";

import upload from "../middleware/upload.js";

import {
    verifyImage,
} from "../utils/verifyImage.js";

import {
    createReport,
    getDashboardData,
    getUserComplaints,
    getRecentComplaints,
    getRejectionReason,
    getComplaintById,
    checkDuplicates,
    supportReport,
} from "../controllers/reportControllers.js";

import { getPublicComplaints } from "../controllers/publicControllers.js";

import { checkToken } from "../middleware/checkToken.js";

const router =
    express.Router();


/*
 * ============================================================
 * ROUTE: CREATE REPORT
 * ============================================================
 * POST /api/reports/create-report
 * Creates a new civic issue report with image and severity data
 */

router.post(
    "/create-report",
    checkToken,
    upload.single("image"),
    createReport
);


/*
 * ============================================================
 * ROUTE: GET DASHBOARD DATA
 * ============================================================
 * GET /api/reports/dashboard
 * Fetches user-specific statistics and recent reports
 */

router.get(
    "/dashboard",
    checkToken,
    getDashboardData
);


/*
 * ============================================================
 * ROUTE: GET USER COMPLAINTS
 * ============================================================
 * GET /api/reports/user
 * Fetches all reports for the authenticated user
 */

router.get(
    "/user",
    checkToken,
    getUserComplaints
);


/*
 * ============================================================
 * ROUTE: GET RECENT COMPLAINTS (PUBLIC)
 * ============================================================
 * GET /api/reports/recent
 * Fetches 6 most recent reports for the home page (no auth required)
 */

router.get(
    "/recent",
    getRecentComplaints
);


/*
 * ============================================================
 * ROUTE: LIST ISSUES FOR EVERYONE (PUBLIC)
 * ============================================================
 * GET /api/reports/public
 * Query: page, limit, search, category, status
 * No login needed. It must stay ABOVE "/:reportId", otherwise
 * Express would treat the word "public" as a report id.
 */

router.get(
    "/public",
    getPublicComplaints
);


/*
 * ============================================================
 * ROUTE: GET ONE COMPLAINT
 * ============================================================
 * GET /api/reports/:reportId
 * Fetches a single complaint of the logged-in citizen
 * (used by the "View" button in the notifications list).
 * Keep this below /dashboard, /user and /recent so those
 * fixed paths are matched first.
 */

router.get(
    "/:reportId",
    checkToken,
    getComplaintById
);


/*
 * ============================================================
 * ROUTE: CHECK FOR DUPLICATE COMPLAINTS
 * ============================================================
 * POST /api/reports/check-duplicates
 * Body: { category, latitude, longitude }
 * Returns open complaints of the same category within a few metres.
 */

router.post(
    "/check-duplicates",
    checkToken,
    checkDuplicates
);


/*
 * ============================================================
 * ROUTE: FOLLOW AN EXISTING COMPLAINT
 * ============================================================
 * POST /api/reports/:reportId/support
 * Adds the citizen as a supporter instead of creating a duplicate.
 */

router.post(
    "/:reportId/support",
    checkToken,
    supportReport
);


/*
 * ============================================================
 * ROUTE: GET REJECTION REASON
 * ============================================================
 * GET /api/reports/:reportId/rejection
 * Fetches rejection reason for a specific report
 */

router.get(
    "/:reportId/rejection",
    checkToken,
    getRejectionReason
);


/*
 * ============================================================
 * ROUTE: VERIFY IMAGE
 * ============================================================
 * POST /api/reports/verify-image
 * Verifies if an uploaded image is a valid civic issue
 */

router.post(
    "/verify-image",

    upload.single("image"),

    async (req, res) => {

        try {

            console.log(
                "========================================"
            );

            console.log(
                "IMAGE VERIFICATION REQUEST"
            );

            console.log(
                "========================================"
            );


            console.log(
                "Request body:",
                req.body
            );


            console.log(
                "Uploaded file:",
                req.file?.originalname
            );


            /*
             * Check image
             */

            if (!req.file) {

                return res.status(400).json({
                    success: false,

                    message:
                        "Please upload an image.",
                });
            }


            /*
             * Get selected category
             */

            const category =
                req.body.category;


            console.log(
                "Category received:",
                category
            );


            /*
             * Check category
             */

            if (
                !category ||
                category.trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select an issue category.",
                });
            }


            /*
             * Send image to AI
             */

            const verification =
                await verifyImage(

                    req.file.buffer,

                    req.file.mimetype,

                    category
                );


            console.log(
                "Sending verification result to frontend..."
            );


            /*
             * Return result
             */

            return res.status(200).json({

                success: true,

                verification,
            });

        } catch (error) {

            console.error(
                "Image verification error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to verify image.",

                error:
                    error.message,
            });
        }
    }
);


export default router;