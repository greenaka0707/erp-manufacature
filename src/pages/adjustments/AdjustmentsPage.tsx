import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getAdjustments } from "@/services/inventory-adjustment.service";

export default function AdjustmentsPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  async function loadData() {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await getAdjustments(companyId);
      setAdjustments(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Adjustments" description="Manage inventory stock adjustments" />
      <div className="flex justify-end">
        <button onClick={() => navigate("/inventory/adjustments/create")} className="rounded-lg bg-black px-4 py-2 text-white">
          Create Adjustment
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Adjustment No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Warehouse</th>
              <th className="p-4 text-left">Reason</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No adjustments found
                </td>
              </tr>
            ) : (
              adjustments.map((adj) => (
                <tr key={adj.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/inventory/adjustments/${adj.id}`)}>
                  <td className="p-4">{adj.adjustment_number}</td>
                  <td className="p-4">{adj.adjustment_date}</td>
                  <td className="p-4">{adj.warehouses?.name || "-"}</td>
                  <td className="p-4">{adj.reason}</td>
                  <td className="p-4">{adj.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
