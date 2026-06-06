import { supabase } from "@/lib/supabase";

export async function getBatchTraceability(batchId: string) {
  const { data: output } = await supabase.from("production_order_outputs").select("*").eq("inventory_batch_id", batchId).maybeSingle();

  if (!output) {
    return null;
  }

  const { data: consumptions, error } = await supabase
    .from("production_order_consumptions")
    .select(
      `
      *,
      products(
        name,
        sku
      ),
      inventory_batches(
        batch_number,
        unit_cost
      )
    `,
    )
    .eq("production_order_id", output.production_order_id);

  if (error) throw error;

  return {
    productionOrderId: output.production_order_id,
    inputs: consumptions ?? [],
  };
}

export async function getBatchUsage(batchId: string) {
  const { data, error } = await supabase
    .from("production_order_consumptions")
    .select(
      `
      *,
      production_orders(
        id,
        order_number,
        product:products(
          id,
          name,
          sku
        )
      )
    `,
    )
    .eq("inventory_batch_id", batchId);

  if (error) throw error;

  return data ?? [];
}

export async function getProducedBatches(batchId: string) {
  const { data: consumptions, error } = await supabase.from("production_order_consumptions").select("production_order_id").eq("inventory_batch_id", batchId);

  if (error) throw error;

  if (!consumptions?.length) {
    return [];
  }

  const orderIds = consumptions.map((item) => item.production_order_id);

  const { data: outputs, error: outputError } = await supabase
    .from("production_order_outputs")
    .select(
      `
        *,
        inventory_batches(
          id,
          batch_number,
          batch_type,
          qty,
          remaining_qty
        )
      `,
    )
    .in("production_order_id", orderIds);

  if (outputError) throw outputError;

  return outputs ?? [];
}
