// [file name]: routes/users.js
// Users routes for ES modules

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getAllUsers);
router.put("/:uid", updateUser);
router.delete("/:uid", deleteUser);

export default router;
