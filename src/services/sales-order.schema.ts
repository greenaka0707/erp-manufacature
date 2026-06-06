import { z } from "zod";

export const salesOrderSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),

  salesperson_id: z.string().min(1, "Sales Person wajib dipilih"),

  order_date: z.string().min(1, "Tanggal wajib diisi"),

  notes: z.string().optional(),

  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "Produk wajib dipilih"),

        qty: z.number().min(1, "Qty minimal 1"),

        unit_price: z.number().min(0),

        discount_amount: z.number().optional(),
      }),
    )
    .min(1, "Minimal 1 item"),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

export interface SalesOrderItemPayload {
  product_id: string;
  qty: number;
  unit_price: number;
  discount_amount?: number;
}

export interface SalesOrderPayload {
  customer_id: string;
  order_date: string;
  notes?: string;
  items: SalesOrderItemPayload[];
}
