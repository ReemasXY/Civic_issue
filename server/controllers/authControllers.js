import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/dbConnection.js";
import { generateOTP, getOTPExpiry, sendOtpEmail, scheduleOTPCleanup } from "../utils/emailService.js";

const registerUser = async (req, res) => {
  try {
    const {
      email,
      username,
      phone_number,
      password,
    } = req.body;

    // Check if email already registered in users table
    const existingEmail = await pool.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        error: ["Email is already registered"],
      });
    }

    // Check if username already taken in users table
    const existingUsername = await pool.query(
      `SELECT user_id FROM users WHERE username = $1`,
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return res.status(409).json({
        error: ["Username is already taken"],
      });
    }

    // Check if phone number already registered in users table
    const existingPhone = await pool.query(
      `SELECT user_id FROM users WHERE phone_number = $1`,
      [phone_number]
    );
    if (existingPhone.rows.length > 0) {
      return res.status(409).json({
        error: ["Phone number is already registered"],
      });
    }

    // Hash the password
    const saltRounds = process.env.SALT_ROUNDS || 10;
    const salt = await bcrypt.genSalt(Number(saltRounds));
    const hashPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP and expiry time (5 minutes)
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    // Store in pending_registrations table (upsert if email already has a pending registration)
    await pool.query(
      `INSERT INTO pending_registrations
        (email, username, phone_number, password_hash, otp_code, otp_expires_at)
       VALUES
        ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        phone_number = EXCLUDED.phone_number,
        password_hash = EXCLUDED.password_hash,
        otp_code = EXCLUDED.otp_code,
        otp_expires_at = EXCLUDED.otp_expires_at,
        created_at = CURRENT_TIMESTAMP`,
      [email, username, phone_number, hashPassword, otpCode, otpExpiresAt]
    );

    // Schedule cleanup after 5 minutes
    scheduleOTPCleanup(email, "pending_registrations");

    // Send OTP email
    await sendOtpEmail(email, otpCode, "registration");

    return res.status(200).json({
      message: "Verification code sent to your email. Please verify to complete registration.",
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      error: ["Internal server error"],
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT user_id, email, username, phone_number, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    // Generate 6-digit OTP and expiry time (5 minutes)
    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    // Store in pending_logins table (upsert if email already has a pending login)
    await pool.query(
      `INSERT INTO pending_logins
        (user_id, email, otp_code, otp_expires_at)
       VALUES
        ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        otp_code = EXCLUDED.otp_code,
        otp_expires_at = EXCLUDED.otp_expires_at,
        created_at = CURRENT_TIMESTAMP`,
      [user.user_id, email, otpCode, otpExpiresAt]
    );

    // Schedule cleanup after 5 minutes
    scheduleOTPCleanup(email, "pending_logins");

    // Send OTP email
    await sendOtpEmail(email, otpCode, "login");

    return res.status(200).json({
      message: "Verification code sent to your email. Please verify to log in.",
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: ["Internal server error"],
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: ["Email and OTP are required"],
      });
    }

    if (purpose === "registration") {
      // Check pending_registrations table
      const pendingResult = await pool.query(
        `SELECT * FROM pending_registrations WHERE email = $1`,
        [email]
      );

      if (pendingResult.rows.length === 0) {
        return res.status(400).json({
          error: ["No pending registration found for this email. Please register again."],
        });
      }

      const pending = pendingResult.rows[0];

      // Check if OTP matches
      if (pending.otp_code !== otp) {
        return res.status(400).json({
          error: ["Invalid OTP code. Please check and try again."],
        });
      }

      // Check if OTP has expired
      if (new Date() > new Date(pending.otp_expires_at)) {
        return res.status(400).json({
          error: ["OTP has expired. Please request a new one."],
        });
      }

      // Insert new user into the users table
      const insertResult = await pool.query(
        `INSERT INTO users
          (email, username, phone_number, password_hash, role)
         VALUES
          ($1, $2, $3, $4, $5)
         RETURNING user_id, email, username, phone_number, role`,
        [
          pending.email,
          pending.username,
          pending.phone_number,
          pending.password_hash,
          pending.role,
        ]
      );

      const newUser = insertResult.rows[0];

      // Remove from pending_registrations
      await pool.query(
        `DELETE FROM pending_registrations WHERE email = $1`,
        [email]
      );

      // Sign JWT token
      const token = jwt.sign(
        {
          user_id: newUser.user_id,
          username: newUser.username,
          role: newUser.role,
        },
        process.env.JWT_SECRET
      );

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "Account verified successfully! Welcome to CivicCare.",
        token,
        user: newUser,
      });

    } else if (purpose === "login") {
      // Check pending_logins table
      const pendingResult = await pool.query(
        `SELECT * FROM pending_logins WHERE email = $1`,
        [email]
      );

      if (pendingResult.rows.length === 0) {
        return res.status(400).json({
          error: ["No pending login session found. Please log in again."],
        });
      }

      const pending = pendingResult.rows[0];

      // Check if OTP matches
      if (pending.otp_code !== otp) {
        return res.status(400).json({
          error: ["Invalid OTP code. Please check and try again."],
        });
      }

      // Check if OTP has expired
      if (new Date() > new Date(pending.otp_expires_at)) {
        return res.status(400).json({
          error: ["OTP has expired. Please request a new one."],
        });
      }

      // Fetch user details from users table
      const userResult = await pool.query(
        `SELECT user_id, email, username, phone_number, role FROM users WHERE user_id = $1`,
        [pending.user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: ["User account not found."],
        });
      }

      const user = userResult.rows[0];

      // Remove from pending_logins
      await pool.query(
        `DELETE FROM pending_logins WHERE email = $1`,
        [email]
      );

      // Sign JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET
      );

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful! Welcome back.",
        token,
        user,
      });

    } else {
      return res.status(400).json({
        error: ["Invalid verification purpose specified."],
      });
    }

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      error: ["Internal server error during verification"],
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        error: ["Email is required"],
      });
    }

    const otpCode = generateOTP();
    const otpExpiresAt = getOTPExpiry();

    if (purpose === "registration") {
      // Check if registration is pending
      const pendingResult = await pool.query(
        `SELECT * FROM pending_registrations WHERE email = $1`,
        [email]
      );

      if (pendingResult.rows.length === 0) {
        return res.status(404).json({
          error: ["No pending registration found for this email. Please register again."],
        });
      }

      // Update with new OTP and expiry
      await pool.query(
        `UPDATE pending_registrations
         SET otp_code = $1, otp_expires_at = $2, created_at = CURRENT_TIMESTAMP
         WHERE email = $3`,
        [otpCode, otpExpiresAt, email]
      );

      // Schedule cleanup after 5 minutes
      scheduleOTPCleanup(email, "pending_registrations");

      // Send email
      await sendOtpEmail(email, otpCode, "registration");

      return res.status(200).json({
        message: "A new verification code has been sent to your email.",
      });

    } else if (purpose === "login") {
      // Check if login is pending
      const pendingResult = await pool.query(
        `SELECT * FROM pending_logins WHERE email = $1`,
        [email]
      );

      if (pendingResult.rows.length === 0) {
        return res.status(404).json({
          error: ["No pending login session found. Please log in again."],
        });
      }

      // Update with new OTP and expiry
      await pool.query(
        `UPDATE pending_logins
         SET otp_code = $1, otp_expires_at = $2, created_at = CURRENT_TIMESTAMP
         WHERE email = $3`,
        [otpCode, otpExpiresAt, email]
      );

      // Schedule cleanup after 5 minutes
      scheduleOTPCleanup(email, "pending_logins");

      // Send email
      await sendOtpEmail(email, otpCode, "login");

      return res.status(200).json({
        message: "A new verification code has been sent to your email.",
      });

    } else {
      return res.status(400).json({
        error: ["Invalid purpose specified."],
      });
    }

  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      error: ["Failed to resend verification code. Please try again."],
    });
  }
};

const getUser = async (req, res) => {
  try {
    // Prevent the browser (and bfcache/back-nav) from ever replaying
    // a cached copy of this response
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      error: ["Server Error"]
    });
  }
};

const logout = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: ["Logout successful"],
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      error: ["Logout failed"],
    });
  }
};

export { registerUser, loginUser, getUser, logout, verifyOTP, resendOTP };