import express from "express";
import {
  getPendingReviews,
  getMyReviews,
  createReview,
} from "../controllers/reviewControllers.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.get("/pending", checkToken, getPendingReviews);
router.get("/mine", checkToken, getMyReviews);
router.post("/", checkToken, createReview);

export default router;