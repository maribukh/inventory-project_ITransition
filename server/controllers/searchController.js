import pool from "../utils/db.js";

async function globalSearch(req, res) {
  try {
    const uid = req.user.uid;
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = `%${q.trim().toLowerCase()}%`;

    const result = await pool.query(
      `SELECT
          i.id,
          i.custom_id,
          i.search_text,
          i.inventory_id,
          inv.name AS inventory_name,
          i.created_at
       FROM items i
       JOIN inventories inv ON i.inventory_id = inv.id
       WHERE
          inv.user_id = $1
          AND (
            LOWER(i.search_text) LIKE $2 
            OR LOWER(i.custom_id) LIKE $2
            OR LOWER(inv.name) LIKE $2
          )
       ORDER BY 
         CASE 
           WHEN LOWER(i.custom_id) LIKE $2 THEN 1
           WHEN LOWER(i.search_text) LIKE $2 THEN 2
           ELSE 3
         END,
         i.created_at DESC
       LIMIT $3`,
      [uid, searchTerm, limit]
    );

    const results = result.rows.map((row) => ({
      id: row.id,
      customId: row.custom_id,
      searchText: row.search_text,
      inventoryId: row.inventory_id,
      inventoryName: row.inventory_name,
      createdAt: row.created_at,
    }));

    console.log(`🔍 Search for "${q}": found ${results.length} results`);
    res.json({ results });
  } catch (err) {
    console.error("Global search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
}

export { globalSearch };
