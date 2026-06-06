import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import FormSearchSelect from "@/components/forms/FormSearchSelect";

import { useCompanyStore } from "@/stores/companyStore";

import { getBOMs, getBOMById } from "@/services/bom.service";
import { getWarehouses } from "@/services/warehouse.service";

import { createProductionOrder } from "@/services/production-order.service";

export default function ProductionOrderFormPage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [boms, setBoms] = useState<any[]>([]);
  const [selectedBom, setSelectedBom] = useState<any>(null);

  const [bomId, setBomId] = useState("");
  const [plannedOutputQty, setPlannedOutputQty] = useState(1);
  const [expectedYield, setExpectedYield] = useState(100);
  const [notes, setNotes] = useState("");
  const plannedInputQty = expectedYield > 0 ? plannedOutputQty / (expectedYield / 100) : 0;
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState("");

  useEffect(() => {
    if (!companyId) return;

    loadBOMs();
    loadWarehouses();
  }, [companyId]);

  async function loadBOMs() {
    const data = await getBOMs(companyId!);
    setBoms(data);
  }

  async function loadWarehouses() {
    const data = await getWarehouses(companyId!);

    setWarehouses(data);

    if (data.length > 0) {
      setWarehouseId(data[0].id);
    }
  }

  async function handleSelectBom(value: string) {
    setBomId(value);

    const bom = await getBOMById(value);

    setSelectedBom(bom);
  }

  async function handleSave() {
    try {
      if (!companyId) return;

      if (!selectedBom) {
        alert("Pilih BOM");
        return;
      }

      setSaving(true);

      await createProductionOrder(companyId, {
        warehouse_id: warehouseId,

        bom_id: selectedBom.id,

        product_id: selectedBom.product_id,
        planned_output_qty: plannedOutputQty,
        planned_input_qty: plannedInputQty,
        expected_yield_percent: expectedYield,
        production_date: new Date().toISOString(),

        notes,

        materials: selectedBom.items.map((item: any) => ({
          material_id: item.material.id,
          bom_qty: item.qty,
          required_qty: item.qty * plannedInputQty,
        })),
      });

      navigate("/production/orders");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan Production Order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Create Production Order</h1>

      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Warehouse</label>

            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {warehouses.map((warehouse: any) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">BOM</label>

            <FormSearchSelect
              value={bomId}
              options={boms.map((bom) => ({
                value: bom.id,
                label: `${bom.bom_code} - ${bom.product?.name}`,
              }))}
              onChange={handleSelectBom}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Planned Output Qty</label>

            <input type="number" min={1} value={plannedOutputQty} onChange={(e) => setPlannedOutputQty(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block mb-2 font-medium">Expected Yield (%)</label>

            <input
              type="number"
              min={1}
              max={100}
              value={expectedYield}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value > 100) return setExpectedYield(100);
                if (value < 1) return setExpectedYield(1);

                setExpectedYield(value);
              }}
              className="w-full border rounded-lg px-3 py-2"
            />

            <p className="text-xs text-muted-foreground mt-1">Production efficiency percentage.</p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Planned Input Qty</label>

            <input value={plannedInputQty.toFixed(2)} readOnly className="w-full border rounded-lg px-3 py-2 bg-slate-50" />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">Notes</label>

            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      {selectedBom && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="border rounded-xl p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Product</div>

              <div className="font-semibold">{selectedBom.product?.name}</div>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">BOM Code</div>

              <div className="font-semibold">{selectedBom.bom_code}</div>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Output Target</div>

              <div className="font-semibold">{plannedOutputQty.toFixed(2)}</div>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Yield</div>

              <div className="font-semibold">{expectedYield.toFixed(2)}%</div>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">Required Input</div>

              <div className="font-semibold">{plannedInputQty.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold">Material Requirement</h2>
            </div>

            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">Material</th>
                  <th className="p-3 text-right">BOM Qty</th>
                  <th className="p-3 text-right">Required Qty</th>
                </tr>
              </thead>

              <tbody>
                {selectedBom.items?.map((item: any) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">{item.material?.name}</td>

                    <td className="p-3 text-right">{Number(item.qty).toFixed(2)}</td>

                    <td className="p-3 text-right font-medium">{(item.qty * plannedInputQty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t bg-slate-50 font-semibold">
                  <td className="p-3" colSpan={2}>
                    Total Requirement
                  </td>

                  <td className="p-3 text-right">{selectedBom.items?.reduce((sum: number, item: any) => sum + item.qty * plannedInputQty, 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/production/orders")}>
          Cancel
        </Button>

        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Production Order"}
        </Button>
      </div>
    </div>
  );
}
