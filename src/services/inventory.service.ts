import { supabase } from "@/lib/supabase";

export async function createBatchFromQC(companyId: string, qc: any) {
  const { data: existingBatch } = await supabase.from("inventory_batches").select("id").eq("source_table", "qc_incomings").eq("source_id", qc.id).maybeSingle();

  if (existingBatch) {
    throw new Error("Batch sudah pernah dibuat");
  }

  const { data: receivingItems, error: receivingError } = await supabase.from("receiving_items").select("*").eq("receiving_id", qc.receiving_id);
  const poItemIds = receivingItems?.map((x) => x.purchase_order_item_id);

  const { data: poItems, error: poError } = await supabase
    .from("purchase_order_items")
    .select("*")
    .in("id", poItemIds ?? []);

  if (poError) throw poError;
  if (receivingError) throw receivingError;

  for (const item of qc.qc_incoming_items) {
    const receivingItem = receivingItems?.find((r) => r.product_id === item.product_id);

    const poItem = poItems?.find((p) => p.id === receivingItem?.purchase_order_item_id);

    const unitCost = Number(poItem?.price ?? 0);

    console.log("Receiving Item:", receivingItem);
    console.log("Unit Cost:", unitCost);

    const { data: batch, error } = await supabase
      .from("inventory_batches")
      .insert({
        company_id: companyId,
        batch_number: `GB-${Date.now()}-${item.product_id.slice(0, 6)}`,
        batch_type: "GREEN_BEAN",
        product_id: item.product_id,
        warehouse_id: "8b4a8420-7e4f-462f-982c-d24653c1543e",

        qty: item.qty_passed,
        remaining_qty: item.qty_passed,

        unit_cost: unitCost,

        source_table: "qc_incomings",
        source_id: qc.id,

        status: "ACTIVE",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    const { error: movementError } = await supabase.from("stock_movements").insert({
      company_id: companyId,
      movement_type: "PURCHASE",
      movement_date: new Date().toISOString(),
      product_id: item.product_id,
      batch_id: batch.id,
      warehouse_id: batch.warehouse_id,
      qty_in: item.qty_passed,
      qty_out: 0,
      unit_cost: batch.unit_cost,
      reference_number: qc.qc_number,
      source_table: "qc_incomings",
      source_id: qc.id,
      running_balance: item.qty_passed,
    });

    if (movementError) {
      console.error(movementError);
      throw movementError;
    }
  }

  const { error: qcError } = await supabase
    .from("qc_incomings")
    .update({
      status: "PASSED",
    })
    .eq("id", qc.id);

  if (qcError) throw qcError;

  const { error: updateReceivingError } = await supabase
    .from("receivings")
    .update({
      status: "QC_COMPLETED",
    })
    .eq("id", qc.receiving_id);

  if (updateReceivingError) throw updateReceivingError;

  return true;
}
