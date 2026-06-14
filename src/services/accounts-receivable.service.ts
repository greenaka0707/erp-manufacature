import { supabase } from "@/lib/supabase";

export async function getAccountsReceivable(companyId: string) {
  const { data, error } = await supabase
    .from("sales_invoices")
    .select(
      `
      *,
      customer:customers!fk_sales_invoices_customer(id,name),
      allocations:customer_payment_allocations!fk_sales_invoice(
        allocated_amount
      )
    `,
    )
    .eq("company_id", companyId)
    .order("invoice_date", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
