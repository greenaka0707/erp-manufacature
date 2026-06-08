import { supabase } from "@/lib/supabase";

export async function getDashboardSummary(companyId: string) {
  const [salesInvoices, supplierInvoices, cashAccounts, receivables, payables] = await Promise.all([
    supabase.from("sales_invoices").select("grand_total").eq("company_id", companyId),

    supabase.from("supplier_invoices").select("grand_total").eq("company_id", companyId),

    supabase.from("cash_accounts").select("balance").eq("company_id", companyId),

    supabase.from("sales_invoices").select("grand_total,paid_amount,status").eq("company_id", companyId),

    supabase.from("supplier_invoices").select("grand_total,paid_amount,status").eq("company_id", companyId),
  ]);

  const totalSales = salesInvoices.data?.reduce((sum, item) => sum + Number(item.grand_total || 0), 0) || 0;

  const totalPurchase = supplierInvoices.data?.reduce((sum, item) => sum + Number(item.grand_total || 0), 0) || 0;

  const cashBalance = cashAccounts.data?.reduce((sum, item) => sum + Number(item.balance || 0), 0) || 0;

  const accountsReceivable =
    receivables.data?.reduce((sum, item) => {
      return sum + (Number(item.grand_total || 0) - Number(item.paid_amount || 0));
    }, 0) || 0;

  const accountsPayable =
    payables.data?.reduce((sum, item) => {
      return sum + (Number(item.grand_total || 0) - Number(item.paid_amount || 0));
    }, 0) || 0;

  return {
    totalSales,
    totalPurchase,
    cashBalance,
    accountsReceivable,
    accountsPayable,
  };
}
