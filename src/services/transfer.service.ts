import { supabase } from "@/lib/supabase";

export async function getTransfers(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_transfers")
    .select(
      `
      *,
      from_warehouse:warehouses!inventory_transfers_from_warehouse_id_fkey(name),
      to_warehouse:warehouses!inventory_transfers_to_warehouse_id_fkey(name),
      inventory_transfer_items(
        *,
        products(name, sku),
        inventory_batches(batch_number)
      )
    `,
    )
    .eq("company_id", companyId)
    .order("transfer_date", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getTransferById(companyId: string, transferId: string) {
  const { data, error } = await supabase
    .from("inventory_transfers")
    .select(
      `
      *,
      from_warehouse:warehouses!inventory_transfers_from_warehouse_id_fkey(name),
      to_warehouse:warehouses!inventory_transfers_to_warehouse_id_fkey(name),
      inventory_transfer_items(
        *,
        products(name, sku),
        inventory_batches(batch_number)
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", transferId)
    .single();

  if (error) throw error;

  return data;
}

export async function createTransfer(companyId: string, header: any, items: any[]) {
  const { data: transfer, error: transferError } = await supabase
    .from("inventory_transfers")
    .insert({
      company_id: companyId,
      transfer_number: header.transfer_number,
      transfer_date: header.transfer_date,
      from_warehouse_id: header.from_warehouse_id,
      to_warehouse_id: header.to_warehouse_id,
      status: header.status ?? "POSTED",
      notes: header.notes,
    })
    .select()
    .single();

  if (transferError) throw transferError;

  for (const item of items) {
    // ====================================================
    // SOURCE BATCH
    // ====================================================

    const { data: fromBatch, error: fromBatchError } = await supabase.from("inventory_batches").select("*").eq("id", item.batch_id).single();

    if (fromBatchError) throw fromBatchError;

    if (!fromBatch) {
      throw new Error("Batch tidak ditemukan");
    }

    const newQtyFrom = Number(fromBatch.remaining_qty) - Number(item.qty);

    if (newQtyFrom < 0) {
      throw new Error(`Stock batch ${fromBatch.batch_number} tidak mencukupi`);
    }

    // ====================================================
    // UPDATE SOURCE BATCH
    // ====================================================

    const { error: updateSourceError } = await supabase
      .from("inventory_batches")
      .update({
        remaining_qty: newQtyFrom,
      })
      .eq("id", fromBatch.id);

    if (updateSourceError) throw updateSourceError;

    // ====================================================
    // TRANSFER ITEM
    // ====================================================

    const { error: itemError } = await supabase.from("inventory_transfer_items").insert({
      transfer_id: transfer.id,
      batch_id: fromBatch.id,
      product_id: item.product_id,
      qty: item.qty,
    });

    if (itemError) throw itemError;

    // ====================================================
    // STOCK MOVEMENT OUT
    // ====================================================

    const { error: movementOutError } = await supabase.from("stock_movements").insert({
      company_id: companyId,
      movement_type: "TRANSFER",
      movement_date: header.transfer_date,
      product_id: item.product_id,
      batch_id: fromBatch.id,
      warehouse_id: header.from_warehouse_id,
      qty_in: 0,
      qty_out: item.qty,
      unit_cost: fromBatch.unit_cost,
      reference_number: transfer.transfer_number,
      source_table: "inventory_transfers",
      source_id: transfer.id,
      running_balance: newQtyFrom,
    });

    if (movementOutError) throw movementOutError;

    // ====================================================
    // DESTINATION BATCH
    // Cari batch yg sama berdasarkan batch_number
    // ====================================================

    const { data: destinationBatch } = await supabase.from("inventory_batches").select("*").eq("company_id", companyId).eq("warehouse_id", header.to_warehouse_id).eq("batch_number", fromBatch.batch_number).maybeSingle();

    let targetBatchId = "";
    let targetBalance = 0;

    if (destinationBatch) {
      targetBalance = Number(destinationBatch.remaining_qty) + Number(item.qty);

      const { error: updateTargetError } = await supabase
        .from("inventory_batches")
        .update({
          remaining_qty: targetBalance,
        })
        .eq("id", destinationBatch.id);

      if (updateTargetError) throw updateTargetError;

      targetBatchId = destinationBatch.id;
    } else {
      const { data: newBatch, error: newBatchError } = await supabase
        .from("inventory_batches")
        .insert({
          company_id: companyId,
          batch_number: fromBatch.batch_number,
          batch_type: fromBatch.batch_type,
          product_id: fromBatch.product_id,
          warehouse_id: header.to_warehouse_id,

          qty: item.qty,
          remaining_qty: item.qty,

          unit_cost: fromBatch.unit_cost,

          production_date: fromBatch.production_date,
          expiry_date: fromBatch.expiry_date,

          supplier_lot_number: fromBatch.supplier_lot_number,

          moisture_percent: fromBatch.moisture_percent,

          defect_percent: fromBatch.defect_percent,

          batch_origin: fromBatch.batch_origin,

          source_table: "inventory_transfers",
          source_id: transfer.id,

          status: "ACTIVE",
          notes: `Transfer from ${header.from_warehouse_id}`,
        })
        .select()
        .single();

      if (newBatchError) throw newBatchError;

      targetBatchId = newBatch.id;
      targetBalance = Number(item.qty);
    }

    // ====================================================
    // STOCK MOVEMENT IN
    // ====================================================

    const { error: movementInError } = await supabase.from("stock_movements").insert({
      company_id: companyId,
      movement_type: "TRANSFER",
      movement_date: header.transfer_date,
      product_id: item.product_id,
      batch_id: targetBatchId,
      warehouse_id: header.to_warehouse_id,
      qty_in: item.qty,
      qty_out: 0,
      unit_cost: fromBatch.unit_cost,
      reference_number: transfer.transfer_number,
      source_table: "inventory_transfers",
      source_id: transfer.id,
      running_balance: targetBalance,
    });

    if (movementInError) throw movementInError;
  }

  return transfer;
}
