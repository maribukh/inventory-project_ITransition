import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { handleSalesforceCallback } from "../controllers/userController.js";

const router = express.Router();

router.post("/salesforce-callback", authMiddleware, handleSalesforceCallback);

export default router;
