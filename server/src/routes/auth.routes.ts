import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import asyncHandler from "../middlewares/asyncHandler";

/**
 * Auth Router
 * Defines all routes for authentication
 */
const router = Router();

// POST /api/auth/login - Authenticate user and get JWT token
router.post("/login", asyncHandler(authController.login));

export default router;

