import { Request, Response } from "express";
import { ItemModel } from "../models/item.model";
import { createItemSchema, updateItemSchema } from "../validators/item.validator";
import { generateItemDescription } from "../services/ai.service";

/**
 * GET /items
 * Retrieve all inventory items
 * Supports optional query parameters for search, filtering, and pagination
 * 
 * Query Parameters:
 * - search: Search in itemName and description (case-insensitive)
 * - category: Filter by category (case-insensitive)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 */
export const listItems = async (req: Request, res: Response) => {
  try {
    const { search, category, limit = "10", page = "1" } = req.query;
    
    // Parse and validate pagination parameters
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const pageNum = Math.max(parseInt(page as string) || 1, 1);
    
    // Build filter object
    const filter: any = {};
    
    // Search filter (searches in itemName and description)
    if (search) {
      filter.$or = [
        { itemName: { $regex: String(search), $options: "i" } },
        { description: { $regex: String(search), $options: "i" } }
      ];
    }
    
    // Category filter
    if (category) {
      filter.category = { $regex: String(category), $options: "i" }; // Case-insensitive search
    }
    
    // Fetch items with pagination
    const items = await ItemModel.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // Most recent first
    
    // Get total count for pagination metadata
    const total = await ItemModel.countDocuments(filter);
    
    res.json({
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    throw error; // Let asyncHandler catch and process the error
  }
};

/**
 * GET /items/:id
 * Retrieve a single item by its ID
 */
export const getItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }
    
    const item = await ItemModel.findById(id);
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json(item);
  } catch (error) {
    throw error;
  }
};

/**
 * POST /items
 * Create a new inventory item
 * Validates input data before creating the item
 */
export const createItem = async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const parsed = createItemSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.errors,
      });
    }
    
    // Create the item in the database
    const newItem = await ItemModel.create(parsed.data);
    
    // Return the created item with 201 status
    res.status(201).json({
      message: "Item created successfully",
      data: newItem,
    });
  } catch (error: any) {
    // Handle duplicate key errors or other MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Item with this name already exists",
      });
    }
    throw error;
  }
};

/**
 * PUT /items/:id
 * Update an existing item by its ID
 * Validates input data and ensures item exists before updating
 */
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }
    
    // Validate request body against schema
    const parsed = updateItemSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parsed.error.errors,
      });
    }
    
    // Update the item
    const updatedItem = await ItemModel.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true } // Return updated document and run validators
    );
    
    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json({
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /items/:id
 * Delete an item by its ID
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }
    
    const deletedItem = await ItemModel.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error) {
    throw error;
  }
};

/**
 * GET /items/stats
 * Get inventory analytics and statistics
 * Returns KPIs including total items, total value, low stock count, and unique categories
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    // Get total number of items
    const totalItems = await ItemModel.countDocuments();
    
    // Calculate total inventory value (sum of price * quantity)
    const items = await ItemModel.find({});
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Count low stock items (quantity < 10, configurable threshold)
    const lowStockThreshold = 10;
    const lowStockCount = await ItemModel.countDocuments({
      quantity: { $lt: lowStockThreshold }
    });
    
    // Get unique categories count
    const uniqueCategories = await ItemModel.distinct("category");
    const categoryCount = uniqueCategories.length;
    
    // Get item count by category
    const categoryCounts = await ItemModel.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Format category data
    const categories = categoryCounts.map(cat => ({
      category: cat._id,
      count: cat.count,
      totalValue: cat.totalValue
    }));
    
    res.json({
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
      lowStockCount,
      lowStockThreshold,
      categoryCount,
      categories,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /items/categories
 * Get all unique category names from the database
 * Used for populating filter dropdowns
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ItemModel.distinct("category");
    res.json({
      categories: categories.sort(), // Return sorted alphabetically
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /items/generate-description
 * Generate a product description using AI
 * 
 * This endpoint demonstrates integration with Generative AI capabilities.
 * In production, this would call an external AI service (OpenAI, Anthropic, etc.)
 */
export const generateDescription = async (req: Request, res: Response) => {
  try {
    const { itemName, category } = req.body;
    
    // Validate required fields
    if (!itemName || !category) {
      return res.status(400).json({
        error: "itemName and category are required",
      });
    }
    
    // Validate input format
    if (typeof itemName !== "string" || typeof category !== "string") {
      return res.status(400).json({
        error: "itemName and category must be strings",
      });
    }
    
    // Generate description using AI service
    const description = await generateItemDescription(itemName, category);
    
    res.json({
      description,
    });
  } catch (error) {
    throw error;
  }
};
