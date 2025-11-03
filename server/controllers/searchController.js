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

    const allTextFields = [
      "i.custom_id",
      "i.custom_string1",
      "i.custom_string2",
      "i.custom_string3",
      "i.custom_text1",
      "i.custom_text2",
      "i.custom_text3",
      "i.custom_number1::text",
      "i.custom_number2::text",
      "i.custom_number3::text",
      "i.custom_link1",
      "i.custom_link2",
      "i.custom_link3",
    ]
      .map((field) => `COALESCE(${field}, '')`)
      .join(" || ' ' || ");

    const query = `
      SELECT
          i.id,
          i.custom_id,
          inv.id AS "inventoryId",
          inv.name AS "inventoryName",
          (${allTextFields}) AS "searchText"
       FROM items i
       JOIN inventories inv ON i.inventory_id = inv.id
       WHERE
          (inv.user_id = $1 OR inv.is_public = true)
          AND (
            to_tsvector('simple', ${allTextFields}) @@ to_tsquery('simple', $2)
          )
       ORDER BY 
         ts_rank(to_tsvector('simple', ${allTextFields}), to_tsquery('simple', $2)) DESC,
         i.created_at DESC
       LIMIT $3`;

    const result = await pool.query(query, [uid, searchTermFTS, limit]);

    res.json({ results: result.rows });
  } catch (err) {
    console.error("Global search error:", err);
    res.status(500).json({ error: "globalSearch error" });
  }
}

export { globalSearch };
