import pool from "../utils/db.js";

async function checkInventoryOwner(inventoryId, userId) {
  const result = await pool.query("SELECT * FROM inventories WHERE id = $1", [
    inventoryId,
  ]);
  const inv = result.rows[0];
  if (!inv) throw new Error("Inventory not found");
  if (inv.user_id !== userId) throw new Error("Forbidden");
  return inv;
}

function buildSearchText(data) {
  return Object.values(data)
    .filter((v) => v !== null && v !== undefined)
    .join(" ")
    .toLowerCase();
}

async function createItem(req, res) {
  try {
    const uid = req.user.uid;
    const { inventoryId, data, customId } = req.body;

    if (!inventoryId || !data)
      return res.status(400).json({ error: "Missing args" });

    await checkInventoryOwner(inventoryId, uid);

    const dataForSql = {
      ...data,
      custom_id: customId || null,
      inventory_id: inventoryId,
      search_text: buildSearchText(data),
    };

    const columns = Object.keys(dataForSql).join(", ");
    const values = Object.values(dataForSql);
    const valuePlaceholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO items (${columns})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Custom ID already exists" });
    }
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

    const types = ["string", "text", "number", "boolean", "link"];
    const fieldsSchema = [];
    for (const type of types) {
      for (let i = 1; i <= 3; i++) {
        if (inv[`custom_${type}${i}_state`] === true) {
          fieldsSchema.push({
            key: `custom_${type}${i}`,
            label: inv[`custom_${type}${i}_name`],
            type: type,
          });
        }
      }
    }

    res.json({
      items: itemsResult.rows,
      inventory: {
        id: inv.id,
        name: inv.name,
        description: inv.description,
        fieldsSchema: fieldsSchema,
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
    const { inventoryId, data, customId } = req.body;

    if (!inventoryId || !itemId || !data)
      return res.status(400).json({ error: "Missing args" });

    await checkInventoryOwner(inventoryId, uid);

    const dataForSql = {
      ...data,
      custom_id: customId || null,
      search_text: buildSearchText(data),
      updated_at: new Date(),
    };

    const columns = Object.keys(dataForSql);
    const values = Object.values(dataForSql);

    const setClause = columns
      .map((col, i) => `"${col}" = $${i + 1}`)
      .join(", ");

    values.push(itemId);
    values.push(inventoryId);

    const query = `
      UPDATE items
      SET ${setClause}
      WHERE id = $${values.length - 1} AND inventory_id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Custom ID already exists" });
    }
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
