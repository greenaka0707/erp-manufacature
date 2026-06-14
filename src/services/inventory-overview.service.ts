import { supabase } from "@/lib/supabase";

export async function getStockOverview(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      remaining_qty,
      unit_cost,
      status,
      products(
        id,
        name,
        sku
      )
    `,
    )
    .eq("company_id", companyId);

  if (error) throw error;

  const grouped = Object.values(
    (data || []).reduce((acc: any, batch: any) => {
      const productId = batch.products?.id;

      if (!productId) return acc;

      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          product_name: batch.products.name,
          sku: batch.products.sku,
          total_qty: 0,
          inventory_value: 0,
          batch_count: 0,
        };
      }

      acc[productId].total_qty += Number(batch.remaining_qty || 0);

      acc[productId].inventory_value += Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0);

      acc[productId].batch_count += 1;

      return acc;
    }, {}),
  );

  return grouped.sort((a: any, b: any) => b.inventory_value - a.inventory_value);
}
