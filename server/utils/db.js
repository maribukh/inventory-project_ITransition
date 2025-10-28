// [file name]: server/utils/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();


console.log("--- DEBUGGING DATABASE_URL ---");
console.log("ПЕРЕМЕННАЯ ИЗ .env:", process.env.DATABASE_URL);
console.log("---------------------------------");
// -------------------------------------

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

});

pool.on("connect", () => {
  console.log("✅ Подключено к PostgreSQL");
});

export default pool;
