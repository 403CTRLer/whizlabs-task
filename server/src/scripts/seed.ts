import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../db";
import { ItemModel } from "../models/item.model";

/**
 * Seed Script
 * Populates the database with sample inventory items for testing
 */
async function seed() {
  await connectDB(process.env.MONGO_URI);
  
  // Clear existing items
  await ItemModel.deleteMany({});
  
  // Sample inventory items
  const sampleItems = [
    {
      itemName: "Laptop Computer",
      quantity: 15,
      price: 1299.99,
      description: "High-performance laptop with 16GB RAM and 512GB SSD",
      category: "Electronics",
    },
    {
      itemName: "Office Chair",
      quantity: 25,
      price: 299.99,
      description: "Ergonomic office chair with adjustable height and lumbar support",
      category: "Furniture",
    },
    {
      itemName: "Wireless Mouse",
      quantity: 50,
      price: 29.99,
      description: "Ergonomic wireless mouse with long battery life",
      category: "Electronics",
    },
    {
      itemName: "Desk Lamp",
      quantity: 30,
      price: 45.99,
      description: "LED desk lamp with adjustable brightness and color temperature",
      category: "Furniture",
    },
    {
      itemName: "Notebook Set",
      quantity: 100,
      price: 12.99,
      description: "Set of 3 ruled notebooks, 200 pages each",
      category: "Stationery",
    },
  ];
  
  await ItemModel.insertMany(sampleItems);
  console.log(`Seeded ${sampleItems.length} sample inventory items`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
