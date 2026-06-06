import { supabase } from "@/lib/supabase";

export interface SalespersonPayload {
  name: string;

  phone?: string;
  email?: string;
  address?: string;
}

export async function getSalespersons(companyId: string) {
  const { data, error } = await supabase.from("salespersons").select("*").eq("company_id", companyId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function getSalespersonById(companyId: string, id: string) {
  const { data, error } = await supabase.from("salespersons").select("*").eq("company_id", companyId).eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function createSalesperson(companyId: string, payload: SalespersonPayload) {
  const { data, error } = await supabase.rpc("create_salesperson", {
    p_company_id: companyId,
    p_name: payload.name,
    p_phone: payload.phone ?? null,
    p_email: payload.email ?? null,
    p_address: payload.address ?? null,
  });

  if (error) throw error;

  return data;
}

export async function updateSalesperson(companyId: string, id: string, payload: SalespersonPayload) {
  const { data, error } = await supabase.rpc("update_salesperson", {
    p_company_id: companyId,
    p_id: id,
    p_name: payload.name,
    p_phone: payload.phone ?? null,
    p_email: payload.email ?? null,
    p_address: payload.address ?? null,
  });

  if (error) throw error;

  return data;
}

export async function deleteSalesperson(companyId: string, id: string) {
  const { error } = await supabase.from("salespersons").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}
