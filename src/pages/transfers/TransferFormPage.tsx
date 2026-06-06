import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { createTransfer } from "@/services/transfer.service";
import { getWarehouses } from "@/services/warehouse.service";
import { getInventoryBatches } from "@/services/inventory-batch.service";

export default function TransferFormPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const [header, setHeader] = useState({
    from_warehouse_id: "",
    to_warehouse_id: "",
    transfer_date: new Date().toISOString().slice(0, 10),
    transfer_number: `TRF-${Date.now()}`,
    notes: "",
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
      console.error("Failed to load warehouses or batches:", error);
    } finally {
      setLoading(false);
    }
  }

  const availableTargetWarehouses = warehouses.filter((w) => w.id !== header.from_warehouse_id);

  function addItem() {
    setItems([...items, { batch_id: "", product_id: "", qty: 0 }]);
  }

  function removeItem(index: number) {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  }

  async function handleSave() {
    if (!companyId) {
      alert("Company tidak ditemukan");
      return;
    }

    if (!header.from_warehouse_id) {
      alert("Pilih warehouse asal");
      return;
    }

    if (!header.to_warehouse_id) {
      alert("Pilih warehouse tujuan");
      return;
    }

    if (header.from_warehouse_id === header.to_warehouse_id) {
      alert("Warehouse asal dan tujuan tidak boleh sama");
      return;
    }

    if (items.length === 0) {
      alert("Minimal harus ada 1 item");
      return;
    }

    for (const item of items) {
      if (!item.batch_id) {
        alert("Batch belum dipilih");
        return;
      }

      if (!item.qty || Number(item.qty) <= 0) {
        alert("Qty harus lebih dari 0");
        return;
      }

      const batch = batches.find((b) => b.id === item.batch_id);

      if (!batch) {
        alert("Batch tidak ditemukan");
        return;
      }

      if (Number(item.qty) > Number(batch.remaining_qty)) {
        alert(`Qty transfer melebihi stock batch ${batch.batch_number}`);
        return;
      }
    }

    try {
      await createTransfer(companyId, header, items);

      alert("Transfer berhasil dibuat");

      navigate("/inventory/transfers");
    } catch (error) {
      console.error("Failed to save transfer:", error);

      alert("Gagal membuat transfer");
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Create Transfer" description="Create stock transfer between warehouses" />
      {warehouses.length < 2 && <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">Minimal harus memiliki 2 warehouse untuk melakukan transfer stock.</div>}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>From Warehouse</label>
          <select value={header.from_warehouse_id} onChange={(e) => setHeader({ ...header, from_warehouse_id: e.target.value })} className="w-full rounded-lg border p-2">
            <option value="">Select Warehouse</option>
            {availableTargetWarehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>To Warehouse</label>
          <select
            value={header.to_warehouse_id}
            onChange={(e) =>
              setHeader({
                ...header,
                to_warehouse_id: e.target.value,
              })
            }
            className="w-full rounded-lg border p-2"
          >
            <option value="">Select Warehouse</option>

            {availableTargetWarehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3>Transfer Items</h3>
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
        <button onClick={() => navigate("/inventory/transfers")} className="rounded-lg border px-4 py-2">
          Cancel
        </button>
        <button disabled={warehouses.length < 2} onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
          Save Transfer
        </button>
      </div>
    </div>
  );
}
