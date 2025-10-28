import pool from "../utils/db.js";

async function createUserRecord(req, res) {
  try {
    const { uid, email } = req.user;
    console.log("📝 Creating user record for:", { uid, email });

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing user data" });
    }

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const isFirstUser = parseInt(countResult.rows[0].count, 10) === 0;
    const isAdmin = isFirstUser;

    console.log("👑 First user check:", { isFirstUser, isAdmin });

    const newUser = await pool.query(
      `INSERT INTO users (uid, email, is_admin)
       VALUES ($1, $2, $3)
       ON CONFLICT(email) DO NOTHING
       RETURNING *`,
      [uid, email, isAdmin]
    );

    if (newUser.rows.length > 0) {
      console.log("✅ User record created successfully");
      return res.json({
        success: true,
        isAdmin: isAdmin,
        message: isFirstUser
          ? "First user - admin rights granted"
          : "User record created",
      });
    } else {
      const existingUser = await pool.query(
        "SELECT is_admin FROM users WHERE uid = $1",
        [uid]
      );

      if (existingUser.rows.length === 0) {
        console.log("❌ User exists with different UID (email conflict)");
        return res
          .status(409)
          .json({
            error: "Email already associated with another user account.",
          });
      }

      console.log("✅ User record already exists");
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
