import { supabase } from "@/lib/supabase";

export async function getInventoryMonitoring(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      remaining_qty,
      unit_cost,
      products(
        id,
        sku,
        name,
        minimum_stock,
        product_type
      )
    `,
    )
    .eq("company_id", companyId);

  if (error) throw error;

  const grouped = Object.values(
    (data || []).reduce((acc: any, batch: any) => {
      const product = batch.products;

      if (!product) return acc;

      if (!acc[product.id]) {
        acc[product.id] = {
          product_id: product.id,
          sku: product.sku,
          product_name: product.name,
          product_type: product.product_type,
          minimum_stock: Number(product.minimum_stock || 0),
          current_stock: 0,
          inventory_value: 0,
        };
      }

      acc[product.id].current_stock += Number(batch.remaining_qty || 0);

      acc[product.id].inventory_value += Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0);

      return acc;
    }, {}),
  );

  return grouped.sort((a: any, b: any) => {
    const aGap = a.current_stock - a.minimum_stock;

    const bGap = b.current_stock - b.minimum_stock;

    return aGap - bGap;
  });
}
