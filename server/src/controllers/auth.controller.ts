import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../types/api.types";

/**
 * Login validation schema
 * Validates email and password input
 */
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Request body: { email: string, password: string }
 * Response: { token: string, user: { _id: string, email: string, role: string } }
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsed = loginSchema.safeParse(req.body);
    
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

    const { email, password } = parsed.data;

    // Find user by email (case-insensitive search)
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    // Return generic error for security (don't reveal if email exists)
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    // JWT_SECRET must be set in environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      const error: any = new Error("JWT_SECRET not configured");
      error.statusCode = 500;
      throw error;
    }

    // Create token payload with user ID and role
    const tokenPayload = {
      sub: user._id.toString(),
      role: user.role,
    };

    // Sign token with 7 day expiration
    const token = jwt.sign(tokenPayload, jwtSecret, {
      algorithm: "HS256",
      expiresIn: "7d",
    });

    // Return token and user info (without password)
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    // Re-throw to be handled by error middleware
    throw error;
  }
};

