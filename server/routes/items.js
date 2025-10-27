// [file name]: routes/items.js
// Items routes for ES modules

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getItems);
router.post("/", createItem);
router.put("/:itemId", updateItem);
router.delete("/:itemId", deleteItem);

export default router;
