import { supabase } from "@/lib/supabase";

export async function getBatchMovements(companyId: string, batchId: string) {
  const { data, error } = await supabase.from("stock_movements").select("*").eq("company_id", companyId).eq("batch_id", batchId).order("movement_date", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function getStockMovements(companyId: string) {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(
      `
      *,
      products(
        name,
        sku
      ),
      inventory_batches(
        batch_number
      )
    `,
    )
    .eq("company_id", companyId)
    .order("movement_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}
