import { supabase } from "@/lib/supabase";

export async function getInventoryBatches(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      *,
      products(
        name,
        sku
      ),
      warehouses(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function getInventoryBatchById(companyId: string, batchId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      *,
      products(
        id,
        name,
        sku
      ),
      warehouses(
        id,
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", batchId)
    .single();

  if (error) throw error;

  return data;
}

export async function getAvailableBatchesByWarehouse(companyId: string, warehouseId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      *,
      products(
        id,
        sku,
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("warehouse_id", warehouseId)
    .gt("remaining_qty", 0)
    .order("batch_number");

  if (error) throw error;

  return data;
}
