import pool from "../utils/db.js";

function mapSchemaToQuery(fieldsSchema) {
  const updates = [];
  const values = [];

  const counters = {
    string: 1,
    text: 1,
    number: 1,
    boolean: 1,
    link: 1,
  };

  const typesForReset = ["string", "text", "number", "boolean", "link"];
  for (const type of typesForReset) {
    for (let i = 1; i <= 3; i++) {
      updates.push(`custom_${type}${i}_name = $${values.length + 1}`);
      values.push(null);
      updates.push(`custom_${type}${i}_state = $${values.length + 1}`);
      values.push(false);
    }
  }

  if (Array.isArray(fieldsSchema)) {
    for (const field of fieldsSchema) {
      const type = field.type;
      if (!counters[type]) continue;
      const count = counters[type];
      if (count <= 3) {
        const nameIndex = typesForReset.indexOf(type) * 6 + (count - 1) * 2;
        const stateIndex = nameIndex + 1;

        values[nameIndex] = field.label;
        values[stateIndex] = true;

        counters[type]++;
      }
    }
  }
  return { updates, values };
}

function mapRowToSchema(inv) {
  const fieldsSchema = [];
  const types = ["string", "text", "number", "boolean", "link"];

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
  return fieldsSchema;
}

async function getInventories(req, res) {
  try {
    const uid = req.user.uid;

    const query = `
      SELECT 
        i.*, 
        u.email as user_email,
        (SELECT COUNT(*) FROM items WHERE inventory_id = i.id) as items_count
      FROM inventories i
      LEFT JOIN users u ON i.user_id = u.uid
      WHERE i.user_id = $1 OR i.is_public = true
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query, [uid]);

    const inventories = result.rows.map((inv) => ({
      ...inv,
      fieldsSchema: mapRowToSchema(inv),
    }));

    res.json(inventories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "getInventories error" });
  }
}

async function createInventory(req, res) {
  try {
    const uid = req.user.uid;
    const { name, description, fieldsSchema, is_public } = req.body;

    const columns = ["name", "description", "user_id", "is_public"];
    const values = [name, description, uid, is_public || false];

    const counters = { string: 1, text: 1, number: 1, boolean: 1, link: 1 };

    if (Array.isArray(fieldsSchema)) {
      for (const field of fieldsSchema) {
        const type = field.type;
        if (counters[type] && counters[type] <= 3) {
          const count = counters[type];

          columns.push(`custom_${type}${count}_name`);
          values.push(field.label);

          columns.push(`custom_${type}${count}_state`);
          values.push(true);

          counters[type]++;
        }
      }
    }

    const valuePlaceholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO inventories (${columns.join(", ")})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const newInventory = result.rows[0];

    res.status(201).json({
      ...newInventory,
      fieldsSchema: mapRowToSchema(newInventory),
    });
  } catch (err) {
    console.error("Create inventory DB error:", err);
    res.status(500).json({ error: "createInventory error" });
  }
}

async function getInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const uid = req.user.uid;

    const query = `
      SELECT i.*, u.email as user_email
      FROM inventories i
      LEFT JOIN users u ON i.user_id = u.uid
      WHERE i.id = $1
    `;

    const invResult = await pool.query(query, [inventoryId]);

    if (invResult.rowCount === 0) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    const inventory = invResult.rows[0];

    if (inventory.user_id !== uid && !inventory.is_public) {
      return res.status(403).json({ error: "Forbidden: Inventory is private" });
    }

    const itemsResult = await pool.query(
      `SELECT * FROM items WHERE inventory_id = $1 ORDER BY created_at DESC`,
      [inventoryId]
    );

    res.json({
      inventory: {
        ...inventory,
        fieldsSchema: mapRowToSchema(inventory),
      },
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "getInventory error" });
  }
}

async function updateInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const uid = req.user.uid;
    const { name, description, fieldsSchema } = req.body;

    const { updates, values } = mapSchemaToQuery(fieldsSchema);

    if (name !== undefined) {
      updates.push(`name = $${values.length + 1}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(description);
    }

    values.push(inventoryId);
    values.push(uid);

    const query = `
      UPDATE inventories
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found or forbidden" });
    }

    const updatedInventory = result.rows[0];

    res.json({
      ...updatedInventory,
      fieldsSchema: mapRowToSchema(updatedInventory),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "updateInventory error" });
  }
}

async function deleteInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const uid = req.user.uid;

    const result = await pool.query(
      "DELETE FROM inventories WHERE id = $1 AND user_id = $2",
      [inventoryId, uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found or forbidden" });
    }

    res.status(204).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "deleteInventory error" });
  }
}

export {
  getInventories,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
  mapRowToSchema,
};
