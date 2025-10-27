import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Убедитесь, что у вас есть эта переменная в .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Если вы размещаете базу данных на хостинге (Render, Heroku, etc.),
  // вам может понадобиться SSL-соединение:
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

pool.on("connect", () => {
  console.log("✅ Подключено к PostgreSQL");
});

export default pool;
