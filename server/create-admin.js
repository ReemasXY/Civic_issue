import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "./config/dbConnection.js";

// EDIT THESE, then run: node create-admin.js
const email = "admin@civiccare.gov";
const username = "Admin";
const phone_number = "9800000000";
const password = "Admin@123"; // Make sure to use a strong password

const run = async () => {
  const saltRounds = process.env.SALT_ROUNDS || 10;
  const salt = await bcrypt.genSalt(Number(saltRounds));
  const password_hash = await bcrypt.hash(password, salt);

  try {
    const result = await pool.query(
      `INSERT INTO admins (email, username, phone_number, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, email, username`,
      [email, username, phone_number, password_hash]
    );

    console.log("Admin created:", result.rows[0]);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
  } finally {
    await pool.end();
  }
};

run();