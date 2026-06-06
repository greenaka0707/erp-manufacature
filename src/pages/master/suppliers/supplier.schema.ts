import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),

  phone: z.string().optional(),

  email: z.string().email().optional().or(z.literal("")),

  address: z.string().optional(),

  contact_person: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
