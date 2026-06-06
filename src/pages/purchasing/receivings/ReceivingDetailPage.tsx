import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getReceivingById } from "@/services/receiving.service";

export default function ReceivingDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [receiving, setReceiving] = useState<any>(null);

  useEffect(() => {
    if (id && companyId) {
      loadReceiving();
    }
  }, [id, companyId]);

  async function loadReceiving() {
    if (!companyId || !id) return;

    try {
      setLoading(true);

      const data = await getReceivingById(companyId, id);

      setReceiving(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!receiving) {
    return <div>Receiving tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={receiving.receiving_number} description="Receiving Detail" />

      {/* HEADER */}
      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">PO Number</p>

            <p className="font-medium">{receiving.purchase_orders?.po_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Supplier</p>

            <p className="font-medium">{receiving.purchase_orders?.suppliers?.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Receiving Date</p>

            <p>{receiving.receiving_date}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>

            <p>{receiving.status}</p>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Produk</th>

              <th className="p-4 text-left">SKU</th>

              <th className="p-4 text-right">Qty Received</th>
            </tr>
          </thead>

          <tbody>
            {receiving.receiving_items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">{item.products?.name}</td>

                <td className="p-4">{item.products?.sku}</td>

                <td className="p-4 text-right">{item.qty_received}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-2">
        <button onClick={() => navigate("/purchasing/receivings")} className="rounded-lg border px-4 py-2">
          Kembali
        </button>

        <button onClick={() => navigate(`/purchasing/qc-incoming/create?receiving=${receiving.id}`)}>Create QC Incoming</button>
      </div>
    </div>
  );
}
