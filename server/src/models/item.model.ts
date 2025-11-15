import { Schema, model } from "mongoose";

/**
 * Interface for Inventory Item
 * Represents the structure of an inventory item in the system
 */
export interface IItem {
  itemName: string;
  quantity: number;
  price: number;
  description: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Item Schema
 * Defines the MongoDB schema for inventory items with validation
 */
const ItemSchema = new Schema<IItem>(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      index: true, // Index for faster queries
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true, // Index for category-based queries
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the Item model
export const ItemModel = model<IItem>("Item", ItemSchema);

