import { supabase } from "@/lib/supabase";

export async function getCashAccounts(companyId: string) {
  const { data, error } = await supabase.from("cash_accounts").select("*").eq("company_id", companyId).eq("is_active", true).order("name");

  if (error) throw error;

  return data;
}
