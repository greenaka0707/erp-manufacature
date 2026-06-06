import { supabase } from "@/lib/supabase";

export interface UnitPayload {
  name: string;
  symbol: string;
  description?: string;
}

export async function getUnits(companyId: string) {
  const { data, error } = await supabase.from("units").select("*").eq("company_id", companyId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function getUnitById(companyId: string, id: string) {
  const { data, error } = await supabase.from("units").select("*").eq("company_id", companyId).eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function createUnit(companyId: string, payload: UnitPayload) {
  const { data, error } = await supabase.rpc("create_unit", {
    p_company_id: companyId,
    p_name: payload.name,
    p_symbol: payload.symbol,
    p_description: payload.description ?? null,
  });

  if (error) throw error;

  return data;
}

export async function updateUnit(companyId: string, id: string, payload: UnitPayload) {
  const { data, error } = await supabase.rpc("update_unit", {
    p_company_id: companyId,
    p_id: id,
    p_name: payload.name,
    p_symbol: payload.symbol,
    p_description: payload.description ?? null,
  });

  if (error) throw error;

  return data;
}

export async function deleteUnit(companyId: string, id: string) {
  const { error } = await supabase.from("units").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}

export async function getActiveUnits(companyId: string) {
  const { data, error } = await supabase.from("units").select("*").eq("company_id", companyId).eq("is_active", true).order("name");

  if (error) throw error;

  return data;
}
