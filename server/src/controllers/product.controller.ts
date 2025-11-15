import { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";
import { ApiResponse, PaginatedResponse, ApiError } from "../types/api.types";

/**
 * GET /products
 * Retrieve all products
 * Supports optional query parameters for search, filtering, and pagination
 * 
 * Query Parameters:
 * - q: Text search query (requires text index)
 * - tag: Filter by tag
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
export const listProducts = async (req: Request, res: Response) => {
  try {
    const { q, tag, limit = "20", page = "1" } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const pageNum = Math.max(parseInt(page as string) || 1, 1);

    const filter: any = {};
    if (q) filter.$text = { $search: String(q) }; // text index optional
    if (tag) filter.tags = { $in: [String(tag)] };

    const products = await ProductModel.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await ProductModel.countDocuments(filter);
    
    const response: PaginatedResponse<any> = {
      data: products,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    };
    res.json(response);
  } catch (error) {
    throw error;
  }
};

/**
 * GET /products/:id
 * Retrieve a single product by its ID
 */
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorResponse: ApiError = { error: "Invalid product ID format" };
      return res.status(400).json(errorResponse);
    }
    
    const product = await ProductModel.findById(id);
    if (!product) {
      const errorResponse: ApiError = { error: "Product not found" };
      return res.status(404).json(errorResponse);
    }
    res.json(product);
  } catch (error) {
    throw error;
  }
};

/**
 * POST /products
 * Create a new product
 * Validates input data before creating the product
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const parsed = createProductSchema.safeParse(req.body);
    
    if (!parsed.success) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        details: parsed.error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      };
      return res.status(400).json(errorResponse);
    }

    // Create the product in the database
    const newProduct = await ProductModel.create(parsed.data);
    
    // Return the created product with 201 status
    const response: ApiResponse<any> = {
      message: "Product created successfully",
      data: newProduct,
    };
    res.status(201).json(response);
  } catch (error: any) {
    // Handle duplicate key errors or other MongoDB errors
    if (error.code === 11000) {
      const errorResponse: ApiError = {
        error: "Product with this name already exists",
      };
      return res.status(400).json(errorResponse);
    }
    throw error;
  }
};

/**
 * PUT /products/:id
 * Update an existing product by its ID
 * Validates input data and ensures product exists before updating
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorResponse: ApiError = { error: "Invalid product ID format" };
      return res.status(400).json(errorResponse);
    }
    
    // Validate request body against schema
    const parsed = updateProductSchema.safeParse(req.body);
    
    if (!parsed.success) {
      const errorResponse: ApiError = {
        error: "Validation failed",
        details: parsed.error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      };
      return res.status(400).json(errorResponse);
    }

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true } // Return updated document and run validators
    );
    
    if (!updatedProduct) {
      const errorResponse: ApiError = { error: "Product not found" };
      return res.status(404).json(errorResponse);
    }
    
    const response: ApiResponse<any> = {
      message: "Product updated successfully",
      data: updatedProduct,
    };
    res.json(response);
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /products/:id
 * Delete a product by its ID
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorResponse: ApiError = { error: "Invalid product ID format" };
      return res.status(400).json(errorResponse);
    }
    
    const deletedProduct = await ProductModel.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      const errorResponse: ApiError = { error: "Product not found" };
      return res.status(404).json(errorResponse);
    }
    
    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error) {
    throw error;
  }
};
