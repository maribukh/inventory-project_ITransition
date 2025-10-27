import pool from "../utils/db.js";

async function getInventories(req, res) {
  try {
    const uid = req.user.uid;
    const result = await pool.query(
      "SELECT * FROM inventories WHERE user_id = $1 ORDER BY created_at DESC",
      [uid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "getInventories error" });
  }
}

async function createInventory(req, res) {
  try {
    const uid = req.user.uid;
    const { name, description = "", fieldsSchema = [] } = req.body;

    const result = await pool.query(
      `INSERT INTO inventories (user_id, name, description, fields_schema)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, 
      [uid, name, description, JSON.stringify(fieldsSchema)] 
    );

    res.json(result.rows[0]);
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

    res.json(result.rows[0]);
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

    const updates = [];
    const values = [inventoryId, uid];

    if (name !== undefined) {
      values.push(name);
      updates.push(`name = $${values.length}`);
    }
    if (description !== undefined) {
      values.push(description);
      updates.push(`description = $${values.length}`);
    }
    if (fieldsSchema !== undefined) {
      values.push(JSON.stringify(fieldsSchema));
      updates.push(`fields_schema = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP"); 

    const result = await pool.query(
      `UPDATE inventories SET ${updates.join(", ")}
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found or forbidden" });
    }

    res.json(result.rows[0]);
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
