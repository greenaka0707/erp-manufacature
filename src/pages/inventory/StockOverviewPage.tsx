import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getStockOverview } from "@/services/inventory-overview.service";

export default function StockOverviewPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getStockOverview(companyId);

      setProducts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const totalProducts = products.length;

  const totalQty = products.reduce((sum, item) => sum + Number(item.total_qty || 0), 0);

  const totalValue = products.reduce((sum, item) => sum + Number(item.inventory_value || 0), 0);

  function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  if (loading) {
    return <Loading />;
  }

  const filteredProducts = products.filter((item) => item.product_name?.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Overview" description="Current inventory by product" />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Products</p>

          <h3 className="mt-2 text-3xl font-bold">{totalProducts}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Qty</p>

          <h3 className="mt-2 text-3xl font-bold">{totalQty.toLocaleString("id-ID")}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Inventory Value</p>

          <h3 className="mt-2 text-2xl font-bold">{formatCurrency(totalValue)}</h3>
        </div>
      </div>

      {/* Search */}

      <div className="rounded-xl border bg-white p-4">
        <input type="text" placeholder="Search SKU or Product..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border px-4 py-2" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4 text-right">Inventory Value</th>
              <th className="p-4 text-center">Batches</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No inventory found
                </td>
              </tr>
            ) : (
              filteredProducts.map((item: any) => (
                <tr key={item.product_id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{item.sku}</td>

                  <td className="p-4">
                    <button className="font-medium text-blue-600 hover:underline" onClick={() => navigate(`/inventory/products/${item.product_id}`)}>
                      {item.product_name}
                    </button>
                  </td>

                  <td className="p-4 text-right">{Number(item.total_qty).toLocaleString("id-ID")}</td>

                  <td className="p-4 text-right">{formatCurrency(item.inventory_value)}</td>

                  <td className="p-4 text-center">{item.batch_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
