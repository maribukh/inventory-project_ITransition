import pool from "../utils/db.js";

async function globalSearch(req, res) {
  try {
    const uid = req.user.uid;
    const { q, limit = 50 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Search query too short" });
    }

    const searchTerm = `%${q.toLowerCase().trim()}%`;

    const result = await pool.query(
      `SELECT
          i.id,
          i.data,
          i.search_text,
          i.inventory_id,
          inv.name AS inventory_name
       FROM items i
       JOIN inventories inv ON i.inventory_id = inv.id
       WHERE
          inv.user_id = $1
          AND i.search_text ILIKE $2
       ORDER BY i.created_at DESC
       LIMIT $3`,
      [uid, searchTerm, limit]
    );

    res.json({ results: result.rows });
  } catch (err) {
    console.error("Global search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
}

export { globalSearch };
