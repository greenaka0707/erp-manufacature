import { supabase } from "../lib/supabase";

export interface SupplierPayload {
  code?: string;

  name: string;

  phone?: string;
  email?: string;
  address?: string;

  contact_person?: string;
}

export async function getSuppliers(companyId: string) {
  const { data, error } = await supabase.from("suppliers").select("*").eq("company_id", companyId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function createSupplier(companyId: string, payload: SupplierPayload) {
  const { data, error } = await supabase.rpc("create_supplier", {
    p_company_id: companyId,
    p_name: payload.name,
    p_phone: payload.phone ?? null,
    p_email: payload.email ?? null,
    p_address: payload.address ?? null,
    p_contact_person: payload.contact_person ?? null,
  });

  if (error) throw error;

  return data;
}

export async function updateSupplier(companyId: string, id: string, payload: SupplierPayload) {
  const { data, error } = await supabase.from("suppliers").update(payload).eq("company_id", companyId).eq("id", id).select().single();

  if (error) throw error;

  return data;
}

export async function deleteSupplier(companyId: string, id: string) {
  const { error } = await supabase.from("suppliers").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}
