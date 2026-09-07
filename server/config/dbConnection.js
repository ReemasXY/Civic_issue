import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


pool.connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected successfully!");
    client.release();
  })
  .catch((error) => {
    console.error("❌ PostgreSQL connection failed:", error.message);
  });

export default pool;