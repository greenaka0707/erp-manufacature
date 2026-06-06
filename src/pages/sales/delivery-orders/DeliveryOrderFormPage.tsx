import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";

import { useCompanyStore } from "@/stores/companyStore";
import { getApprovedSalesOrders, createDeliveryOrder } from "@/services/delivery-order.service";

export default function DeliveryOrderFormPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [selectedSO, setSelectedSO] = useState<any>(null);
  const [salesOrderId, setSalesOrderId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    const loadSalesOrders = async (): Promise<void> => {
      try {
        const data: any[] = await getApprovedSalesOrders(companyId);
        setSalesOrders(data);
      } catch (err: unknown) {
        console.error(err);
        alert("Gagal memuat approved Sales Orders");
      }
    };
    loadSalesOrders();
  }, [companyId]);

  function handleSalesOrderChange(id: string) {
    setSalesOrderId(id);
    const so = salesOrders.find((x) => x.id === id);
    if (!so) return;

    setSelectedSO(so);
    setItems(
      so.sales_order_items.map((item: any) => ({
        salesOrderItemId: item.id,
        productId: item.product_id,
        productName: item.product?.name,
        qtyOrdered: Number(item.qty),
        qtyDelivered: Number(item.delivered_qty || 0),
        qtyRemaining: Number(item.remaining_qty),
        qtyDelivery: 0,
      })),
    );
  }

  async function handleSave() {
    if (!companyId || !selectedSO) {
      alert("Sales Order wajib dipilih");
      return;
    }

    const deliveryItems = items
      .filter((i) => i.qtyDelivery > 0)
      .map((i) => ({
        salesOrderItemId: i.salesOrderItemId,
        productId: i.productId,
        qtyDelivered: Number(i.qtyDelivery),
      }));

    if (!deliveryItems.length) {
      alert("Minimal 1 item harus dikirim");
      return;
    }

    setSaving(true);
    try {
      await createDeliveryOrder({
        companyId,
        salesOrderId: selectedSO.id,
        customerId: selectedSO.customer_id,
        deliveryDate,
        notes,
        items: deliveryItems,
      });
      alert("Delivery Order berhasil dibuat");
      navigate("/sales/delivery-orders");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal membuat Delivery Order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Delivery Order" description="Create delivery order from approved sales order" />

      {/* Delivery Info */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Delivery Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Sales Order</label>
            <select value={salesOrderId} onChange={(e) => handleSalesOrderChange(e.target.value)} className="w-full rounded-lg border px-3 py-2">
              <option value="">Select Approved Sales Order</option>
              {salesOrders.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.so_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm">Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm">Notes</label>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Customer Information</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm text-gray-500">Customer</label>
            <p>{selectedSO?.customers?.name || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Sales Order</label>
            <p>{selectedSO?.so_number || "-"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500">Status</label>
            <p>{selectedSO?.status || "-"}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Delivery Items</h3>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Ordered</th>
                <th className="p-2 text-center">Delivered</th>
                <th className="p-2 text-center">Remaining</th>
                <th className="p-2 text-center">Qty Delivery</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2 text-center">{item.qtyOrdered}</td>
                  <td className="p-2 text-center">{item.qtyDelivered}</td>
                  <td className="p-2 text-center">{item.qtyRemaining}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={item.qtyRemaining}
                      value={item.qtyDelivery}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val < 0) val = 0;
                        if (val > item.qtyRemaining) val = item.qtyRemaining;
                        const copy = [...items];
                        copy[index].qtyDelivery = val;
                        setItems(copy);
                      }}
                      className="w-full rounded border px-2 py-1 text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button onClick={() => navigate("/sales/delivery-orders")} className="rounded-lg border px-4 py-2">
          Cancel
        </button>
        <button disabled={saving} onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white">
          {saving ? "Saving..." : "Save Draft"}
        </button>
      </div>
    </div>
  );
}
