import { Router } from "express";
import * as itemController from "../controllers/item.controller";
import asyncHandler from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";

/**
 * Items Router
 * Defines all routes for inventory item CRUD operations and analytics
 */
const router = Router();

// GET /items/stats - Get inventory statistics
router.get("/stats", asyncHandler(itemController.getStats));

// GET /items/categories - Get all unique categories
router.get("/categories", asyncHandler(itemController.getCategories));

// POST /items/generate-description - Generate AI description
router.post("/generate-description", asyncHandler(itemController.generateDescription));

// GET /items - Retrieve all items
router.get("/", asyncHandler(itemController.listItems));

// GET /items/:id - Retrieve a single item by ID
router.get("/:id", asyncHandler(itemController.getItem));

// POST /items - Create a new item (protected)
router.post("/", requireAuth(), asyncHandler(itemController.createItem));

// PUT /items/:id - Update an existing item (protected)
router.put("/:id", requireAuth(), asyncHandler(itemController.updateItem));

// DELETE /items/:id - Delete an item (protected)
router.delete("/:id", requireAuth(), asyncHandler(itemController.deleteItem));

export default router;

