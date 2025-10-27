import pool from "../utils/db.js";

function buildSearchText(schema, data) {
  let parts = [];
  if (Array.isArray(schema)) {
    schema.forEach((f) => {
      const val = data[f.key];
      if (val !== undefined && val !== null) parts.push(String(val));
    });
  } else {
    Object.values(data).forEach((v) => parts.push(String(v)));
  }
  return parts.join(" ").toLowerCase();
}

async function checkInventoryOwner(inventoryId, userId) {
  const result = await pool.query(
    "SELECT user_id, fields_schema FROM inventories WHERE id = $1",
    [inventoryId]
  );
  const inv = result.rows[0];
  if (!inv) throw new Error("Inventory not found");
  if (inv.user_id !== userId) throw new Error("Forbidden");
  return inv; 
}

async function createItem(req, res) {
  try {
    const uid = req.user.uid;
    const { inventoryId, data } = req.body;
    if (!inventoryId || !data)
      return res.status(400).json({ error: "Missing args" });

    const inv = await checkInventoryOwner(inventoryId, uid);

    const searchText = buildSearchText(inv.fields_schema, data);

    const result = await pool.query(
      `INSERT INTO items (inventory_id, data, search_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [inventoryId, JSON.stringify(data), searchText]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Inventory not found"
        ? 404
        : 500;
    res.status(status).json({ error: err.message || "createItem error" });
  }
}

async function getItems(req, res) {
  try {
    const uid = req.user.uid;
    const { inventoryId, limit = 200 } = req.query;
    if (!inventoryId)
      return res.status(400).json({ error: "Missing inventoryId" });

    const inv = await checkInventoryOwner(inventoryId, uid);

    const itemsResult = await pool.query(
      "SELECT * FROM items WHERE inventory_id = $1 ORDER BY created_at DESC LIMIT $2",
      [inventoryId, limit]
    );

    res.json({
      items: itemsResult.rows,
      inventory: {
        id: inventoryId,
        user_id: inv.user_id,
        fields_schema: inv.fields_schema,
      },
    });
  } catch (err) {
    console.error(err);
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Inventory not found"
        ? 404
        : 500;
    res.status(status).json({ error: err.message || "getItems error" });
  }
}

async function updateItem(req, res) {
  try {
    const uid = req.user.uid;
    const { itemId } = req.params;
    const { inventoryId, data } = req.body;
    if (!inventoryId || !itemId || !data)
      return res.status(400).json({ error: "Missing args" });

    const inv = await checkInventoryOwner(inventoryId, uid);

    const searchText = buildSearchText(inv.fields_schema, data);

    const result = await pool.query(
      `UPDATE items SET data = $1, search_text = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND inventory_id = $4
       RETURNING *`,
      [JSON.stringify(data), searchText, itemId, inventoryId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Inventory not found"
        ? 404
        : 500;
    res.status(status).json({ error: err.message || "updateItem error" });
  }
}

async function deleteItem(req, res) {
  try {
    const uid = req.user.uid;
    const { inventoryId } = req.body; 
    const { itemId } = req.params;
    if (!inventoryId || !itemId)
      return res.status(400).json({ error: "Missing args" });

    await checkInventoryOwner(inventoryId, uid);

    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 AND inventory_id = $2",
      [itemId, inventoryId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    const status =
      err.message === "Forbidden"
        ? 403
        : err.message === "Inventory not found"
        ? 404
        : 500;
    res.status(status).json({ error: err.message || "deleteItem error" });
  }
}

export { createItem, getItems, updateItem, deleteItem };
