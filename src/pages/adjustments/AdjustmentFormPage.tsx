import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { createAdjustment } from "@/services/inventory-adjustment.service";
import { getWarehouses } from "@/services/warehouse.service";
import { getInventoryBatches } from "@/services/inventory-batch.service";

export default function AdjustmentFormPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [header, setHeader] = useState({
    warehouse_id: "",
    reason: "STOCK_OPNAME",
    notes: "",
    adjustment_date: new Date().toISOString().slice(0, 10),
    adjustment_number: `ADJ-${Date.now()}`,
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  async function loadData() {
    if (!companyId) return;
    setLoading(true);
    try {
      const wh = await getWarehouses(companyId);
      const bt = await getInventoryBatches(companyId);
      setWarehouses(wh || []);
      setBatches(bt || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems([...items, { batch_id: "", product_id: "", qty: 0, adjustment_type: "DECREASE" }]);
  }

  function removeItem(index: number) {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  }

  async function handleSave() {
    if (!companyId) return;
    try {
      await createAdjustment(companyId, header, items);
      alert("Adjustment created successfully");
      navigate("/inventory/adjustments");
    } catch (error) {
      console.error(error);
      alert("Failed to create adjustment");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Create Adjustment" description="Create inventory stock adjustment" />
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>Warehouse</label>
          <select value={header.warehouse_id} onChange={(e) => setHeader({ ...header, warehouse_id: e.target.value })} className="w-full rounded-lg border p-2">
            <option value="">Select Warehouse</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Reason</label>
          <select value={header.reason} onChange={(e) => setHeader({ ...header, reason: e.target.value })} className="w-full rounded-lg border p-2">
            <option value="STOCK_OPNAME">STOCK_OPNAME</option>
            <option value="DAMAGED">DAMAGED</option>
            <option value="LOST">LOST</option>
            <option value="CORRECTION">CORRECTION</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      <div>
        <h3>Adjustment Items</h3>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={item.batch_id}
              onChange={(e) => {
                const copy = [...items];
                const batch = batches.find((b) => b.id === e.target.value);
                copy[index].batch_id = e.target.value;
                copy[index].product_id = batch?.product_id || "";
                setItems(copy);
              }}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_number}
                </option>
              ))}
            </select>

            <select
              value={item.adjustment_type}
              onChange={(e) => {
                const copy = [...items];
                copy[index].adjustment_type = e.target.value;
                setItems(copy);
              }}
            >
              <option value="DECREASE">DECREASE</option>
              <option value="INCREASE">INCREASE</option>
            </select>

            <input
              type="number"
              value={item.qty}
              onChange={(e) => {
                const copy = [...items];
                copy[index].qty = Number(e.target.value);
                setItems(copy);
              }}
              className="w-24 rounded-lg border p-1"
            />

            <button onClick={() => removeItem(index)} className="text-red-600">
              Remove
            </button>
          </div>
        ))}
        <button onClick={addItem} className="rounded-lg border px-3 py-1 mt-2">
          Add Item
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => navigate("/inventory/adjustments")} className="rounded-lg border px-4 py-2">
          Cancel
        </button>
        <button onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white">
          Save Adjustment
        </button>
      </div>
    </div>
  );
}
