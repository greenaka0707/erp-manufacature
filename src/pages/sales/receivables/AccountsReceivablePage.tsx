import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

import { useCompanyStore } from "@/stores/companyStore";

import { getAccountsReceivable } from "@/services/accounts-receivable.service";
import { exportAccountsReceivablePdf } from "@/utils/exportPdf";

export default function AccountsReceivablePage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);

  const [filter, setFilter] = useState<"OUTSTANDING" | "PAID" | "ALL">("OUTSTANDING");
  const totalOutstanding = invoices.reduce((sum, invoice) => {
    const paid = invoice.allocations?.reduce((s: number, item: any) => s + Number(item.allocated_amount || 0), 0) || 0;

    return sum + (Number(invoice.grand_total || 0) - paid);
  }, 0);

  const totalInvoice = invoices.length;

  const totalCustomer = new Set(invoices.map((x) => x.customer?.id)).size;

  const totalPaid = invoices.reduce((sum, invoice) => {
    const paid = invoice.allocations?.reduce((s: number, item: any) => s + Number(item.allocated_amount || 0), 0) || 0;

    return sum + paid;
  }, 0);

  const filteredInvoices = invoices.filter((invoice) => {
    const keyword = search.toLowerCase();

    const invoiceNumber = invoice.invoice_number?.toLowerCase() || "";
    const customerName = invoice.customer?.name?.toLowerCase() || "";

    return invoiceNumber.includes(keyword) || customerName.includes(keyword);
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [companyId, filter]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getAccountsReceivable(companyId!, filter);

      // TAMBAHKAN BARIS INI UNTUK INSPEKSI DATA

      setInvoices(data);
    } finally {
      setLoading(false);
    }
  }

  function handleExportPdf() {
    exportAccountsReceivablePdf(filteredInvoices);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Receivable" description="Manage customer receivables" />

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Outstanding</p>
          <p className="text-2xl font-bold">Rp {totalOutstanding.toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Invoice</p>
          <p className="text-2xl font-bold">{totalInvoice}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Customer</p>
          <p className="text-2xl font-bold">{totalCustomer}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold">Rp {totalPaid.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter("OUTSTANDING")} className={`rounded-lg border px-4 py-2 ${filter === "OUTSTANDING" ? "bg-black text-white" : ""}`}>
          Outstanding
        </button>

        <button onClick={() => setFilter("PAID")} className={`rounded-lg border px-4 py-2 ${filter === "PAID" ? "bg-black text-white" : ""}`}>
          Paid
        </button>

        <button onClick={() => setFilter("ALL")} className={`rounded-lg border px-4 py-2 ${filter === "ALL" ? "bg-black text-white" : ""}`}>
          All
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center justify-between">
        <Input placeholder="Search Invoice / Customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

        <button onClick={handleExportPdf} className="rounded-lg border px-4 py-2">
          Export PDF
        </button>
      </div>

      {filteredInvoices.length === 0 ? (
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
              {filteredInvoices.map((invoice) => {
                const paid = invoice.allocations?.reduce((sum: number, item: any) => sum + Number(item.allocated_amount || 0), 0) || 0;

                const outstanding = Number(invoice.grand_total || 0) - paid;

                return (
                  <tr
                    key={invoice.id}
                    className="cursor-pointer border-b hover:bg-slate-50"
                    onClick={() => {
                      if (invoice.status !== "PAID") {
                        navigate(`/sales/payments/create/${invoice.id}`);
                      }
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
