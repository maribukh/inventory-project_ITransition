import { admin } from "../admin.config.js";
import pool from "../utils/db.js";

async function getAllUsers(req, res) {
  try {
    const { limit = 50, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const usersQuery = pool.query(
      `SELECT uid, email, is_admin, is_blocked, created_at FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalCountQuery = pool.query("SELECT COUNT(*) FROM users");

    const [usersResult, totalResult] = await Promise.all([
      usersQuery,
      totalCountQuery,
    ]);

    res.json({
      users: usersResult.rows,
      total: parseInt(totalResult.rows[0].count, 10),
    });
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
    const values = [];
    if (typeof isAdmin === "boolean") {
      updates.push(`is_admin = $${values.length + 2}`);
      values.push(isAdmin);
    }
    if (typeof isBlocked === "boolean") {
      updates.push(`is_blocked = $${values.length + 2}`);
      values.push(isBlocked);
    }

    if (updates.length > 0) {
      const query = `UPDATE users SET ${updates.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE uid = $1`;
      await pool.query(query, [uid, ...values]);
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
