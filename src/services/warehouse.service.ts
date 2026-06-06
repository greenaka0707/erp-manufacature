import { supabase } from "../lib/supabase";

export interface WarehousePayload {
  code: string;
  name: string;
  description?: string;

  warehouse_type?: "GENERAL" | "GREEN_BEAN" | "PRODUCTION" | "FINISHED_GOODS" | "REJECT";

  is_default?: boolean;

  allow_negative_stock?: boolean;
}

export async function getWarehouses(companyId: string) {
  const { data, error } = await supabase.from("warehouses").select("*").eq("company_id", companyId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function getWarehouseById(companyId: string, id: string) {
  const { data, error } = await supabase.from("warehouses").select("*").eq("company_id", companyId).eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function createWarehouse(companyId: string, payload: WarehousePayload) {
  const { data, error } = await supabase
    .from("warehouses")
    .insert({
      company_id: companyId,
      ...payload,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateWarehouse(companyId: string, id: string, payload: WarehousePayload) {
  const { data, error } = await supabase.from("warehouses").update(payload).eq("company_id", companyId).eq("id", id).select().single();

  if (error) throw error;

  return data;
}

export async function deleteWarehouse(companyId: string, id: string) {
  const { error } = await supabase.from("warehouses").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}
