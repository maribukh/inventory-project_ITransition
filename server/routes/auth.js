// server/routes/auth.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createUserRecord } from "../controllers/authController.js";

const router = express.Router();

// This endpoint will be called by the frontend *after* a successful Firebase login/signup
// It needs the authMiddleware to know *which* user just signed in (req.user)
router.post("/create-user-record", authMiddleware, createUserRecord);

export default router;
