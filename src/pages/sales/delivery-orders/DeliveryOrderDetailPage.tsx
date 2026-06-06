import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { useCompanyStore } from "@/stores/companyStore";
import { getDeliveryOrderById, postDeliveryOrder, cancelDeliveryOrder } from "@/services/delivery-order.service";

export default function DeliveryOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deliveryOrder, setDeliveryOrder] = useState<any>(null);
  const [posting, setPosting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!companyId || !id) return;

    const loadDO = async () => {
      setLoading(true);
      try {
        const data = await getDeliveryOrderById(companyId, id);
        setDeliveryOrder(data);
      } catch (err: unknown) {
        console.error(err);
        alert("Gagal memuat Delivery Order");
      } finally {
        setLoading(false);
      }
    };

    loadDO();
  }, [companyId, id]);

  if (loading) return <Loading />;
  if (!deliveryOrder) return <p>Delivery Order tidak ditemukan</p>;

  const { do_number, sales_orders, customers, delivery_date, status, notes, delivery_order_items } = deliveryOrder;

  const handlePostDO = async () => {
    if (!companyId || !deliveryOrder) return;
    setPosting(true);
    try {
      await postDeliveryOrder(companyId, deliveryOrder.id);
      const data = await getDeliveryOrderById(companyId, deliveryOrder.id);
      setDeliveryOrder(data);
      alert("Delivery Order berhasil diposting");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal memposting DO");
    } finally {
      setPosting(false);
    }
  };

  const handleCancelDO = async () => {
    if (!companyId || !deliveryOrder) return;
    setCancelling(true);
    try {
      await cancelDeliveryOrder(companyId, deliveryOrder.id);
      const data = await getDeliveryOrderById(companyId, deliveryOrder.id);
      setDeliveryOrder(data);
      alert("Delivery Order berhasil dibatalkan");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal membatalkan DO");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`DO Detail: ${do_number}`} description="Delivery Order detail and items" />

      {/* Header Info */}
      <div className="rounded-xl border bg-white p-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500">DO Number</p>
          <p>{do_number}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">SO Number</p>
          <p>{sales_orders?.so_number}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Customer</p>
          <p>{customers?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Delivery Date</p>
          <p>{delivery_date}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p>{status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Notes</p>
          <p>{notes || "-"}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold">Delivery Items</h3>
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-center">Ordered</th>
                <th className="p-2 text-center">Delivered SO</th>
                <th className="p-2 text-center">Qty in DO</th>
              </tr>
            </thead>
            <tbody>
              {delivery_order_items.map((item: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{item.product?.name}</td>
                  <td className="p-2 text-center">{item.qty_ordered ?? item.qty}</td>
                  <td className="p-2 text-center">{item.qty_delivered_so ?? item.qty_delivered}</td>
                  <td className="p-2 text-center">{item.qty_delivered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <PrimaryButton onClick={() => navigate("/sales/delivery-orders")}>Back to List</PrimaryButton>

        {status === "DRAFT" && (
          <>
            <PrimaryButton onClick={handlePostDO} disabled={posting}>
              {posting ? "Posting..." : "Post DO"}
            </PrimaryButton>
            <PrimaryButton onClick={handleCancelDO} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel DO"}
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}
