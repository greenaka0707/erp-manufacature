import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import { useCompanyStore } from "@/stores/companyStore";
import { getInvoiceById, postInvoice, cancelInvoice } from "@/services/invoice.service";

export default function SalesInvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!companyId || !id) return;
    loadInvoice();
  }, [companyId, id]);

  async function loadInvoice() {
    setLoading(true);
    try {
      const data = await getInvoiceById(companyId!, id!);
      setInvoice(data);
    } finally {
      setLoading(false);
    }
  }

  const handlePost = async () => {
    if (!invoice) return;
    setProcessing(true);
    try {
      await postInvoice(companyId!, invoice.id);
      await loadInvoice();
    } catch (err) {
      console.error(err);
      alert("Gagal mem-post invoice");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    if (!confirm("Batalkan invoice ini?")) return;
    setProcessing(true);
    try {
      await cancelInvoice(companyId!, invoice.id);
      navigate("/sales/invoices");
    } catch (err) {
      console.error(err);
      alert("Gagal membatalkan invoice");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button className="rounded-lg border px-4 py-2 hover:bg-gray-50" onClick={() => navigate("/sales/invoices")}>
          Back
        </button>

        <div className="space-x-2">
          {invoice.status === "DRAFT" && (
            <>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50" onClick={handlePost} disabled={processing}>
                {processing ? "Processing..." : "Post Invoice"}
              </button>

              <button className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50" onClick={handleCancel} disabled={processing}>
                {processing ? "Processing..." : "Cancel"}
              </button>
            </>
          )}

          {invoice.status === "POSTED" && (
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => navigate(`/sales/payments/create/${invoice.id}`)}>
              Record Payment
            </button>
          )}
        </div>
      </div>

      <PageHeader title={`Invoice ${invoice.invoice_number}`} description="Invoice detail" />

      <div className="bg-white p-6 rounded-xl border space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>DO Number:</strong> {invoice.delivery_order?.do_number || "-"}
          </div>
          <div>
            <strong>SO Number:</strong> {invoice.sales_order?.so_number || "-"}
          </div>
          <div>
            <strong>Customer:</strong> {invoice.customer?.name || "-"}
          </div>
          <div>
            <strong>Invoice Date:</strong> {invoice.invoice_date || "-"}
          </div>
          <div>
            <strong>Status:</strong> {invoice.status || "-"}
          </div>
          <div>
            <strong>Notes:</strong> {invoice.notes || "-"}
          </div>
          <div>
            <strong>Phone:</strong> {invoice.customer?.phone || "-"}
          </div>
          <div>
            <strong>Address:</strong> {invoice.customer?.address || "-"}
          </div>
          <div>
            <strong>Due Date:</strong> {invoice.due_date || "-"}
          </div>
        </div>

        {invoice.invoice_items?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Invoice Items</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Product</th>
                  <th className="border px-2 py-1 text-right">Qty</th>
                  <th className="border px-2 py-1 text-right">Unit Price</th>
                  <th className="border px-2 py-1 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="border px-2 py-1">{item.product?.name || "-"}</td>
                    <td className="border px-2 py-1 text-right">{item.qty}</td>
                    <td className="border px-2 py-1 text-right">{item.unit_price.toLocaleString("id-ID")}</td>
                    <td className="border px-2 py-1 text-right">{item.line_total.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-right font-semibold space-y-1">
          <div>Subtotal: Rp {Number(invoice.subtotal || 0).toLocaleString("id-ID")}</div>
          <div>Shipping: Rp {Number(invoice.shipping_cost || 0).toLocaleString("id-ID")}</div>
          <div>Grand Total: Rp {Number(invoice.grand_total || 0).toLocaleString("id-ID")}</div>
        </div>
      </div>
    </div>
  );
}
