import { supabase } from "@/lib/supabase";

export async function getCashTransactions(companyId: string) {
  const { data, error } = await supabase
    .from("cash_transactions")
    .select(
      `
      *,
      cash_accounts(name)
    `,
    )
    .eq("company_id", companyId)
    .order("transaction_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}
