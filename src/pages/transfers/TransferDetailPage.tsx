import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getTransferById } from "@/services/transfer.service";

export default function TransferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<any>(null);

  useEffect(() => {
    if (id && companyId) loadData();
  }, [id, companyId]);

  async function loadData() {
    if (!companyId || !id) return; // <- guard supaya tidak panggil API dengan undefined

    setLoading(true);
    try {
      const data = await getTransferById(companyId, id);
      setTransfer(data);
    } catch (error) {
      console.error("Failed to load transfer:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;
  if (!transfer) return <div>Transfer not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={transfer.transfer_number} description="Transfer Detail" />

      <div className="rounded-xl border bg-white p-6 grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Transfer Date</p>
          <p>{transfer.transfer_date}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">From Warehouse</p>
          <p>{transfer.from_warehouse?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">To Warehouse</p>
          <p>{transfer.to_warehouse?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p>{transfer.status}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Batch</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {transfer.inventory_transfer_items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">{item.inventory_batches?.batch_number}</td>
                <td className="p-4">{item.products?.name}</td>
                <td className="p-4 text-right">{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button onClick={() => navigate("/inventory/transfers")} className="rounded-lg border px-4 py-2">
          Back
        </button>
      </div>
    </div>
  );
}
