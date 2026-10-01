import express from "express";
import { getAdminOverview } from "../controllers/adminControllers.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.get("/overview", checkToken, getAdminOverview);

export default router;