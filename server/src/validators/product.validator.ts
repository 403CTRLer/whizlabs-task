import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export const updateProductSchema = createProductSchema.partial();
