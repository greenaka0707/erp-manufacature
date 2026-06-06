import { supabase } from "../lib/supabase";

export interface CustomerPayload {
  code?: string;

  name: string;

  phone?: string;
  email?: string;
  address?: string;

  customer_type?: "RETAIL" | "WHOLESALE";
  contact_person?: string;

  credit_limit?: number;

  portal_enabled?: boolean;

  is_active?: boolean;

  notes?: string;
}

export async function getCustomers(companyId: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("company_id", companyId).order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function getCustomerById(companyId: string, id: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("company_id", companyId).eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function updateCustomer(companyId: string, id: string, payload: CustomerPayload) {
  const { data, error } = await supabase.from("customers").update(payload).eq("company_id", companyId).eq("id", id).select().single();

  if (error) throw error;

  return data;
}

export async function deleteCustomer(companyId: string, id: string) {
  const { error } = await supabase.from("customers").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}

export async function createCustomer(companyId: string, payload: CustomerPayload) {
  const { data, error } = await supabase.rpc("create_customer", {
    p_company_id: companyId,
    p_name: payload.name,
    p_phone: payload.phone ?? null,
    p_email: payload.email ?? null,
    p_address: payload.address ?? null,
  });

  if (error) throw error;

  return data;
}
