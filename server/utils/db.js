import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("--- DEBUGGING DATABASE_URL ---");
console.log("VARIABLE FROM .env:", process.env.DATABASE_URL);
console.log("---------------------------------");

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

export default pool;
