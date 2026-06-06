import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getInventoryBatchById } from "@/services/inventory-batch.service";
import { getBatchTraceability, getBatchUsage, getProducedBatches } from "@/services/batch-traceability.service";

import { getBatchGenealogy } from "@/services/batch-genealogy.service";

export default function InventoryBatchDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [batch, setBatch] = useState<any>(null);
  const [traceability, setTraceability] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [producedBatches, setProducedBatches] = useState<any[]>([]);
  const [genealogy, setGenealogy] = useState<any>(null);

  useEffect(() => {
    if (id && companyId) {
      loadData();
    }
  }, [id, companyId]);

  async function loadData() {
    try {
      if (!companyId || !id) return;

      setLoading(true);

      const data = await getInventoryBatchById(companyId, id);

      setBatch(data);

      const trace = await getBatchTraceability(id);

      const usageData = await getBatchUsage(id);

      const producedData = await getProducedBatches(id);

      setUsage(usageData);

      setProducedBatches(producedData);

      const genealogyData = await getBatchGenealogy(id);

      setGenealogy(genealogyData);

      setTraceability(trace);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!batch) {
    return <div>Batch tidak ditemukan</div>;
  }

  const consumedQty = Number(batch.qty) - Number(batch.remaining_qty);

  const currentValue = Number(batch.remaining_qty) * Number(batch.unit_cost);

  return (
    <div className="space-y-6">
      <PageHeader title={batch.batch_number} description="Inventory Batch Detail" />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Batch Status</p>

          <span className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-medium ${batch.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{batch.status}</span>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Remaining Qty</p>

          <p className="mt-2 text-2xl font-bold">{Number(batch.remaining_qty).toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Inventory Value</p>

          <p className="mt-2 text-2xl font-bold">Rp {currentValue.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Batch Information */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Batch Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Product</p>

            <p>{batch.products?.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Warehouse</p>

            <p>{batch.warehouses?.name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Batch Type</p>

            <p>{batch.batch_type}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>

            <p>{batch.status}</p>
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Quantity Information</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Initial Qty</p>

            <p>{batch.qty}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Remaining Qty</p>

            <p>{batch.remaining_qty}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Consumed Qty</p>

            <p>{consumedQty}</p>
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Cost Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Unit Cost</p>

            <p>Rp {Number(batch.unit_cost).toLocaleString("id-ID")}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>

            <p>Rp {currentValue.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Quality */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Quality Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Supplier Lot</p>

            <p>{batch.supplier_lot_number || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Origin</p>

            <p>{batch.batch_origin || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Moisture %</p>

            <p>{batch.moisture_percent ?? "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Defect %</p>

            <p>{batch.defect_percent ?? "-"}</p>
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Source Information</h3>
        <div className="mt-4">
          <button
            className="rounded-lg bg-black px-4 py-2 text-white"
            onClick={() => {
              if (batch.source_table === "production_orders") {
                navigate(`/production/orders/${batch.source_id}`);
              }

              if (batch.source_table === "qc_incomings") {
                navigate(`/purchasing/qc-incoming/${batch.source_id}`);
              }
            }}
          >
            Open Source Document
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Source Table</p>

            <p>{batch.source_table}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Source ID</p>

            <p className="break-all">{batch.source_id}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created At</p>

            <p>{new Date(batch.created_at).toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      </div>

      {traceability && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Production Traceability</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Batch</th>

                  <th className="p-2 text-left">Product</th>

                  <th className="p-2 text-left">Qty</th>

                  <th className="p-2 text-left">Unit Cost</th>
                </tr>
              </thead>

              <tbody>
                {traceability.inputs.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <button className="text-blue-600 hover:underline" onClick={() => navigate(`/inventory/batches/${item.inventory_batch_id}`)}>
                        {item.inventory_batches?.batch_number}
                      </button>
                    </td>

                    <td className="p-2">{item.products?.name}</td>

                    <td className="p-2">{item.qty}</td>

                    <td className="p-2">Rp {Number(item.inventory_batches?.unit_cost || 0).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {usage.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Used In Production</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Production Order</th>

                  <th className="p-2 text-left">Output Product</th>

                  <th className="p-2 text-right">Qty Used</th>
                </tr>
              </thead>

              <tbody>
                {usage.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <button className="text-blue-600 hover:underline" onClick={() => navigate(`/production/orders/${item.production_order_id}`)}>
                        {item.production_orders?.order_number}
                      </button>
                    </td>

                    <td className="p-2">{item.production_orders?.product?.name}</td>

                    <td className="p-2 text-right">{Number(item.qty).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {producedBatches.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Produced Batches</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Batch</th>

                  <th className="p-2 text-left">Type</th>

                  <th className="p-2 text-right">Qty</th>
                </tr>
              </thead>

              <tbody>
                {producedBatches.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <button className="text-blue-600 hover:underline" onClick={() => navigate(`/inventory/batches/${item.inventory_batch_id}`)}>
                        {item.inventory_batches?.batch_number}
                      </button>
                    </td>

                    <td className="p-2">{item.inventory_batches?.batch_type}</td>

                    <td className="p-2 text-right">{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {genealogy?.rows?.length > 0 && (
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Batch Genealogy</h3>

          <div className="mb-4 text-sm text-muted-foreground">{genealogy.direction === "PARENTS" ? "Source Batches" : "Produced Batches"}</div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Batch</th>

                <th className="p-2 text-left">Type</th>

                <th className="p-2 text-right">Qty</th>
              </tr>
            </thead>

            <tbody>
              {genealogy.rows.map((row: any) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">
                    <button className="text-blue-600 hover:underline" onClick={() => navigate(`/inventory/batches/${row.inventory_batch_id}`)}>
                      {row.inventory_batches?.batch_number}
                    </button>
                  </td>

                  <td className="p-2">{row.inventory_batches?.batch_type}</td>

                  <td className="p-2 text-right">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between">
        <button onClick={() => navigate("/inventory/batches")} className="rounded-lg border px-4 py-2">
          Back
        </button>

        <button onClick={() => navigate(`/inventory/stock-movements?batch=${batch.id}`)} className="rounded-lg bg-black px-4 py-2 text-white">
          View Movements
        </button>
      </div>
    </div>
  );
}
