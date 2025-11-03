import express from "express";
import pool from "../utils/db.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { getAllUsers, updateUser } from "../controllers/usersController.js";
import { mapRowToSchema } from "../controllers/inventoriesController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getAllUsers);
router.put("/users/:uid", updateUser);

router.get("/stats", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userRegistrationsQuery = pool.query(
      `SELECT DATE(created_at)::date as date, COUNT(*) as count 
       FROM users 
       WHERE created_at >= $1
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [sevenDaysAgo]
    );

    // --- ИСПРАВЛЕННЫЙ ЗАПРОС ЗДЕСЬ ---
    const popularInventoriesQuery = pool.query(`
      SELECT 
        i.name, 
        u.email as user_email,
        (SELECT COUNT(*) FROM items WHERE inventory_id = i.id) as items_count
      FROM inventories i
      LEFT JOIN users u ON i.user_id = u.uid
      WHERE i.is_public = true
      ORDER BY items_count DESC
      LIMIT 5
    `);
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    const userDistributionQuery = pool.query(`
        SELECT 
            SUM(CASE WHEN is_admin = true THEN 1 ELSE 0 END) as admins,
            SUM(CASE WHEN is_blocked = true THEN 1 ELSE 0 END) as blocked,
            COUNT(*) as total
        FROM users
    `);

    const [userResult, inventoryResult, distributionResult] = await Promise.all(
      [userRegistrationsQuery, popularInventoriesQuery, userDistributionQuery]
    );

    const distData = distributionResult.rows[0];
    const activeCount = parseInt(distData.total) - parseInt(distData.blocked);
    const adminCount = parseInt(distData.admins);
    const blockedCount = parseInt(distData.blocked);

    const userDistribution = [
      { name: "Active", value: activeCount - adminCount },
      { name: "Admins", value: adminCount },
      { name: "Blocked", value: blockedCount },
    ].filter((d) => d.value > 0);

    const userRegistrations = userResult.rows.map((row) => ({
      ...row,
      count: parseInt(row.count),
      date: new Date(row.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    res.json({
      userRegistrations,
      popularInventories: inventoryResult.rows.map((r) => ({
        ...r,
        items_count: parseInt(r.items_count),
      })),
      userDistribution,
      userGrowth: 5.2,
      activeUserRate: parseFloat(
        ((activeCount / parseInt(distData.total || 1)) * 100).toFixed(1)
      ),
      inventoryGrowth: 2.1,
    });
  } catch (err) {
    console.error("Admin get stats error:", err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/inventories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.*,
        u.email as user_email,
        (SELECT COUNT(*) FROM items WHERE inventory_id = i.id) as items_count
      FROM inventories i
      LEFT JOIN users u ON i.user_id = u.uid
      ORDER BY i.created_at DESC
    `);

    const inventories = result.rows.map((inv) => ({
      ...inv,
      fieldsSchema: mapRowToSchema(inv),
    }));

    res.json({ inventories });
  } catch (err) {
    console.error("Admin get inventories error:", err);
    res.status(500).json({ error: "Failed to get inventories" });
  }
});

export default router;
