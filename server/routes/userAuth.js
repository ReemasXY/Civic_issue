import express from "express"
import { loginUser, registerUser } from "../controllers/authControllers.js"
import { registerValidator, loginValidator} from "../middleware/validation.js"
import validateResults from "../middleware/validationResults.js"
const router = express.Router()

router.post("/register",registerValidator,validateResults,registerUser)
router.post("/login",loginValidator,validateResults, loginUser)

export default router