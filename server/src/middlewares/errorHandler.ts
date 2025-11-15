import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types/api.types";
import { ZodError } from "zod";

/**
 * Error Handler Middleware
 * Centralized error handling for all API routes
 * Ensures consistent error response format across all endpoints
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err);

  // Default error response
  const errorResponse: ApiError = {
    error: err.message || "Internal Server Error",
  };

  let status = err.statusCode || 500;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    status = 400;
    errorResponse.error = "Validation failed";
    errorResponse.details = err.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }
  // Handle MongoDB duplicate key errors
  else if (err.code === 11000) {
    status = 400;
    errorResponse.error = "Duplicate entry: A record with this value already exists";
  }
  // Handle MongoDB cast errors (invalid ObjectId, etc.)
  else if (err.name === "CastError") {
    status = 400;
    errorResponse.error = `Invalid ${err.path}: ${err.message}`;
  }
  // Handle validation errors from controllers
  else if (err.name === "ValidationError") {
    status = 400;
    errorResponse.error = "Validation failed";
    if (err.errors) {
      errorResponse.details = Object.keys(err.errors).map((key) => ({
        path: [key],
        message: err.errors[key].message,
      }));
    }
  }

  res.status(status).json(errorResponse);
}
