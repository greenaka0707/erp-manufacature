import { supabase } from "@/lib/supabase";

export async function createPurchaseOrderLog({ company_id, purchase_order_id, activity, description, created_by }: { company_id: string; purchase_order_id: string; activity: string; description: string; created_by?: string }) {
  const { error } = await supabase.from("purchase_order_logs").insert({
    company_id,
    purchase_order_id,
    activity,
    description,
    created_by,
  });

  if (error) throw error;
}

export async function getPurchaseOrderLogs(purchaseOrderId: string) {
  const { data, error } = await supabase.from("purchase_order_logs").select("*").eq("purchase_order_id", purchaseOrderId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}
