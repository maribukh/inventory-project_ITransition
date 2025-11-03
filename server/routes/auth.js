import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createUserRecord } from "../controllers/authController.js";

const router = express.Router();
router.post("/create-user-record", authMiddleware, createUserRecord);

export default router;
