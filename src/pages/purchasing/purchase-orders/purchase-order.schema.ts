import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().min(1, "Product required"),
  qty: z.number().min(1),
  price: z.number().min(0),
});

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Supplier required"),

  po_date: z.string().min(1),

  expected_date: z.string().optional(),

  supplier_reference: z.string().optional(),

  notes: z.string().optional(),

  items: z.array(purchaseOrderItemSchema).min(1, "Minimum 1 item"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
