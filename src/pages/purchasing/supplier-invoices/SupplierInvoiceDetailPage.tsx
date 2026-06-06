import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { getSupplierInvoiceById } from "@/services/supplier-invoice.service";

export default function SupplierInvoiceDetailPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getSupplierInvoiceById(id!);

      setInvoice(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <PageHeader title={invoice.invoice_number} description="Supplier Invoice Detail" />
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${invoice.status === "PAID" ? "bg-green-100 text-green-700" : invoice.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
            {invoice.status}
          </span>

          <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">Print</button>
        </div>
      </div>

      {/* HEADER */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Invoice Number</p>
          <p className="font-medium">{invoice.invoice_number}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Supplier</p>
          <p className="font-medium">{invoice.suppliers?.name}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">PO Number</p>
          <p className="font-medium">{invoice.purchase_orders?.po_number}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Invoice Date</p>
          <p>{new Date(invoice.invoice_date).toLocaleDateString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Due Date</p>
          <p>{new Date(invoice.due_date).toLocaleDateString("id-ID")}</p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-right">Ordered</th>
              <th className="p-4 text-right">Received</th>
              <th className="p-4 text-right">Variance</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {invoice.purchase_orders?.purchase_order_items?.length > 0 ? (
              invoice.purchase_orders.purchase_order_items.map((item: any) => {
                const variance = Number(item.received_qty || 0) - Number(item.qty || 0);

                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">{item.products?.name}</td>

                    <td className="p-4 text-right">{Number(item.qty).toLocaleString("id-ID")} Kg</td>

                    <td className="p-4 text-right">{Number(item.received_qty || 0).toLocaleString("id-ID")} Kg</td>

                    <td className={`p-4 text-right font-medium ${variance > 0 ? "text-green-600" : variance < 0 ? "text-red-600" : ""}`}>
                      {variance > 0 ? "+" : ""}
                      {variance.toLocaleString("id-ID")} Kg
                    </td>

                    <td className="p-4 text-right">Rp {Number(item.price).toLocaleString("id-ID")}</td>

                    <td className="p-4 text-right">Rp {Number(item.total).toLocaleString("id-ID")}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="flex justify-end">
        <div className="w-full max-w-md rounded-xl border bg-white p-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {Number(invoice.subtotal).toLocaleString("id-ID")}</span>
          </div>

          <div className="mt-2 flex justify-between">
            <span>Tax</span>
            <span>Rp {Number(invoice.tax_amount).toLocaleString("id-ID")}</span>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>

              <span>Rp {Number(invoice.grand_total).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
