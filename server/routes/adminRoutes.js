import express from "express";
import {
  getAdminOverview,
  getAdminComplaints,
  getAdminDepartments,
  getAdminOfficers,
  createOfficer,
  deactivateOfficer,
  activateOfficer,
} from "../controllers/adminControllers.js";
import { checkToken } from "../middleware/checkToken.js";
import { createOfficerValidator } from "../middleware/validation.js";
import validateResults from "../middleware/validationResults.js";

const router = express.Router();

router.get("/overview", checkToken, getAdminOverview);
router.get("/complaints", checkToken, getAdminComplaints);
router.get("/departments", checkToken, getAdminDepartments);
router.get("/officers", checkToken, getAdminOfficers);
router.post(
  "/officers",
  checkToken,
  createOfficerValidator,
  validateResults,
  createOfficer
);
router.patch("/officers/:officerId/deactivate", checkToken, deactivateOfficer);
router.patch("/officers/:officerId/activate", checkToken, activateOfficer);

export default router;