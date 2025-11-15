import { Router } from "express";
import * as ctrl from "../controllers/product.controller";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(ctrl.listProducts));
router.get("/:id", asyncHandler(ctrl.getProduct));
router.post("/", asyncHandler(ctrl.createProduct));
router.put("/:id", asyncHandler(ctrl.updateProduct));
router.delete("/:id", asyncHandler(ctrl.deleteProduct));

export default router;
