import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getPurchaseOrderDetail, approvePurchaseOrder, cancelPurchaseOrder } from "@/services/purchase-order.service";
import { getPurchaseOrderLogs } from "@/services/purchase-order-log.service";
import { useCompanyStore } from "@/stores/companyStore";

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const totalQty = purchaseOrder?.purchase_order_items?.reduce((sum: number, item: any) => sum + Number(item.qty), 0) ?? 0;
  const totalReceived = purchaseOrder?.purchase_order_items?.reduce((sum: number, item: any) => sum + Number(item.received_qty || 0), 0) ?? 0;
  const outstandingQty = totalQty - totalReceived;
  const progress = totalQty === 0 ? 0 : Math.round((totalReceived / totalQty) * 100);

  const [logs, setLogs] = useState<any[]>([]);

  const outstandingValue = purchaseOrder?.purchase_order_items?.reduce((sum: number, item: any) => sum + (Number(item.qty) - Number(item.received_qty || 0)) * Number(item.price), 0) ?? 0;

  useEffect(() => {
    if (id && companyId) {
      loadPurchaseOrder();
    }
  }, [id, companyId]);

  async function loadPurchaseOrder() {
    if (!id) return;

    try {
      setLoading(true);

      if (!companyId) return;

      const data = await getPurchaseOrderDetail(companyId, id);

      setPurchaseOrder(data);

      const poLogs = await getPurchaseOrderLogs(id!);

      setLogs(poLogs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    try {
      if (!companyId) return;

      await approvePurchaseOrder(companyId, purchaseOrder.id);

      await loadPurchaseOrder();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCancel() {
    const confirmed = confirm("Batalkan Purchase Order ini?");

    if (!confirmed) return;

    try {
      if (!companyId) return;

      await cancelPurchaseOrder(companyId, purchaseOrder.id);

      await loadPurchaseOrder();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!purchaseOrder) {
    return <div>Purchase Order Not Found</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/purchasing/purchase-orders")} className="mb-2 text-sm text-muted-foreground hover:underline">
            ← Kembali
          </button>

          <h1 className="text-3xl font-bold">{purchaseOrder.po_number}</h1>

          <div className="mt-2 flex items-center gap-3">
            <Badge>{purchaseOrder.status}</Badge>

            <div className="h-2 w-40 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
        </div>

        <div className="flex gap-2">
          {purchaseOrder.status === "DRAFT" && (
            <>
              <button onClick={() => navigate(`/purchasing/purchase-orders/${purchaseOrder.id}/edit`)} className="rounded-lg border px-4 py-2">
                Edit
              </button>

              <button onClick={handleCancel} className="rounded-lg border border-red-500 px-4 py-2 text-red-500">
                Batalkan
              </button>

              <button onClick={handleApprove} className="rounded-lg bg-black px-4 py-2 text-white">
                Approve
              </button>
            </>
          )}

          {purchaseOrder.status === "APPROVED" && (
            <button onClick={() => navigate(`/purchasing/receivings/create?po=${purchaseOrder.id}`)} className="rounded-lg bg-black px-4 py-2 text-white">
              Buat Receiving
            </button>
          )}

          {purchaseOrder.status === "CLOSED" && (
            <button disabled className="rounded-lg bg-green-100 px-4 py-2 text-green-700">
              Receiving Selesai
            </button>
          )}
        </div>
      </div>

      {/* INFO PO */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Pemasok</p>

          <p className="font-medium">{purchaseOrder.suppliers?.name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Status</p>

          <Badge>{purchaseOrder.status}</Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Tanggal PO</p>

          <p>{purchaseOrder.po_date}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Estimasi Datang</p>

          <p>{purchaseOrder.expected_date || "-"}</p>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Catatan</p>

          <p>{purchaseOrder.notes || "-"}</p>
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Qty</p>

          <p className="mt-2 text-2xl font-bold">{totalQty} Kg</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Sudah Diterima</p>

          <p className="mt-2 text-2xl font-bold">{totalReceived} Kg</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Outstanding Qty</p>

          <p className="mt-2 text-2xl font-bold">{outstandingQty} Kg</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Nilai Outstanding</p>

          <p className="mt-2 text-2xl font-bold">Rp {outstandingValue.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* DETAIL ITEM */}
      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="w-[40%] p-4 text-left">Produk</th>

              <th className="w-[10%] p-4 text-right">Qty PO</th>

              <th className="w-[10%] p-4 text-right">Diterima</th>

              <th className="w-[10%] p-4 text-right">Outstanding</th>

              <th className="w-[15%] p-4 text-right">Harga</th>

              <th className="w-[15%] p-4 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {purchaseOrder.purchase_order_items?.map((item: any) => (
              <tr key={item.id}>
                <td className="p-4">{item.products?.name}</td>

                <td className="p-4 text-right">{item.qty}</td>

                <td className="p-4 text-right">{item.received_qty || 0}</td>

                <td className="p-4 text-right">{Number(item.qty) - Number(item.received_qty || 0)}</td>

                <td className="p-4 text-right">Rp {Number(item.price).toLocaleString("id-ID")}</td>

                <td className="p-4 text-right font-medium">Rp {(Number(item.qty) * Number(item.price)).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECEIVING HISTORY */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Receiving History</h3>

        {purchaseOrder.receivings?.length ? (
          <div className="space-y-3">
            {purchaseOrder.receivings.map((receiving: any) => (
              <div key={receiving.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{receiving.receiving_number}</p>

                  <p className="text-sm text-muted-foreground">{receiving.receiving_date}</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{receiving.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Belum ada receiving.</p>
        )}
      </div>

      {/* TIMELINE */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-6 text-xl font-semibold">Timeline</h3>

        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-blue-500" />

              <div>
                <p className="font-medium">{log.activity}</p>

                <p className="text-sm text-gray-500">{log.description}</p>

                <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
