import { admin } from "../admin.config.js";
import pool from "../utils/db.js";

async function getAllUsers(req, res) {
  try {
    const { limit = 50, page = 1 } = req.query;
    const result = await pool.query(
      `SELECT uid, email, is_admin, is_blocked, created_at FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, (page - 1) * limit]
    );

    res.json({ users: result.rows, total: result.rowCount });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to get users" });
  }
}

async function updateUser(req, res) {
  try {
    const { uid } = req.params;
    const { isAdmin, isBlocked } = req.body;

    if (typeof isBlocked === "boolean") {
      await admin.auth().updateUser(uid, { disabled: isBlocked });
    }

    const updates = [];
    const values = [uid];
    if (typeof isAdmin === "boolean") {
      values.push(isAdmin);
      updates.push(`is_admin = $${values.length}`);
    }
    if (typeof isBlocked === "boolean") {
      values.push(isBlocked);
      updates.push(`is_blocked = $${values.length}`);
    }

    if (updates.length > 0) {
      await pool.query(
        `UPDATE users SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE uid = $1`,
        values
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  try {
    const { uid } = req.params;

    await admin.auth().deleteUser(uid);

    await pool.query("DELETE FROM users WHERE uid = $1", [uid]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export { getAllUsers, updateUser, deleteUser };
