// [file name]: routes/search.js
// Search routes for ES modules

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", globalSearch);

export default router;
