import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getProductionOrderById } from "@/services/production-order.service";
import { createProductionCost } from "@/services/production-cost.service";
import { createProductionConsumption } from "@/services/production-consumption.service";
import { updateProductionOrder } from "@/services/production-order.service";
import { getAvailableBatches } from "@/services/production-batch.service";

import { completeProductionOrder } from "@/services/production-output.service";

export default function ProductionOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  const [showCostModal, setShowCostModal] = useState(false);

  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<Record<string, any[]>>({});
  const [costType, setCostType] = useState("LABOR");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<Record<string, string>>({});

  const [showOutputModal, setShowOutputModal] = useState(false);

  const [actualOutputQty, setActualOutputQty] = useState(0);

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  useEffect(() => {
    if (order) {
      setActualOutputQty(Number(order.planned_output_qty || 0));
    }
  }, [order]);

  if (loading) return <Loading />;

  if (!order) {
    return <div>Production Order not found</div>;
  }

  async function loadData() {
    try {
      setLoading(true);

      const data = await getProductionOrderById(id!);

      setOrder(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatches() {
    if (!order) return;

    const result: Record<string, any[]> = {};

    for (const material of order.production_order_materials) {
      const batches = await getAvailableBatches(material.material.id);

      result[material.id] = batches;
    }

    setAvailableBatches(result);
  }

  async function handleSaveCost() {
    try {
      await createProductionCost({
        company_id: order.company_id,
        production_order_id: order.id,

        cost_type: costType,
        description,
        amount,
      });

      setShowCostModal(false);

      setCostType("LABOR");
      setDescription("");
      setAmount(0);

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to save cost");
    }
  }

  async function handleStartProduction() {
    try {
      for (const m of order.production_order_materials) {
        if (m.consumeQty > 0) {
          console.log("MATERIAL", m.material.name);
          console.log("SELECTED BATCH", selectedBatch[m.id]);
          console.log("CONSUME QTY", m.consumeQty);

          await createProductionConsumption({
            company_id: order.company_id,
            warehouse_id: order.warehouse_id,
            production_order_id: order.id,
            inventory_batch_id: selectedBatch[m.id],
            material_id: m.material.id,
            qty: m.consumeQty,
          });
        }
      }

      const updated = await updateProductionOrder(order.id, {
        status: "in_progress",
      });

      console.log("UPDATED ORDER", updated);

      setShowConsumptionModal(false);

      await loadData();
    } catch (err: any) {
      console.error("START PRODUCTION ERROR", err);

      console.log("CODE:", err?.code);
      console.log("MESSAGE:", err?.message);
      console.log("DETAILS:", err?.details);
      console.log("HINT:", err?.hint);

      alert("Stok Batch Habis");
    }
  }

  async function handleCompleteProduction() {
    try {
      await completeProductionOrder(order.id, actualOutputQty);

      setShowOutputModal(false);

      await loadData();
    } catch (error) {
      console.error(error);

      alert("Gagal menyelesaikan produksi");
    }
  }

  const totalCost = order?.production_order_costs?.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0) ?? 0;

  const totalRequirement = order?.production_order_materials?.reduce((sum: number, item: any) => sum + Number(item.required_qty || 0), 0) ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.order_number}</h1>

          <p className="text-muted-foreground">Production Order Detail</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/production/orders")}>
            Back
          </Button>

          <Badge>{order.status}</Badge>
        </div>
      </div>

      {/* Summary */}

      <div className="grid md:grid-cols-6 gap-4">
        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Product</div>
          <div className="font-medium mt-1">{order.product?.name}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">BOM</div>
          <div className="font-medium mt-1">{order.bom?.bom_code}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Order Date</div>
          <div className="font-medium mt-1">{order.order_date}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Planned Output</div>
          <div className="font-medium mt-1">{Number(order.planned_output_qty || 0).toFixed(2)}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Planned Input</div>
          <div className="font-medium mt-1">{Number(order.planned_input_qty || 0).toFixed(2)}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-xs text-muted-foreground">Expected Yield</div>
          <div className="font-medium mt-1">{Number(order.expected_yield_percent || 0).toFixed(2)}%</div>
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="font-semibold mb-4">Production Planning</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Planned Input</div>

            <div className="font-medium">{Number(order.planned_input_qty || 0).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Planned Output</div>

            <div className="font-medium">{Number(order.planned_output_qty || 0).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Expected Loss</div>

            <div className="font-medium">{(Number(order.planned_input_qty || 0) - Number(order.planned_output_qty || 0)).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Expected Yield</div>

            <div className="font-medium">{Number(order.expected_yield_percent || 0).toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* Material Requirement */}

      <div className="border rounded-xl overflow-hidden">
        <div className="p-4 border-b font-semibold">Material Requirement</div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-right">BOM Qty</th>
              <th className="p-3 text-right">Required Qty</th>
            </tr>
          </thead>

          <tbody>
            {order.production_order_materials?.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.material?.name}</td>

                <td className="p-3 text-right">{Number(item.bom_qty).toFixed(2)}</td>

                <td className="p-3 text-right">{Number(item.required_qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold">
              <td colSpan={2} className="p-3">
                Total Requirement
              </td>

              <td className="p-3 text-right">{totalRequirement.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <div className="p-4 border-b font-semibold">Material Consumption</div>

        {!order.production_order_consumptions?.length ? (
          <div className="p-4 text-sm text-muted-foreground">No material consumed yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Material</th>
                <th className="p-3 text-left">Batch</th>
                <th className="p-3 text-right">Qty</th>
              </tr>
            </thead>

            <tbody>
              {order.production_order_consumptions.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-3">{item.material?.name}</td>

                  <td className="p-3">{item.batch?.batch_number}</td>

                  <td className="p-3 text-right">{Number(item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Production Cost */}

      <div className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Production Costs</h2>

          <Button size="sm" onClick={() => setShowCostModal(true)}>
            Add Cost
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {!order.production_order_costs?.length ? (
            <div className="text-sm text-muted-foreground">No production costs yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>

              <tbody>
                {order.production_order_costs.map((cost: any) => (
                  <tr key={cost.id}>
                    <td className="p-2">{cost.cost_type}</td>
                    <td className="p-2">{cost.description}</td>
                    <td className="p-2 text-right">{Number(cost.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="font-semibold border-t">
                  <td colSpan={2} className="p-2">
                    Total
                  </td>
                  <td className="p-2 text-right">{totalCost.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {/* Output */}

      <div className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Production Output</h2>

          <div className="flex gap-2">
            {order.status === "draft" && (
              <Button
                onClick={async () => {
                  await loadBatches();
                  setShowConsumptionModal(true);
                }}
              >
                Start Production
              </Button>
            )}

            {order.status === "in_progress" && <Button onClick={() => setShowOutputModal(true)}>Complete Production</Button>}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Actual Input</div>

            <div className="font-medium">{Number(order.actual_input_qty || 0).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Actual Output</div>

            <div className="font-medium">{Number(order.actual_output_qty || 0).toFixed(2)}</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Actual Yield</div>

            <div className="font-medium">{Number(order.actual_yield_percent || 0).toFixed(2)}%</div>
          </div>
        </div>
        {order.production_order_outputs?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Production Result</h3>

            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">Batch</th>

                  <th className="p-3 text-right">Qty</th>

                  <th className="p-3 text-right">Cost / Unit</th>

                  <th className="p-3 text-right">Total Cost</th>
                </tr>
              </thead>

              <tbody>
                {order.production_order_outputs.map((item: any) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">
                      <button className="text-blue-600 hover:underline" onClick={() => navigate(`/inventory/batches/${item.inventory_batch_id}`)}>
                        {item.inventory_batches?.batch_number}
                      </button>
                    </td>

                    <td className="p-3 text-right">{Number(item.qty || 0).toFixed(2)}</td>

                    <td className="p-3 text-right">Rp {Number(item.cost_per_unit || 0).toLocaleString("id-ID")}</td>

                    <td className="p-3 text-right">Rp {Number(item.total_cost || 0).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCostModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-semibold text-lg">Add Production Cost</h2>

            <div>
              <label className="block mb-2">Cost Type</label>

              <select value={costType} onChange={(e) => setCostType(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="LABOR">LABOR</option>
                <option value="UTILITY">UTILITY</option>
                <option value="PACKAGING">PACKAGING</option>
                <option value="TRANSPORT">TRANSPORT</option>
                <option value="OUTSOURCE">OUTSOURCE</option>
                <option value="OVERHEAD">OVERHEAD</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Description</label>

              <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div>
              <label className="block mb-2">Amount</label>

              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCostModal(false)}>
                Cancel
              </Button>

              <Button onClick={handleSaveCost}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {showConsumptionModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg">Start Production</h2>

            {order.production_order_materials.map((item: any) => (
              <div key={item.id} className="space-y-2 border rounded-lg p-3">
                <div className="font-medium">{item.material?.name}</div>

                <div>
                  <label className="block text-sm mb-1">Batch</label>

                  <select
                    value={selectedBatch[item.id] || ""}
                    onChange={(e) =>
                      setSelectedBatch({
                        ...selectedBatch,
                        [item.id]: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Batch</option>

                    {availableBatches[item.id]?.map((batch: any) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_number} ({Number(batch.remaining_qty).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBatch[item.id] && <div className="text-xs text-muted-foreground">Available Stock: {Number(availableBatches[item.id]?.find((b: any) => b.id === selectedBatch[item.id])?.remaining_qty || 0).toFixed(2)}</div>}

                <div>
                  <label className="block text-sm mb-1">Consume Qty</label>

                  <input
                    type="number"
                    min={0}
                    value={item.consumeQty || 0}
                    onChange={(e) =>
                      setOrder((prev: any) => ({
                        ...prev,
                        production_order_materials: prev.production_order_materials.map((m: any) =>
                          m.id === item.id
                            ? {
                                ...m,
                                consumeQty: Number(e.target.value),
                              }
                            : m,
                        ),
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConsumptionModal(false)}>
                Cancel
              </Button>

              <Button onClick={handleStartProduction}>Start</Button>
            </div>
          </div>
        </div>
      )}

      {showOutputModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-semibold text-lg">Complete Production</h2>

            <div>
              <label className="block mb-2">Actual Output Qty</label>

              <input type="number" value={actualOutputQty} onChange={(e) => setActualOutputQty(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOutputModal(false)}>
                Cancel
              </Button>

              <Button onClick={handleCompleteProduction}>Complete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
