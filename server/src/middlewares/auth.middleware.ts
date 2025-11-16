import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../types/api.types";

/**
 * Extended Request interface to include user information
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "admin" | "user";
  };
}

/**
 * JWT payload structure
 */
interface JWTPayload {
  sub: string;
  role: "admin" | "user";
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * 
 * @param role - Optional role requirement. If provided, user must have this role or higher
 * @returns Express middleware function
 */
export const requireAuth = (role?: "admin" | "user") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Malformed Authorization header",
        });
      }

      // Extract token from "Bearer <token>"
      const token = authHeader.substring(7);

      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        const error: any = new Error("JWT_SECRET not configured");
        error.statusCode = 500;
        throw error;
      }

      let decoded: JWTPayload;
      try {
        decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] }) as JWTPayload;
      } catch (err: any) {
        // Handle expired tokens and other JWT errors
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            error: "Unauthorized",
            message: "Token expired",
          });
        }
        if (err.name === "JsonWebTokenError") {
          return res.status(401).json({
            error: "Unauthorized",
            message: "Invalid token",
          });
        }
        throw err;
      }

      // Attach user info to request
      (req as AuthRequest).user = {
        id: decoded.sub,
        role: decoded.role,
      };

      // Check role requirement if specified
      if (role === "admin" && decoded.role !== "admin") {
        return res.status(403).json({
          error: "Forbidden",
        });
      }

      next();
    } catch (error: any) {
      // If error has statusCode, let error handler process it
      if (error.statusCode) {
        throw error;
      }
      // Otherwise, return 401 for authentication errors
      return res.status(401).json({
        error: "Unauthorized",
        message: error.message || "Authentication failed",
      });
    }
  };
};

