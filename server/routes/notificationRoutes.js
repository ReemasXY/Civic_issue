import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notificationControllers.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.get("/", checkToken, getNotifications);
router.patch("/read-all", checkToken, markAllNotificationsRead);
router.patch("/:id/read", checkToken, markNotificationRead);

export default router;