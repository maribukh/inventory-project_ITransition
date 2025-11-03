import pool from "../utils/db.js";

async function globalSearch(req, res) {
  try {
    const uid = req.user.uid;
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const searchTermFTS = searchTerm
      .split(" ")
      .filter((s) => s)
      .join(" & ");
    const searchTermLike = `%${searchTerm.toLowerCase()}%`;

    const query = `
      WITH search_results AS (
        SELECT
          inv.id as "inventoryId",
          inv.name as "inventoryName",
          inv.description as "searchText",
          -- Приоритет 1: Полное совпадение по FTS
          ts_rank(to_tsvector('simple', inv.name || ' ' || COALESCE(inv.description, '')), to_tsquery('simple', $2)) as rank
        FROM inventories inv
        WHERE
          (inv.user_id = $1 OR inv.is_public = true) AND
          to_tsvector('simple', inv.name || ' ' || COALESCE(inv.description, '')) @@ to_tsquery('simple', $2)

        UNION

        SELECT
          inv.id as "inventoryId",
          inv.name as "inventoryName",
          inv.description as "searchText",
          -- Приоритет 2: Частичное совпадение по LIKE
          0.1 as rank
        FROM inventories inv
        WHERE
          (inv.user_id = $1 OR inv.is_public = true) AND
          (LOWER(inv.name) LIKE $3 OR LOWER(COALESCE(inv.description, '')) LIKE $3)
      )
      SELECT
        sr."inventoryId",
        sr."inventoryName",
        sr."searchText"
      FROM search_results sr
      GROUP BY sr."inventoryId", sr."inventoryName", sr."searchText", sr.rank
      ORDER BY sr.rank DESC, sr."inventoryName" ASC
      LIMIT $4;
    `;

    const result = await pool.query(query, [
      uid,
      searchTermFTS,
      searchTermLike,
      limit,
    ]);

    const finalResults = result.rows.map((row) => ({
      ...row,
      id: row.inventoryId, 
      customId: null,
    }));

    res.json({ results: finalResults });
  } catch (err) {
    console.error("Global search error:", err);
    res.status(500).json({ error: "globalSearch error" });
  }
}

export { globalSearch };
