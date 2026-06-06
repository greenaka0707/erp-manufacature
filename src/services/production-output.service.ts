import { supabase } from "@/lib/supabase";
import { getProductionConfig } from "@/utils/production";

export async function completeProductionOrder(productionOrderId: string, actualOutputQty: number) {
  // =========================
  // Order
  // =========================

  const { data: order, error: orderError } = await supabase.from("production_orders").select("*").eq("id", productionOrderId).single();
  const config = getProductionConfig(order.process_type);
  if (orderError) throw orderError;

  // =========================
  // Consumption
  // =========================

  const { data: consumptions, error: consumptionError } = await supabase
    .from("production_order_consumptions")
    .select(
      `
      *,
      inventory_batches(
        unit_cost
      )
    `,
    )
    .eq("production_order_id", productionOrderId);

  if (consumptionError) throw consumptionError;

  // =========================
  // Additional Cost
  // =========================

  const { data: costs, error: costError } = await supabase.from("production_order_costs").select("*").eq("production_order_id", productionOrderId);

  if (costError) throw costError;

  // =========================
  // Material Cost
  // =========================

  const materialCost =
    consumptions?.reduce((sum: number, item: any) => {
      return sum + Number(item.qty || 0) * Number(item.inventory_batches?.unit_cost || 0);
    }, 0) ?? 0;

  const additionalCost =
    costs?.reduce((sum: number, item: any) => {
      return sum + Number(item.amount || 0);
    }, 0) ?? 0;

  const totalCost = materialCost + additionalCost;

  const costPerUnit = actualOutputQty > 0 ? totalCost / actualOutputQty : 0;

  // =========================
  // Create Output Batch
  // =========================

  const { data: batch, error: batchError } = await supabase
    .from("inventory_batches")
    .insert({
      company_id: order.company_id,

      batch_number: `RB-${Date.now()}`,

      batch_type: config.outputBatchType,

      product_id: order.product_id,

      warehouse_id: order.warehouse_id,

      qty: actualOutputQty,
      remaining_qty: actualOutputQty,

      unit_cost: costPerUnit,

      production_date: new Date().toISOString().slice(0, 10),

      source_table: "production_orders",

      source_id: order.id,

      status: "ACTIVE",
    })
    .select()
    .single();

  if (batchError) throw batchError;

  // =========================
  // Production Output
  // =========================

  const { error: outputError } = await supabase.from("production_order_outputs").insert({
    production_order_id: order.id,

    inventory_batch_id: batch.id,

    product_id: order.product_id,

    qty: actualOutputQty,

    cost_per_unit: costPerUnit,

    total_cost: totalCost,
  });

  if (outputError) throw outputError;

  // =========================
  // Stock Movement
  // =========================

  const { error: movementError } = await supabase.from("stock_movements").insert({
    company_id: order.company_id,

    movement_type: "PRODUCTION_IN",

    movement_date: new Date().toISOString(),

    product_id: order.product_id,

    batch_id: batch.id,

    warehouse_id: order.warehouse_id,

    qty_in: actualOutputQty,

    qty_out: 0,

    unit_cost: costPerUnit,

    reference_number: order.order_number,

    source_table: "production_orders",

    source_id: order.id,

    running_balance: actualOutputQty,

    notes: "Production Output",
  });

  if (movementError) throw movementError;

  // =========================
  // Yield
  // =========================

  const actualInputQty =
    consumptions?.reduce((sum: number, item: any) => {
      return sum + Number(item.qty || 0);
    }, 0) ?? 0;

  const yieldPercent = actualInputQty > 0 ? (actualOutputQty / actualInputQty) * 100 : 0;

  // =========================
  // Complete Order
  // =========================

  const { error: updateError } = await supabase
    .from("production_orders")
    .update({
      status: "completed",

      actual_input_qty: actualInputQty,

      actual_output_qty: actualOutputQty,

      actual_yield_percent: yieldPercent,

      completed_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateError) throw updateError;

  return true;
}
