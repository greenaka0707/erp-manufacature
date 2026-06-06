import { z } from "zod";

export const categorySchema = z.object({
  code: z.string().min(2, "Code is required"),
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
