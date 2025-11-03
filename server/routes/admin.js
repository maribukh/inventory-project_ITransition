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

    const inventories = result.rows.map((inv) => {
      return {
        ...inv,
        fieldsSchema: mapRowToSchema(inv),
      };
    });

    res.json({ inventories });
  } catch (err) {
    console.error("Admin get inventories error:", err);
    res.status(500).json({ error: "Failed to get inventories" });
  }
});

export default router;
