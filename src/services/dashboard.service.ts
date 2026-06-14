export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

export async function getDashboardSummary(companyId: string) {
  try {
    const [salesInvoices, supplierInvoices, cashAccounts] = await Promise.all([
      supabase.from("sales_invoices").select("grand_total, status, payment_status").eq("company_id", companyId),
      supabase.from("supplier_invoices").select("grand_total, paid_amount").eq("company_id", companyId),
      supabase.from("cash_accounts").select("balance").eq("company_id", companyId),
    ]);

    // Filter sales: Abaikan yang dicancel untuk total sales umum
    const activeSales = salesInvoices.data?.filter((i) => String((i as any).status) !== "cancelled") || [];
    const activeSuppliers = supplierInvoices.data || [];

    const totalSales = activeSales.reduce((sum, i) => sum + Number(i.grand_total || 0), 0);
    const totalPurchase = activeSuppliers.reduce((sum, i) => sum + Number(i.grand_total || 0), 0);
    const cashBalance = cashAccounts.data?.reduce((sum, i) => sum + Number(i.balance || 0), 0) || 0;

    // FIX AR: Hanya hitung invoice yang AKTIF (Bukan DRAFT dan Bukan CANCELLED) tapi BELUM LUNAS
    const accountsReceivable = activeSales
      .filter((i) => {
        const statusInvoice = String(i.status || "")
          .toLowerCase()
          .trim();
        const statusBayar = String(i.payment_status || "")
          .toLowerCase()
          .trim();

        // 👈 JANGAN hitung draft atau cancelled sebagai piutang resmi
        if (statusInvoice === "draft" || statusInvoice === "cancelled") {
          return false;
        }

        // Hanya ambil yang tidak paid / lunas (UNPAID, PARTIAL, dll)
        return statusBayar !== "paid" && statusBayar !== "lunas";
      })
      .reduce((sum, i) => sum + Number(i.grand_total || 0), 0);

    const accountsPayable = activeSuppliers.reduce((sum, i) => {
      const total = Number(i.grand_total || 0);
      const paid = Number((i as any).paid_amount || 0);
      return sum + (total - paid);
    }, 0);

    return { totalSales, totalPurchase, cashBalance, accountsReceivable, accountsPayable };
  } catch (err) {
    console.error("Fatal error in service:", err);
    return { totalSales: 0, totalPurchase: 0, cashBalance: 0, accountsReceivable: 0, accountsPayable: 0 };
  }
}
