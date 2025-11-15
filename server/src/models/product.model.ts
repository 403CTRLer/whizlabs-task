import { Schema, model } from "mongoose";

export interface IProduct {
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0, index: true }, // Index for price-based queries
  inStock: { type: Boolean, default: true, index: true }, // Index for stock filtering
  tags: { type: [String], default: [], index: true } // Index for tag-based queries
}, { timestamps: true });

export const ProductModel = model<IProduct>("Product", ProductSchema);
