import express from 'express'
import "dotenv/config";
import pool from './config/dbConnection.js';
import userAuth from "./routes/userAuth.js"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express();
const PORT = process.env.PORT;

// Cleanup expired OTP records on server startup
(async () => {
  try {
    const result1 = await pool.query(
      `DELETE FROM pending_registrations WHERE otp_expires_at < NOW()`
    );
    const result2 = await pool.query(
      `DELETE FROM pending_logins WHERE otp_expires_at < NOW()`
    );

    console.log(`🗑️ Cleaned up ${result1.rowCount} expired registration(s) and ${result2.rowCount} expired login(s) on startup`);
  } catch (error) {
    console.error('❌ Error cleaning up expired OTPs on startup:', error);
  }
})();

//allow the request from the following url only
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
// middleware
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",userAuth)

app.listen(PORT,()=>
{
    console.log(`Running on the port ${PORT}`)
})