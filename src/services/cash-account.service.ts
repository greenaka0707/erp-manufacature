import { supabase } from "@/lib/supabase";

export async function getCashAccounts(companyId: string) {
  const { data, error } = await supabase.from("cash_accounts").select("*").eq("company_id", companyId).eq("is_active", true).order("name");

  if (error) throw error;

  return data;
}

export async function createCashAccount(payload: any) {
  const { data, error } = await supabase.from("cash_accounts").insert(payload).select().single();

  if (error) throw error;

  return data;
}

export async function getCashAccountById(id: string) {
  const { data, error } = await supabase.from("cash_accounts").select("*").eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function updateCashAccount(id: string, payload: any) {
  const { data, error } = await supabase.from("cash_accounts").update(payload).eq("id", id).select().single();

  if (error) throw error;

  return data;
}
