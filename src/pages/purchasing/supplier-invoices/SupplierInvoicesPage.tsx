import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getSupplierInvoices } from "@/services/supplier-invoice.service";

export default function SupplierInvoicesPage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getSupplierInvoices(companyId);

      setInvoices(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Supplier Invoices" description="Manage supplier invoices" />

      <div className="flex justify-end">
        <button onClick={() => navigate("/purchasing/supplier-invoices/create")} className="rounded-lg bg-black px-4 py-2 text-white">
          Create Invoice
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Invoice Number</th>

              <th className="p-4 text-left">Supplier</th>

              <th className="p-4 text-left">PO Number</th>

              <th className="p-4 text-left">Invoice Date</th>

              <th className="p-4 text-left">Due Date</th>

              <th className="p-4 text-right">Grand Total</th>

              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No supplier invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span onClick={() => navigate(`/purchasing/supplier-invoices/${invoice.id}`)} className="cursor-pointer font-medium hover:underline">
                      {invoice.invoice_number}
                    </span>
                  </td>

                  <td className="p-4">{invoice.suppliers?.name}</td>

                  <td className="p-4">{invoice.purchase_orders?.po_number}</td>

                  <td className="p-4">{new Date(invoice.invoice_date).toLocaleDateString("id-ID")}</td>

                  <td className="p-4">{new Date(invoice.due_date).toLocaleDateString("id-ID")}</td>

                  <td className="p-4 text-right">Rp {Number(invoice.grand_total || 0).toLocaleString("id-ID")}</td>

                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${invoice.status === "PAID" ? "bg-green-100 text-green-700" : invoice.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
