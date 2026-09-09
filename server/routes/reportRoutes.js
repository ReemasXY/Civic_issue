import express from "express";

import upload from "../middleware/upload.js";

import {
    verifyImage,
} from "../utils/verifyImage.js";

const router =
    express.Router();


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