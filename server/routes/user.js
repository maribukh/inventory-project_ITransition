import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { syncWithSalesforce } from "../controllers/userController.js";

const router = express.Router();

router.post("/sync-salesforce", authMiddleware, syncWithSalesforce);

export default router;
