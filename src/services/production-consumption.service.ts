import { supabase } from "@/lib/supabase";
import { getProductionConfig } from "@/utils/production";

export interface ProductionConsumptionPayload {
  company_id: string;
  warehouse_id: string;
  production_order_id: string;
  inventory_batch_id: string;
  material_id: string;
  qty: number;
}

export async function createProductionConsumption(payload: ProductionConsumptionPayload) {
  // 1. simpan consumption

  // ambil process type production order
  const { data: order, error: orderError } = await supabase.from("production_orders").select("process_type, order_number").eq("id", payload.production_order_id).single();

  if (orderError) throw orderError;

  const config = getProductionConfig(order.process_type);

  // 2. ambil batch
  const { data: batch, error: batchError } = await supabase.from("inventory_batches").select("remaining_qty").eq("id", payload.inventory_batch_id).single();

  if (batchError) throw batchError;

  // 3. cek stok negatif
  if (Number(payload.qty) > Number(batch.remaining_qty)) {
    throw new Error(`Insufficient stock for batch ${payload.inventory_batch_id}. Available: ${batch.remaining_qty}, Requested: ${payload.qty}`);
  }

  const { data, error } = await supabase.from("production_order_consumptions").insert([payload]).select().single();

  if (error) throw error;

  // 4. kurangi stok batch
  const remaining = Number(batch.remaining_qty || 0) - Number(payload.qty);

  const finalRemaining = Math.max(0, remaining);

  const { error: updateError } = await supabase
    .from("inventory_batches")
    .update({
      remaining_qty: finalRemaining,
      status: finalRemaining <= 0 ? "CONSUMED" : "ACTIVE",
    })
    .eq("id", payload.inventory_batch_id);

  if (updateError) throw updateError;

  // log debug
  console.log("Consumption Recorded:", {
    payload,
    finalRemaining,
    batchId: payload.inventory_batch_id,
  });

  // 5. buat stock movement
  console.log("FINAL REMAINING", finalRemaining);
  console.log("INSERTING PRODUCTION OUT");
  const { error: movementError } = await supabase.from("stock_movements").insert({
    company_id: payload.company_id,
    warehouse_id: payload.warehouse_id,

    movement_type: config.movementOut,

    product_id: payload.material_id,
    batch_id: payload.inventory_batch_id,

    qty_in: 0,
    qty_out: payload.qty,

    running_balance: finalRemaining,

    reference_number: order.order_number,

    source_table: "production_order_consumptions",
    source_id: data.id,

    notes: "Production Consumption",
  });

  if (movementError) {
    console.error("MOVEMENT ERROR", movementError);
    throw movementError;
  }

  return data;
}
