import { z } from "zod";

export const warehouseSchema = z.object({
  code: z.string().min(1, "Code is required"),

  name: z.string().min(1, "Name is required"),

  description: z.string().optional(),

  warehouse_type: z.enum(["GENERAL", "GREEN_BEAN", "PRODUCTION", "FINISHED_GOODS", "REJECT"]),

  is_default: z.boolean(),

  allow_negative_stock: z.boolean(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
