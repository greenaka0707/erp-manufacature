import { supabase } from "@/lib/supabase";

export async function getProductStockDetail(companyId: string, productId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      *,
      products(
        id,
        sku,
        name,
        minimum_stock,
        product_type
      ),
      warehouses(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("product_id", productId);

  if (error) throw error;

  return data;
}
