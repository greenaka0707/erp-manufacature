import PageHeader from "@/components/cards/PageHeader";

import { useEffect, useState } from "react";

import Loading from "@/components/ui/loading";

import { getPurchaseOrderDetail, updatePurchaseOrderReceivingStatus } from "@/services/purchase-order.service";

import { useNavigate, useSearchParams } from "react-router-dom";

import { createReceiving, updateReceivedQty } from "@/services/receiving.service";

import { createPurchaseOrderLog } from "@/services/purchase-order-log.service";

import { useCompanyStore } from "@/stores/companyStore";

export default function ReceivingFormPage() {
  const [searchParams] = useSearchParams();

  const poId = searchParams.get("po");

  const [loading, setLoading] = useState(true);
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (poId && companyId) {
      loadPurchaseOrder();
    }
  }, [poId, companyId]);

  async function handleSave() {
    if (!companyId) return;

    if (!purchaseOrder) return;

    try {
      await createReceiving(
        {
          company_id: purchaseOrder.company_id,
          purchase_order_id: purchaseOrder.id,
          receiving_number: "RCV-" + Date.now(),
          receiving_date: new Date().toISOString().slice(0, 10),
          status: "RECEIVED",
          notes,
        },
        items,
      );

      for (const item of items) {
        await updateReceivedQty(item.purchase_order_item_id, item.qty_received);
      }

      const poStatus = await updatePurchaseOrderReceivingStatus(purchaseOrder.id);

      await createPurchaseOrderLog({
        company_id: purchaseOrder.company_id,
        purchase_order_id: purchaseOrder.id,
        activity: "RECEIVING_CREATED",
        description: `Receiving berhasil dibuat. Status PO: ${poStatus}`,
      });

      alert("Receiving berhasil disimpan");

      navigate(`/purchasing/purchase-orders/${purchaseOrder.id}`);
    } catch (error) {
      console.error(error);

      alert("Gagal menyimpan receiving");
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!purchaseOrder) {
    return <div>PO tidak ditemukan</div>;
  }

  async function loadPurchaseOrder() {
    if (!companyId || !poId) return;

    try {
      setLoading(true);

      const data = await getPurchaseOrderDetail(companyId, poId);

      setPurchaseOrder(data);

      setItems(
        data.purchase_order_items.map((item: any) => ({
          purchase_order_item_id: item.id,
          product_id: item.product_id,
          qty_received: Number(item.qty) - Number(item.received_qty || 0),
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Receiving Barang" description="Penerimaan Barang dari Purchase Order" />

      {/* INFO PO */}
      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nomor PO</p>

            <p className="font-medium">{purchaseOrder.po_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Pemasok</p>

            <p className="font-medium">{purchaseOrder.suppliers?.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tanggal Receiving</p>

            <p>{new Date().toLocaleDateString("id-ID")}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status PO</p>

            <p>{purchaseOrder.status}</p>
          </div>
        </div>
      </div>

      {/* ITEM PO */}
      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Produk</th>

              <th className="p-4 text-right">Qty PO</th>

              <th className="p-4 text-right">Sudah Terima</th>

              <th className="p-4 text-right">Outstanding</th>

              <th className="p-4 text-right">Qty Diterima</th>
            </tr>
          </thead>

          <tbody>
            {purchaseOrder.purchase_order_items?.map((item: any) => {
              const outstanding = Number(item.qty) - Number(item.received_qty || 0);

              return (
                <tr key={item.id} className="border-b">
                  <td className="p-4">{item.products?.name}</td>

                  <td className="p-4 text-right">{item.qty}</td>

                  <td className="p-4 text-right">{item.received_qty || 0}</td>

                  <td className="p-4 text-right">{outstanding}</td>

                  <td className="p-4 text-right">
                    <input
                      type="number"
                      max={outstanding}
                      value={items.find((x) => x.purchase_order_item_id === item.id)?.qty_received ?? 0}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.purchase_order_item_id === item.id
                              ? {
                                  ...row,
                                  qty_received: Number(e.target.value),
                                }
                              : row,
                          ),
                        )
                      }
                      className="w-24 rounded-lg border px-2 py-1 text-right"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CATATAN */}
      <div className="rounded-xl border bg-white p-6">
        <label className="mb-2 block text-sm font-medium">Catatan Receiving</label>

        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border p-3" placeholder="Tambahkan catatan penerimaan barang..." />
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-2">
        <button onClick={() => window.history.back()} className="rounded-lg border px-4 py-2">
          Batal
        </button>

        <button onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white">
          Simpan Receiving
        </button>
      </div>
    </div>
  );
}
