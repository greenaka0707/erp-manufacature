import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { useCompanyStore } from "@/stores/companyStore";

import { getAccountsReceivable } from "@/services/accounts-receivable.service";

export default function AccountsReceivablePage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    console.log("Current companyId:", companyId); // Cek di console nilainya muncul atau tidak
    if (companyId) {
      loadData();
    } else {
      // Jika companyId tidak ada, matikan loading agar tidak stuck blank putih
      setLoading(false);
    }
  }, [companyId]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getAccountsReceivable(companyId!);

      // TAMBAHKAN BARIS INI UNTUK INSPEKSI DATA
      console.log("=== DATA PIUTANG ===", data);

      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Receivable" description="Manage customer receivables" />

      {invoices.length === 0 ? (
        <EmptyState title="No Receivables" description="No outstanding invoices" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3 text-left">Invoice</th>

                <th className="p-3 text-left">Customer</th>

                <th className="p-3 text-right">Total</th>

                <th className="p-3 text-right">Paid</th>

                <th className="p-3 text-right">Outstanding</th>

                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => {
                const paid = invoice.allocations?.reduce((sum: number, item: any) => sum + Number(item.allocated_amount || 0), 0) || 0;

                const outstanding = Number(invoice.grand_total || 0) - paid;

                return (
                  <tr
                    key={invoice.id}
                    className="cursor-pointer border-b hover:bg-slate-50"
                    onClick={() => {
                      console.log("Invoice clicked:", invoice);
                      console.log("Invoice ID:", invoice.id);

                      navigate(`/sales/payments/create/${invoice.id}`);
                    }}
                  >
                    <td className="p-3">{invoice.invoice_number}</td>

                    <td className="p-3">{invoice.customer?.name}</td>

                    <td className="p-3 text-right">Rp {Number(invoice.grand_total).toLocaleString("id-ID")}</td>

                    <td className="p-3 text-right">Rp {paid.toLocaleString("id-ID")}</td>

                    <td className="p-3 text-right">Rp {outstanding.toLocaleString("id-ID")}</td>

                    <td className="p-3 text-center">{invoice.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
