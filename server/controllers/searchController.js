import pool from "../utils/db.js";

async function globalSearch(req, res) {
  try {
    const uid = req.user.uid;
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchTermFTS = q.trim().split(" ").join(" & ");
    const searchTermLike = `%${q.trim().toLowerCase()}%`;

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
          (inv.user_id = $1 OR inv.is_public = true)
          AND (
            to_tsvector('simple', i.search_text) @@ to_tsquery('simple', $2)
            OR LOWER(i.custom_id) LIKE $3
          )
       ORDER BY 
         ts_rank(to_tsvector('simple', i.search_text), to_tsquery('simple', $2)) DESC,
         i.created_at DESC
       LIMIT $4`,
      [uid, searchTermFTS, searchTermLike, limit]
    );

    const results = result.rows.map((row) => ({
      id: row.id,
      customId: row.custom_id,
      searchText: row.search_text,
      inventoryId: row.inventory_id,
      inventoryName: row.inventory_name,
      createdAt: row.created_at,
    }));

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "globalSearch error" });
  }
}

export { globalSearch };
