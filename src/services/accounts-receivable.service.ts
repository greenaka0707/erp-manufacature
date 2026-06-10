import { supabase } from "@/lib/supabase";

export async function getAccountsReceivable(companyId: string, filter: "OUTSTANDING" | "PAID" | "ALL" = "OUTSTANDING") {
  let query = supabase
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
    .eq("company_id", companyId);

  if (filter === "OUTSTANDING") {
    query = query.in("status", ["UNPAID", "PARTIAL"]);
  }

  if (filter === "PAID") {
    query = query.eq("status", "PAID");
  }

  const { data, error } = await query.order("invoice_date", { ascending: false });

  if (error) throw error;

  console.log("Hasil data piutang:", data);

  return data ?? [];
}
