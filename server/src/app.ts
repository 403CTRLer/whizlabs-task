import express from "express";
import cors from "cors";
import itemRoutes from "./routes/items";
import { errorHandler } from "./middlewares/errorHandler";

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

// API Routes - All item operations are under /api/items
app.use("/api/items", itemRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
