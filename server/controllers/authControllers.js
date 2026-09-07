import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/dbConnection.js";

const registerUser = async (req, res) => {
  try {
    const {
      email,
      username,
      phone_number,
      password,
    } = req.body;

    const existingUser = await pool.query(
      `SELECT user_id
       FROM users
       WHERE email = $1
          OR username = $2
          OR phone_number = $3`,
      [email, username, phone_number]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: ["Email, username, or phone number already exists"],
      });
    }

    const saltRounds = process.env.SALT_ROUNDS
    const salt = await bcrypt.genSalt(Number(saltRounds))
    const hashPassword = await bcrypt.hash(password, salt)

    const result = await pool.query(
      `INSERT INTO users
        (email, username, phone_number, password_hash)
         VALUES
         ($1, $2, $3, $4)
         RETURNING user_id, email, username, phone_number, role`,
      [
        email,
        username,
        phone_number,
        hashPassword,
      ]
    );

    const user = result.rows[0];

    // Token now expires in 24h — matches the cookie's maxAge
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      error: ["Internal server error"],
    });
  }
}

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

    // Token now expires in 24h — matches the cookie's maxAge
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
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

export { registerUser, loginUser, getUser, logout }