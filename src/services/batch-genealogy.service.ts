import { supabase } from "@/lib/supabase";

export async function getBatchGenealogy(batchId: string) {
  // cek apakah batch ini output produksi
  const { data: output } = await supabase.from("production_order_outputs").select("production_order_id").eq("inventory_batch_id", batchId).maybeSingle();

  if (output) {
    const { data: parents, error } = await supabase
      .from("production_order_consumptions")
      .select(
        `
        id,
        qty,
        inventory_batch_id,
        inventory_batches(
          id,
          batch_number,
          batch_type
        )
      `,
      )
      .eq("production_order_id", output.production_order_id);

    if (error) throw error;

    return {
      direction: "PARENTS",
      rows: parents ?? [],
    };
  }

  // cek apakah batch ini dipakai produksi
  const { data: consumptions } = await supabase.from("production_order_consumptions").select("production_order_id").eq("inventory_batch_id", batchId);

  if (!consumptions?.length) {
    return {
      direction: null,
      rows: [],
    };
  }

  const productionIds = consumptions.map((x) => x.production_order_id);

  const { data: childs, error } = await supabase
    .from("production_order_outputs")
    .select(
      `
      id,
      qty,
      inventory_batch_id,
      inventory_batches(
        id,
        batch_number,
        batch_type
      )
    `,
    )
    .in("production_order_id", productionIds);

  if (error) throw error;

  return {
    direction: "CHILDS",
    rows: childs ?? [],
  };
}
