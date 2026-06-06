import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getStockMovements } from "@/services/stock-movement.service";

export default function StockMovementsPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const batchId = searchParams.get("batch");

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [movements, setMovements] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [movementType, setMovementType] = useState("ALL");

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMovements = useMemo(() => {
    return movements.filter((row) => {
      const matchBatch = !batchId || row.batch_id === batchId;

      const matchType = movementType === "ALL" || row.movement_type === movementType;

      const keyword = search.toLowerCase();

      const matchSearch = !search || row.reference_number?.toLowerCase().includes(keyword) || row.products?.name?.toLowerCase().includes(keyword) || row.inventory_batches?.batch_number?.toLowerCase().includes(keyword);

      return matchBatch && matchType && matchSearch;
    });
  }, [movements, search, movementType, batchId]);

  const totalIn = filteredMovements.reduce((sum, row) => sum + Number(row.qty_in || 0), 0);

  const totalOut = filteredMovements.reduce((sum, row) => sum + Number(row.qty_out || 0), 0);

  const netMovement = totalIn - totalOut;

  function getBadgeClass(type: string) {
    switch (type) {
      case "PURCHASE":
        return "bg-green-100 text-green-700";

      case "PRODUCTION":
        return "bg-blue-100 text-blue-700";

      case "SALE":
        return "bg-red-100 text-red-700";

      case "TRANSFER":
        return "bg-purple-100 text-purple-700";

      case "ADJUSTMENT":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" description="Inventory stock movement history" />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total In</p>

          <p className="mt-2 text-2xl font-bold">{totalIn.toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Out</p>

          <p className="mt-2 text-2xl font-bold">{totalOut.toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Net Movement</p>

          <p className="mt-2 text-2xl font-bold">{netMovement.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input type="text" placeholder="Search reference, batch or product..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border px-3 py-2" />

          <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="rounded-lg border px-3 py-2">
            <option value="ALL">All Types</option>

            <option value="PURCHASE">Purchase</option>

            <option value="PRODUCTION">Production</option>

            <option value="SALE">Sale</option>

            <option value="TRANSFER">Transfer</option>

            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Date</th>

              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-left">Batch</th>

              <th className="p-4 text-left">Movement</th>

              <th className="p-4 text-right">Qty In</th>

              <th className="p-4 text-right">Qty Out</th>

              <th className="p-4 text-left">Reference</th>

              <th className="p-4 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No stock movements found
                </td>
              </tr>
            ) : (
              filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(movement.movement_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="p-4">{movement.products?.name}</td>

                  <td className="p-4">
                    <span onClick={() => navigate(`/inventory/batches/${movement.batch_id}`)} className="cursor-pointer font-medium text-blue-600 hover:underline">
                      {movement.inventory_batches?.batch_number}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getBadgeClass(movement.movement_type)}`}>{movement.movement_type}</span>
                  </td>

                  <td className="p-4 text-right">{movement.qty_in}</td>

                  <td className="p-4 text-right">{movement.qty_out}</td>

                  <td className="p-4">{movement.reference_number}</td>

                  <td className="p-4 text-right font-semibold">{movement.running_balance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
