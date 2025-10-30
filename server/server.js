import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import inventoriesRoutes from "./routes/inventories.js";
import itemsRoutes from "./routes/items.js";
import searchRoutes from "./routes/search.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/inventories", inventoriesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    time: Date.now(),
    message: "Inventory API Server is running with Firebase",
    database: "Firebase Firestore",
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
});
