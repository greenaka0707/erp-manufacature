import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),

  category_id: z.string().min(1, "Category is required"),

  unit_id: z.string().min(1, "Unit is required"),

  minimum_stock: z.number().min(0),

  description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
