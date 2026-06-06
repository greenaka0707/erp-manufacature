import { z } from "zod";

export const salespersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export type SalespersonFormValues = z.infer<typeof salespersonSchema>;
