// production-batch.service.ts
import { supabase } from "@/lib/supabase";

export async function getAvailableBatches(productId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select("*")
    .eq("product_id", productId)
    .gt("remaining_qty", 0) // hanya batch yang masih ada sisa
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}
