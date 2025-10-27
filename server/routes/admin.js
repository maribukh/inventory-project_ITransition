// server/routes/admin.js
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js"; // Middleware to check if user is admin
import {
  getAllUsers,
  updateUser,
  // deleteUser // We might add this later if needed
} from "../controllers/usersController.js"; // Controller with the logic

const router = express.Router();

// Apply auth middleware first to all admin routes
router.use(authMiddleware);
// Apply admin middleware next to ensure only admins can access these
router.use(adminMiddleware);

// Define the routes
router.get("/users", getAllUsers); // GET /api/admin/users
router.put("/users/:uid", updateUser); // PUT /api/admin/users/:uid
// router.delete('/users/:uid', deleteUser); // Optional: DELETE /api/admin/users/:uid

export default router;
