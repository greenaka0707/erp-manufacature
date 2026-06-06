import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getSalesOrderById, updateSalesOrder } from "@/services/sales-order.service";

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = new URLSearchParams(location.search).get("status") || "all";
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salesOrder, setSalesOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getSalesOrderById(id);
      setSalesOrder(data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat Sales Order");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!salesOrder) return;
    if (salesOrder.status !== "DRAFT") {
      alert("Hanya SO DRAFT yang bisa di-approve");
      return;
    }
    if (!companyId) return;

    const confirmApprove = window.confirm("Approve Sales Order ini?");
    if (!confirmApprove) return;

    try {
      setSaving(true);
      const updated = await updateSalesOrder(salesOrder.id, { status: "APPROVED" });
      setSalesOrder(updated);

      navigate("/sales/orders?status=approved");
    } catch (err) {
      console.error(err);
      alert("Gagal approve SO");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!salesOrder) return;
    if (!["DRAFT", "APPROVED"].includes(salesOrder.status)) {
      alert("SO tidak bisa dibatalkan");
      return;
    }

    const confirmCancel = window.confirm("Batalkan Sales Order ini?");
    if (!confirmCancel) return;

    try {
      setSaving(true);
      const updated = await updateSalesOrder(salesOrder.id, { status: "CANCELLED" });
      setSalesOrder(updated);

      navigate("/sales/orders?status=cancelled");
    } catch (err) {
      console.error(err);
      alert("Gagal batalkan SO");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !salesOrder) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Sales Order ${salesOrder.so_number}`} description="Detail Sales Order" />

      {/* Header Info */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Order Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Customer</label>
            <p>{salesOrder.customers?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Sales Person</label>
            <p>{salesOrder.salespersons?.name || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium">Order Date</label>
            <p>{salesOrder.order_date}</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Notes</label>
          <p>{salesOrder.notes || "-"}</p>
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium">Status</label>
          <p>{salesOrder.status}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Order Items</h3>
        <div className="overflow-auto">
          <table className="w-full border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">Product</th>
                <th className="w-24 p-2 text-center">Qty</th>
                <th className="w-36 p-2 text-center">Price</th>
                <th className="w-24 p-2 text-center">Delivered</th>
                <th className="w-24 p-2 text-center">Invoiced</th>
                <th className="w-24 p-2 text-center">Remaining</th>
                <th className="w-36 p-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {salesOrder.sales_order_items?.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.products?.name}</td>

                  <td className="p-2 text-center">{item.qty}</td>

                  <td className="p-2 text-right">Rp {Number(item.selling_price).toLocaleString("id-ID")}</td>

                  <td className="p-2 text-center">{item.delivered_qty ?? 0}</td>

                  <td className="p-2 text-center">{item.invoiced_qty ?? 0}</td>

                  <td className="p-2 text-center">{Number(item.qty) - Number(item.delivered_qty ?? 0)}</td>

                  <td className="p-2 text-right">Rp {Number(item.line_total).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={() => navigate(`/sales/orders?status=${currentTab}`)} className="rounded-lg border px-4 py-2">
            Back
          </button>
          {salesOrder.status === "DRAFT" && (
            <button type="button" disabled={saving} onClick={handleApprove} className="rounded-lg bg-green-600 px-4 py-2 text-white">
              {saving ? "Processing..." : "Approve"}
            </button>
          )}
          {["DRAFT", "APPROVED"].includes(salesOrder.status) && (
            <button type="button" disabled={saving} onClick={handleCancel} className="rounded-lg bg-red-600 px-4 py-2 text-white">
              {saving ? "Processing..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
