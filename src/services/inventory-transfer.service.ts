import { supabase } from "@/lib/supabase";

export async function getTransfers(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_transfers")
    .select(
      `
      *,
      from_warehouse:warehouses!inventory_transfers_from_warehouse_id_fkey(
        name
      ),
      to_warehouse:warehouses!inventory_transfers_to_warehouse_id_fkey(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("transfer_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function getTransferById(companyId: string, transferId: string) {
  const { data, error } = await supabase
    .from("inventory_transfers")
    .select(
      `
      *,
      from_warehouse:warehouses!inventory_transfers_from_warehouse_id_fkey(
        name
      ),
      to_warehouse:warehouses!inventory_transfers_to_warehouse_id_fkey(
        name
      ),
      inventory_transfer_items(
        *,
        products(
          name,
          sku
        ),
        inventory_batches(
          batch_number
        )
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
  const { data: transfer, error } = await supabase
    .from("inventory_transfers")
    .insert({
      company_id: companyId,
      transfer_number: header.transfer_number,
      transfer_date: header.transfer_date,
      from_warehouse_id: header.from_warehouse_id,
      to_warehouse_id: header.to_warehouse_id,
      notes: header.notes,
      status: "POSTED",
    })
    .select()
    .single();

  if (error) throw error;

  for (const item of items) {
    await supabase.from("inventory_transfer_items").insert({
      transfer_id: transfer.id,
      batch_id: item.batch_id,
      product_id: item.product_id,
      qty: item.qty,
    });

    const { data: batch } = await supabase.from("inventory_batches").select("*").eq("id", item.batch_id).single();

    if (!batch) {
      throw new Error("Batch tidak ditemukan");
    }

    if (Number(batch.remaining_qty) < Number(item.qty)) {
      throw new Error("Stock tidak mencukupi");
    }

    const remainingQty = Number(batch.remaining_qty) - Number(item.qty);

    await supabase
      .from("inventory_batches")
      .update({
        remaining_qty: remainingQty,
      })
      .eq("id", batch.id);

    const { data: destinationBatch } = await supabase
      .from("inventory_batches")
      .insert({
        company_id: companyId,
        batch_number: `${batch.batch_number}-TRF`,
        batch_type: batch.batch_type,
        product_id: batch.product_id,

        warehouse_id: header.to_warehouse_id,

        qty: item.qty,
        remaining_qty: item.qty,

        unit_cost: batch.unit_cost,

        production_date: batch.production_date,
        expiry_date: batch.expiry_date,

        supplier_lot_number: batch.supplier_lot_number,
        moisture_percent: batch.moisture_percent,
        defect_percent: batch.defect_percent,
        batch_origin: batch.batch_origin,

        source_table: "inventory_transfers",
        source_id: transfer.id,

        status: "ACTIVE",
      })
      .select()
      .single();

    await supabase.from("stock_movements").insert([
      {
        company_id: companyId,

        movement_type: "TRANSFER",

        movement_date: header.transfer_date,

        product_id: batch.product_id,

        batch_id: batch.id,

        warehouse_id: header.from_warehouse_id,

        qty_in: 0,

        qty_out: item.qty,

        unit_cost: batch.unit_cost,

        reference_number: transfer.transfer_number,

        source_table: "inventory_transfers",

        source_id: transfer.id,

        running_balance: remainingQty,
      },

      {
        company_id: companyId,

        movement_type: "TRANSFER",

        movement_date: header.transfer_date,

        product_id: batch.product_id,

        batch_id: destinationBatch.id,

        warehouse_id: header.to_warehouse_id,

        qty_in: item.qty,

        qty_out: 0,

        unit_cost: batch.unit_cost,

        reference_number: transfer.transfer_number,

        source_table: "inventory_transfers",

        source_id: transfer.id,

        running_balance: item.qty,
      },
    ]);
  }

  return transfer;
}
