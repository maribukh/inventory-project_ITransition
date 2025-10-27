// [file name]: server/middlewares/adminMiddleware.js
import pool from "../utils/db.js"; // Наш новый пул

async function adminMiddleware(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE uid = $1",
      [req.user.uid]
    );
    const userData = result.rows[0];

    if (!userData || !userData.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ error: "Authorization check failed" });
  }
}

export default adminMiddleware;
