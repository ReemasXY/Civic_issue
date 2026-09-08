import express from "express"
import { getUser, loginUser, logout, registerUser, verifyOTP, resendOTP } from "../controllers/authControllers.js"
import { registerValidator, loginValidator } from "../middleware/validation.js"
import validateResults from "../middleware/validationResults.js"
import { checkToken } from "../middleware/checkToken.js"

const router = express.Router()

router.post("/register", registerValidator, validateResults, registerUser)
router.post("/login", loginValidator, validateResults, loginUser)
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)

router.get("/getuser", checkToken, getUser)
router.post("/logout", logout)

export default router