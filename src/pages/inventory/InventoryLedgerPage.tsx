import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getStockMovements } from "@/services/stock-movement.service";

export default function InventoryLedgerPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [movements, setMovements] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getStockMovements(companyId);

      setMovements(data || []);
    } finally {
      setLoading(false);
    }
  }

  const sortedMovements = useMemo(() => {
    return [...movements].sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());
  }, [movements]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Ledger" description="Inventory transaction history" />

      {/* table nanti */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Date</th>

              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-left">Batch</th>

              <th className="p-4 text-left">Movement</th>

              <th className="p-4 text-left">Ref</th>

              <th className="p-4 text-right">In</th>

              <th className="p-4 text-right">Out</th>

              <th className="p-4 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {sortedMovements.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-4">{new Date(row.movement_date).toLocaleDateString("id-ID")}</td>

                <td className="p-4">{row.products?.name}</td>

                <td className="p-4">{row.inventory_batches?.batch_number}</td>

                <td className="p-4">{row.movement_type}</td>

                <td className="p-4">{row.reference_number}</td>

                <td className="p-4 text-right">{row.qty_in}</td>

                <td className="p-4 text-right">{row.qty_out}</td>

                <td className="p-4 text-right">{row.running_balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
