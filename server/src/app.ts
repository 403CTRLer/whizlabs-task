import express from "express";
import cors from "cors";
import itemRoutes from "./routes/items";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requireAuth } from "./middlewares/auth.middleware";

/**
 * Express Application Setup
 * Configures middleware and routes for the Inventory Management API
 */
const app = express();

// Enable CORS for front-end communication
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get("/", (_, res) => res.json({ ok: true, version: "1.0.0" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/products", productRoutes);

// Example: Protected route using auth middleware
// app.post("/api/items", requireAuth(), asyncHandler(itemController.createItem));
// app.post("/api/items", requireAuth("admin"), asyncHandler(itemController.createItem)); // Admin only

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
