import express from "express";

import upload from "../middleware/upload.js";

import {
    verifyImage,
} from "../utils/verifyImage.js";

import { createReport, getDashboardData, getUserComplaints } from "../controllers/reportControllers.js";

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