import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  symbol: z.string().min(1, "Symbol is required"),
});

export type UnitFormValues = z.infer<typeof unitSchema>;
