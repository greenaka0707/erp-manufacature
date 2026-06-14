import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getProductStockDetail } from "@/services/product-stock-detail.service";

export default function ProductStockDetailPage() {
  const { id } = useParams();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (companyId && id) {
      loadData();
    }
  }, [companyId, id]);

  async function loadData() {
    try {
      if (!companyId || !id) return;

      setLoading(true);

      const data = await getProductStockDetail(companyId, id);

      setBatches(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  const product = batches[0]?.products;

  const totalQty = batches.reduce((sum, batch) => sum + Number(batch.remaining_qty || 0), 0);

  const inventoryValue = batches.reduce((sum, batch) => sum + Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0), 0);

  function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={product?.name || "Product Detail"} description={`SKU : ${product?.sku || "-"}`} />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Current Stock</p>

          <h3 className="mt-2 text-3xl font-bold">{totalQty.toLocaleString("id-ID")}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Inventory Value</p>

          <h3 className="mt-2 text-2xl font-bold">{formatCurrency(inventoryValue)}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Batches</p>

          <h3 className="mt-2 text-3xl font-bold">{batches.length}</h3>
        </div>
      </div>

      {/* Batch Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Batch Number</th>

              <th className="p-4 text-left">Warehouse</th>

              <th className="p-4 text-right">Remaining Qty</th>

              <th className="p-4 text-right">Unit Cost</th>

              <th className="p-4 text-right">Value</th>

              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {batches.map((batch) => {
              const value = Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0);

              return (
                <tr key={batch.id} className="border-b">
                  <td className="p-4">{batch.batch_number}</td>

                  <td className="p-4">{batch.warehouses?.name}</td>

                  <td className="p-4 text-right">{Number(batch.remaining_qty || 0).toLocaleString("id-ID")}</td>

                  <td className="p-4 text-right">{formatCurrency(Number(batch.unit_cost || 0))}</td>

                  <td className="p-4 text-right">{formatCurrency(value)}</td>

                  <td className="p-4 text-center">{batch.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
