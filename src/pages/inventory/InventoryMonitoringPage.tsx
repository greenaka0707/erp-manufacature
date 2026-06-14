import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getInventoryMonitoring } from "@/services/inventory-monitoring.service";

export default function InventoryMonitoringPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"LOW" | "OUT" | "ALL">("LOW");

  const navigate = useNavigate();

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getInventoryMonitoring(companyId);

      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  const lowStock = items.filter((x) => x.current_stock <= x.minimum_stock && x.current_stock > 0);

  const outOfStock = items.filter((x) => x.current_stock <= 0);

  const filteredItems = items.filter((item) => {
    const isOut = item.current_stock <= 0;

    const isLow = item.current_stock <= item.minimum_stock && item.minimum_stock > 0;

    if (activeTab === "LOW") return isLow;

    if (activeTab === "OUT") return isOut;

    return true;
  });

  function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Monitoring" description="Monitor stock conditions" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Low Stock</p>

          <h3 className="mt-2 text-3xl font-bold text-orange-600">{lowStock.length}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Out Of Stock</p>

          <h3 className="mt-2 text-3xl font-bold text-red-600">{outOfStock.length}</h3>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("LOW")} className={`rounded-lg px-4 py-2 ${activeTab === "LOW" ? "bg-orange-500 text-white" : "border"}`}>
          Low Stock
        </button>

        <button onClick={() => setActiveTab("OUT")} className={`rounded-lg px-4 py-2 ${activeTab === "OUT" ? "bg-red-500 text-white" : "border"}`}>
          Out Of Stock
        </button>

        <button onClick={() => setActiveTab("ALL")} className={`rounded-lg px-4 py-2 ${activeTab === "ALL" ? "bg-black text-white" : "border"}`}>
          All
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-right">Current</th>
              <th className="p-4 text-right">Minimum</th>
              <th className="p-4 text-right">Value</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            ) : (
              filteredItems.map((item: any) => {
                const isOut = item.current_stock <= 0;

                const isLow = item.minimum_stock > 0 && item.current_stock <= item.minimum_stock;

                return (
                  <tr key={item.product_id} className="border-b">
                    <td className="p-4">{item.sku}</td>

                    <td className="p-4">
                      <button className="font-medium text-blue-600 hover:underline" onClick={() => navigate(`/inventory/products/${item.product_id}`)}>
                        {item.product_name}
                      </button>
                    </td>

                    <td className="p-4 text-right">{item.current_stock.toLocaleString("id-ID")}</td>

                    <td className="p-4 text-right">{item.minimum_stock.toLocaleString("id-ID")}</td>

                    <td className="p-4 text-right">{formatCurrency(item.inventory_value)}</td>

                    <td className="p-4 text-center">
                      {isOut ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">OUT OF STOCK</span>
                      ) : isLow ? (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">LOW STOCK</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">NORMAL</span>
                      )}
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
