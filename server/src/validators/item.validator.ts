import { z } from "zod";

/**
 * Validation schema for creating a new item
 * Ensures all required fields are present and valid
 */
export const createItemSchema = z.object({
  itemName: z
    .string()
    .min(1, "Item name is required")
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name must not exceed 100 characters"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .nonnegative("Quantity cannot be negative"),
  price: z
    .number()
    .nonnegative("Price cannot be negative")
    .finite("Price must be a valid number"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must not exceed 50 characters"),
});

/**
 * Validation schema for updating an existing item
 * All fields are optional, but if provided, they must be valid
 */
export const updateItemSchema = createItemSchema.partial();

