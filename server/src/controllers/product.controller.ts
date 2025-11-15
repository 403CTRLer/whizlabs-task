import { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

export const listProducts = async (req: Request, res: Response) => {
  const { q, tag, limit = "20", page = "1" } = req.query;
  const l = Math.min(parseInt(limit as string) || 20, 100);
  const p = Math.max(parseInt(page as string) || 1, 1);

  const filter: any = {};
  if (q) filter.$text = { $search: String(q) }; // text index optional
  if (tag) filter.tags = { $in: [String(tag)] };

  const items = await ProductModel.find(filter)
    .skip((p - 1) * l)
    .limit(l)
    .sort({ createdAt: -1 });

  const total = await ProductModel.countDocuments(filter);
  res.json({ data: items, meta: { total, page: p, limit: l } });
};

export const getProduct = async (req: Request, res: Response) => {
  const doc = await ProductModel.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Product not found" });
  res.json(doc);
};

export const createProduct = async (req: Request, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const created = await ProductModel.create(parsed.data);
  res.status(201).json(created);
};

export const updateProduct = async (req: Request, res: Response) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const updated = await ProductModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ error: "Product not found" });
  res.json(updated);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const removed = await ProductModel.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ error: "Not found" });
  res.status(204).send();
};
