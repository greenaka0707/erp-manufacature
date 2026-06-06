import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getAdjustmentById } from "@/services/inventory-adjustment.service";

export default function AdjustmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState<any>(null);

  useEffect(() => {
    if (companyId && id) loadData();
  }, [companyId, id]);

  async function loadData() {
    if (!companyId || !id) return;
    setLoading(true);
    try {
      const data = await getAdjustmentById(companyId, id);
      setAdjustment(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;
  if (!adjustment) return <div>Adjustment not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={adjustment.adjustment_number} description="Adjustment Detail" />

      <div className="rounded-xl border bg-white p-6 grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Adjustment Date</p>
          <p>{adjustment.adjustment_date}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Warehouse</p>
          <p>{adjustment.warehouses?.name || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Reason</p>
          <p>{adjustment.reason}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p>{adjustment.status}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Batch</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-right">Type</th>
              <th className="p-4 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {adjustment.inventory_adjustment_items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">{item.inventory_batches?.batch_number || "-"}</td>
                <td className="p-4">{item.products?.name || "-"}</td>
                <td className="p-4 text-right">{item.adjustment_type}</td>
                <td className="p-4 text-right">{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button onClick={() => navigate("/inventory/adjustments")} className="rounded-lg border px-4 py-2">
          Back
        </button>
      </div>
    </div>
  );
}
