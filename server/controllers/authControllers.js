import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/dbConnection.js";
// COMMENTED OUT: OTP email verification
// import { generateOTP, getOTPExpiry, sendOtpEmail, scheduleOTPCleanup } from "../utils/emailService.js";

/**
 * Helper: check if an email is already taken across citizens/officers/admins.
 * Postgres can't enforce UNIQUE across separate tables, so this UNION ALL
 * is the "join" that stands in for a single-table check.
 */
const emailExists = async (email) => {
  const result = await pool.query(
    `SELECT user_id FROM citizens WHERE email = $1
     UNION ALL
     SELECT user_id FROM officers WHERE email = $1
     UNION ALL
     SELECT user_id FROM admins WHERE email = $1`,
    [email]
  );
  return result.rows.length > 0;
};

const usernameExists = async (username) => {
  const result = await pool.query(
    `SELECT user_id FROM citizens WHERE username = $1
     UNION ALL
     SELECT user_id FROM officers WHERE username = $1
     UNION ALL
     SELECT user_id FROM admins WHERE username = $1`,
    [username]
  );
  return result.rows.length > 0;
};

const phoneExists = async (phone_number) => {
  const result = await pool.query(
    `SELECT user_id FROM citizens WHERE phone_number = $1
     UNION ALL
     SELECT user_id FROM officers WHERE phone_number = $1
     UNION ALL
     SELECT user_id FROM admins WHERE phone_number = $1`,
    [phone_number]
  );
  return result.rows.length > 0;
};

/**
 * Helper: find a user by email across all three role tables.
 * Used by login. Returns the matching row (with its role) or null.
 */
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT user_id, email, username, phone_number, password_hash, role FROM citizens WHERE email = $1
     UNION ALL
     SELECT user_id, email, username, phone_number, password_hash, role FROM officers WHERE email = $1
     UNION ALL
     SELECT user_id, email, username, phone_number, password_hash, role FROM admins WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

const registerUser = async (req, res) => {
  try {

    const {
      email,
      username,
      phone_number,
      password,
    } = req.body;

    // Check if email already registered (across citizens/officers/admins)
    if (await emailExists(email)) {
      return res.status(409).json({
        error: ["Email is already registered"],
      });
    }

    // Check if username already taken (across citizens/officers/admins)
    if (await usernameExists(username)) {
      return res.status(409).json({
        error: ["Username is already taken"],
      });
    }

    // Check if phone number already registered (across citizens/officers/admins)
    if (await phoneExists(phone_number)) {
      return res.status(409).json({
        error: ["Phone number is already registered"],
      });
    }

    // Hash the password
    const saltRounds = process.env.SALT_ROUNDS || 10;
    const salt = await bcrypt.genSalt(Number(saltRounds));
    const hashPassword = await bcrypt.hash(password, salt);

    // COMMENTED OUT: OTP verification flow
    // // Generate 6-digit OTP and expiry time (5 minutes)
    // const otpCode = generateOTP();
    // const otpExpiresAt = getOTPExpiry();

    // // Store in pending_registrations table (upsert if email already has a pending registration)
    // await pool.query(
    //   `INSERT INTO pending_registrations
    //     (email, username, phone_number, password_hash, otp_code, otp_expires_at)
    //    VALUES
    //     ($1, $2, $3, $4, $5, $6)
    //    ON CONFLICT (email) DO UPDATE SET
    //     username = EXCLUDED.username,
    //     phone_number = EXCLUDED.phone_number,
    //     password_hash = EXCLUDED.password_hash,
    //     otp_code = EXCLUDED.otp_code,
    //     otp_expires_at = EXCLUDED.otp_expires_at,
    //     created_at = CURRENT_TIMESTAMP`,
    //   [email, username, phone_number, hashPassword, otpCode, otpExpiresAt]
    // );

    // // Schedule cleanup after 5 minutes
    // scheduleOTPCleanup(email, "pending_registrations");

    // // Send OTP email
    // await sendOtpEmail(email, otpCode, "registration");

    // return res.status(200).json({
    //   message: "Verification code sent to your email. Please verify to complete registration.",
    // });

    // DIRECT REGISTRATION: public sign-up always creates a citizen account.
    // Officer/admin accounts are provisioned separately (not through this route).
    const insertResult = await pool.query(
      `INSERT INTO citizens
        (email, username, phone_number, password_hash)
       VALUES
        ($1, $2, $3, $4)
       RETURNING user_id, email, username, phone_number, role`,
      [email, username, phone_number, hashPassword]
    );

    const newUser = insertResult.rows[0];

    // Generate JWT token
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
      message: "Account created successfully! Welcome to CivicCare.",
      token,
      user: newUser,
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

    // Look the user up across citizens/officers/admins
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    // COMMENTED OUT: OTP verification flow
    // // Generate 6-digit OTP and expiry time (5 minutes)
    // const otpCode = generateOTP();
    // const otpExpiresAt = getOTPExpiry();

    // // Store in pending_logins table (upsert if email already has a pending login)
    // await pool.query(
    //   `INSERT INTO pending_logins
    //     (user_id, email, otp_code, otp_expires_at)
    //    VALUES
    //     ($1, $2, $3, $4)
    //    ON CONFLICT (email) DO UPDATE SET
    //     user_id = EXCLUDED.user_id,
    //     otp_code = EXCLUDED.otp_code,
    //     otp_expires_at = EXCLUDED.otp_expires_at,
    //     created_at = CURRENT_TIMESTAMP`,
    //   [user.user_id, email, otpCode, otpExpiresAt]
    // );

    // // Schedule cleanup after 5 minutes
    // scheduleOTPCleanup(email, "pending_logins");

    // // Send OTP email
    // await sendOtpEmail(email, otpCode, "login");

    // return res.status(200).json({
    //   message: "Verification code sent to your email. Please verify to log in.",
    // });

    // DIRECT LOGIN: Generate JWT and login immediately after password validation
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
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        phone_number: user.phone_number,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: ["Internal server error"],
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

export { registerUser, loginUser, getUser, logout };
