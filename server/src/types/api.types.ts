import { z } from "zod";
import { createItemSchema, updateItemSchema } from "../validators/item.validator";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

/**
 * Validation Error Interface
 * Represents a single validation error from Zod schema validation
 */
export interface ValidationError {
  path: (string | number)[];
  message: string;
}

/**
 * API Error Response Interface
 * Standard format for all API error responses
 */
export interface ApiError {
  error: string;
  details?: ValidationError[];
}

/**
 * Request/Response Types for Items
 */
export type CreateItemRequest = z.infer<typeof createItemSchema>;
export type UpdateItemRequest = z.infer<typeof updateItemSchema>;

/**
 * Request/Response Types for Products
 */
export type CreateProductRequest = z.infer<typeof createProductSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductSchema>;

/**
 * Standard API Response Wrapper
 * Used for successful responses that return data
 */
export interface ApiResponse<T> {
  message?: string;
  data: T;
}

/**
 * Paginated Response Metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

