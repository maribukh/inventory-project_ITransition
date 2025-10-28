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
      updates.push(`custom_${type}${i}_name = $${values.push(null)}`);
      updates.push(`custom_${type}${i}_state = $${values.push(false)}`);
    }
  }

  if (Array.isArray(fieldsSchema)) {
    for (const field of fieldsSchema) {
      const type = field.type;

      if (!counters[type]) continue;

      const count = counters[type];

      if (count <= 3) {
        updates.push(
          `custom_${type}${count}_name = $${values.push(field.label)}`
        );
        updates.push(`custom_${type}${count}_state = $${values.push(true)}`);
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
    const result = await pool.query(
      "SELECT * FROM inventories WHERE user_id = $1 ORDER BY created_at DESC",
      [uid]
    );

    const inventories = result.rows.map((inv) => {
      const fieldsSchema = mapRowToSchema(inv);
      return { ...inv, fieldsSchema };
    });

    res.json(inventories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "getInventories error" });
  }
}

async function createInventory(req, res) {
  try {
    const uid = req.user.uid;
    const { name, description = "", fieldsSchema = [] } = req.body;

    const { updates, values } = mapSchemaToQuery(fieldsSchema);

    const queryValues = [uid, name, description, ...values];

    const columnNames = updates.map((u) => u.split(" = ")[0]).join(", ");
    const valuePlaceholders = values.map((_, i) => `$${i + 4}`).join(", ");

    const query = `
      INSERT INTO inventories (user_id, name, description, ${columnNames})
      VALUES ($1, $2, $3, ${valuePlaceholders})
      RETURNING *
    `;

    const result = await pool.query(query, queryValues);
    const newInventory = result.rows[0];

    res.json({
      ...newInventory,
      fieldsSchema: mapRowToSchema(newInventory),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "createInventory error" });
  }
}

async function getInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const uid = req.user.uid;

    const result = await pool.query(
      "SELECT * FROM inventories WHERE id = $1 AND user_id = $2",
      [inventoryId, uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found or forbidden" });
    }

    const inventory = result.rows[0];
    res.json({
      ...inventory,
      fieldsSchema: mapRowToSchema(inventory),
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
      updates.push(`name = $${values.push(name)}`);
    }
    if (description !== undefined) {
      updates.push(`description = $${values.push(description)}`);
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

    res.json({ ok: true });
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
};
