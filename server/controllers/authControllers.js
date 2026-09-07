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

    //Checking whether the database has the existing email,phone number or username or not
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

    //GENERATING HASH FOR THE PASSWORD
    const saltRounds = process.env.SALT_ROUNDS
    // console.log(saltRounds)
    const salt = await bcrypt.genSalt(Number(saltRounds))
    const hashPassword = await bcrypt.hash(password, salt)

    //Inserting register information in the database
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

    // Generate JWT 
    const token = jwt.sign(
      //payload
      {
        user_id: user.user_id,
        role: user.role,
      },
      //jwt secrect code
      process.env.JWT_SECRET,

      //expired date: 1 day
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );
    return res.status(201).json({
      message: "User registered successfully",
      // user: result.rows[0],
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
    console.log(email, password)
    //Find user by email
    const result = await pool.query(
      `SELECT user_id, email, username, phone_number, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    // User doesn't exist
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: ["Invalid email or password"],
      });
    }

    // 5. Create JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 6. Send response
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


export { registerUser, loginUser }