import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getInventoryBatches } from "@/services/inventory-batch.service";
function getSourceLabel(source?: string) {
  switch (source) {
    case "qc_incomings":
      return "QC Incoming";

    case "production_orders":
      return "Production";

    default:
      return "-";
  }
}
export default function InventoryBatchesPage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [productFilter, setProductFilter] = useState("");

  const [batchTypeFilter, setBatchTypeFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getInventoryBatches(companyId);

      setBatches(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const productOptions = useMemo(() => {
    return [...new Set(batches.map((x) => x.products?.name).filter(Boolean))];
  }, [batches]);

  const batchTypeOptions = useMemo(() => {
    return [...new Set(batches.map((x) => x.batch_type).filter(Boolean))];
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const keyword = search.toLowerCase();

      const matchesSearch = batch.batch_number?.toLowerCase().includes(keyword) || batch.products?.name?.toLowerCase().includes(keyword);

      const matchesProduct = !productFilter || batch.products?.name === productFilter;

      const matchesBatchType = !batchTypeFilter || batch.batch_type === batchTypeFilter;

      const matchesStatus = !statusFilter || batch.status === statusFilter;

      return matchesSearch && matchesProduct && matchesBatchType && matchesStatus;
    });
  }, [batches, search, productFilter, batchTypeFilter, statusFilter]);
  const totalBatches = batches.length;

  const activeBatches = batches.filter((batch) => batch.status === "ACTIVE").length;

  const consumedBatches = batches.filter((batch) => Number(batch.remaining_qty) <= 0).length;

  const totalQty = batches.reduce((sum, batch) => sum + Number(batch.remaining_qty || 0), 0);

  const inventoryValue = batches.reduce((sum, batch) => sum + Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0), 0);

  function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Batches" description="Manage inventory batches" />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Batches</p>

          <h3 className="mt-2 text-3xl font-bold">{totalBatches}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Active Batches</p>

          <h3 className="mt-2 text-3xl font-bold">{activeBatches}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Consumed Batches</p>

          <h3 className="mt-2 text-3xl font-bold">{consumedBatches}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Available Qty</p>

          <h3 className="mt-2 text-3xl font-bold">{totalQty.toLocaleString("id-ID")}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Inventory Value</p>

          <h3 className="mt-2 text-2xl font-bold">{formatCurrency(inventoryValue)}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <input type="text" placeholder="Search batch number or product..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border px-4 py-2" />

          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="w-full rounded-lg border px-4 py-2">
            <option value="">All Products</option>

            {productOptions.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>

          <select value={batchTypeFilter} onChange={(e) => setBatchTypeFilter(e.target.value)} className="w-full rounded-lg border px-4 py-2">
            <option value="">All Batch Types</option>

            {batchTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border px-4 py-2">
            <option value="">All Status</option>

            <option value="ACTIVE">ACTIVE</option>

            <option value="CONSUMED">CONSUMED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Batch Number</th>

              <th className="p-4 text-left">Product</th>

              <th className="p-4 text-left">Warehouse</th>

              <th className="p-4 text-left">Type</th>

              <th className="p-4 text-left">Source</th>

              <th className="p-4 text-right">Remaining</th>

              <th className="p-4 text-right">Unit Cost</th>

              <th className="p-4 text-right">Value</th>

              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  No batches found
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => {
                const value = Number(batch.remaining_qty || 0) * Number(batch.unit_cost || 0);

                return (
                  <tr key={batch.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <button onClick={() => navigate(`/inventory/batches/${batch.id}`)} className="font-medium text-blue-600 hover:underline">
                        {batch.batch_number}
                      </button>
                    </td>

                    <td className="p-4">{batch.products?.name}</td>

                    <td className="p-4">{batch.warehouses?.name}</td>

                    <td className="p-4">{batch.batch_type}</td>

                    <td className="p-4">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => {
                          if (batch.source_table === "production_orders") {
                            navigate(`/production/orders/${batch.source_id}`);
                          }

                          if (batch.source_table === "qc_incomings") {
                            navigate(`/purchasing/qc-incoming/${batch.source_id}`);
                          }
                        }}
                      >
                        {getSourceLabel(batch.source_table)}
                      </button>
                    </td>

                    <td className="p-4 text-right">{Number(batch.remaining_qty || 0).toLocaleString("id-ID")}</td>

                    <td className="p-4 text-right">{formatCurrency(Number(batch.unit_cost || 0))}</td>

                    <td className="p-4 text-right font-medium">{formatCurrency(value)}</td>

                    <td className="p-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${batch.status === "ACTIVE" ? "bg-green-100 text-green-700" : batch.status === "CONSUMED" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
