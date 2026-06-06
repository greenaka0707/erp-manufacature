import { supabase } from "@/lib/supabase";

export async function getProductionCosts(orderId: string) {
  const { data, error } = await supabase.from("production_order_costs").select("*").eq("production_order_id", orderId).order("created_at");

  if (error) throw error;

  return data ?? [];
}

export async function createProductionCost(payload: {
  company_id: string;
  production_order_id: string;

  cost_type: string;
  description: string;

  amount: number;
}) {
  const { data, error } = await supabase.from("production_order_costs").insert(payload).select().single();

  if (error) throw error;

  return data;
}

export async function deleteProductionCost(id: string) {
  const { error } = await supabase.from("production_order_costs").delete().eq("id", id);

  if (error) throw error;
}
