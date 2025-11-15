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
  price: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true },
  tags: { type: [String], default: [] }
}, { timestamps: true });

export const ProductModel = model<IProduct>("Product", ProductSchema);
