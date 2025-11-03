import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getInventories,
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoriesController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getInventories);
router.post("/", createInventory);
router.get("/:inventoryId", getInventory);
router.put("/:inventoryId", updateInventory);
router.delete("/:inventoryId", deleteInventory);

export default router;
