import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { useCompanyStore } from "@/stores/companyStore";
import { getInvoices } from "@/services/invoice.service";

export default function SalesInvoicesPage() {
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!companyId) return;
    loadData();
  }, [companyId]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getInvoices(companyId!);
      setInvoices(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(
    () => ({
      total: invoices.length,
      draft: invoices.filter((x) => x.status === "DRAFT").length,
      posted: invoices.filter((x) => x.status === "POSTED").length,
      cancelled: invoices.filter((x) => x.status === "CANCELLED").length,
      totalValue: invoices.reduce((sum, x) => sum + Number(x.grand_total || 0), 0),
    }),
    [invoices],
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Invoices" description="Manage customer invoices" />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total Invoice</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Draft</p>
          <p className="text-3xl font-bold">{stats.draft}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Posted</p>
          <p className="text-3xl font-bold">{stats.posted}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-3xl font-bold">{stats.cancelled}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-3xl font-bold">Rp {stats.totalValue.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button onClick={() => navigate("/sales/invoices/create")} className="rounded-lg bg-black px-4 py-2 text-white">
          Create Invoice
        </button>
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <EmptyState title="No invoice found" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Invoice Number</th>
                <th className="p-3 text-left">DO Number</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="cursor-pointer border-b hover:bg-gray-50" onClick={() => navigate(`/sales/invoices/${invoice.id}`)}>
                  <td className="p-3 text-blue-600">{invoice.invoice_number}</td>
                  <td className="p-3">{invoice.delivery_order?.do_number || "-"}</td>
                  <td className="p-3">{invoice.invoice_date}</td>
                  <td className="p-3">{invoice.customer?.name}</td>
                  <td className="p-3 text-right">Rp {Number(invoice.grand_total || 0).toLocaleString("id-ID")}</td>
                  <td className="p-3 text-center">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
