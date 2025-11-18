// --- Файл: /server/src/controllers/authController.js ---

import pool from "../utils/db.js";

async function createUserRecord(req, res) {
  try {
    const { uid, email } = req.user;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing user data" });
    }

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(countResult.rows[0].count, 10) === 0;
    const isAdmin = isFirstUser;

    const newUserResult = await pool.query(
      `INSERT INTO users (uid, email, is_admin)
       VALUES ($1, $2, $3)
       ON CONFLICT(uid) DO NOTHING
       RETURNING uid, is_admin, created_at`,
      [uid, email, isAdmin]
    );

    if (newUserResult.rows.length > 0) {
      const newUser = newUserResult.rows[0];
      return res.json({
        success: true,
        isAdmin: newUser.is_admin,
        message:
          isFirstUser && newUser.created_at
            ? "First user - admin rights granted"
            : "User record created",
      });
    } else {
      const existingUser = await pool.query(
        "SELECT is_admin FROM users WHERE uid = $1",
        [uid]
      );

      if (existingUser.rows.length === 0) {
        return res.status(409).json({
          error: "User with this UID could not be found or created.",
        });
      }

      return res.json({
        success: true,
        isAdmin: existingUser.rows[0].is_admin || false,
        message: "User record already exists",
      });
    }
  } catch (error) {
    console.error("❌ Create user record error:", error);
    res
      .status(500)
      .json({ error: "Failed to create user record: " + error.message });
  }
}

export { createUserRecord };
