import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  handleSalesforceCallback,
  getSalesforceStatus,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/salesforce-status", authMiddleware, getSalesforceStatus); 
router.post("/salesforce-callback", authMiddleware, handleSalesforceCallback);

export default router;
