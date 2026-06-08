import { supabase } from "@/lib/supabase";

export async function getAccountsReceivable(companyId: string) {
  console.log("Mencari piutang untuk Company ID aktif:", companyId);

  const { data, error } = await supabase
    .from("sales_invoices")
    .select(
      `
    *,
    customer:customers!fk_sales_invoices_customer(id, name),
    allocations:customer_payment_allocations!fk_sales_invoice(
      allocated_amount
    )
  `,
    )
    .eq("company_id", companyId)
    .in("status", ["UNPAID", "PARTIAL"])
    .order("invoice_date", { ascending: false });

  if (error) throw error;

  console.log("Hasil data piutang:", data);

  return data ?? [];
}
