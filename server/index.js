import express from "express";
import "dotenv/config";
import pool from "./config/dbConnection.js";
import userAuth from "./routes/userAuth.js";
import reportRoutes from "./routes/reportRoutes.js";
import officerRoutes from "./routes/officerRoutes.js";

import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import {
  loadImageModel,
} from "./utils/verifyImage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT;


/*
 * ============================================================
 * CORS
 * ============================================================
 */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


/*
 * ============================================================
 * MIDDLEWARE
 * ============================================================
 */

app.use(express.json());

app.use(cookieParser());

// make the images of the uploads folder accessible from the frontend

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


/*
 * ============================================================
 * AUTH ROUTES
 * ============================================================
 */

app.use(
  "/api/auth",
  userAuth
);


/*
 * ============================================================
 * REPORT / IMAGE VERIFICATION ROUTES
 * ============================================================
 */

app.use(
  "/api/reports",
  reportRoutes
);


/*
 * ============================================================
 * OFFICER ROUTES
 * ============================================================
 */

app.use(
  "/api/officer",
  officerRoutes
);


/*
 * ============================================================
 * CLEANUP EXPIRED OTP RECORDS
 * ============================================================
 */

(async () => {

  try {

    const result1 =
      await pool.query(
        `DELETE FROM pending_registrations
         WHERE otp_expires_at < NOW()`
      );


    const result2 =
      await pool.query(
        `DELETE FROM pending_logins
         WHERE otp_expires_at < NOW()`
      );


    console.log(
      `🗑️ Cleaned up ${result1.rowCount} expired registration(s) and ${result2.rowCount} expired login(s) on startup`
    );

  } catch (error) {

    console.error(
      "❌ Error cleaning up expired OTPs on startup:",
      error
    );

  }

})();


/*
 * ============================================================
 * START SERVER
 * ============================================================
 */

async function startServer() {

  try {

    /*
     * Load the image AI model before
     * accepting requests.
     */

    await loadImageModel();


    /*
     * Start Express server
     */

    app.listen(
      PORT,
      () => {
        console.log(
          `Running on the port ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
}


startServer();