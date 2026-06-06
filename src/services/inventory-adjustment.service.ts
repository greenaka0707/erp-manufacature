import { supabase } from "@/lib/supabase";

export async function getAdjustments(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_adjustments")
    .select(
      `
      *,
      warehouses(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("adjustment_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function getAdjustmentById(companyId: string, adjustmentId: string) {
  const { data, error } = await supabase
    .from("inventory_adjustments")
    .select(
      `
      *,
      warehouses(
        name
      ),
      inventory_adjustment_items(
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
    .eq("id", adjustmentId)
    .single();

  if (error) throw error;

  return data;
}

export async function createAdjustment(companyId: string, header: any, items: any[]) {
  const { data: adjustment, error } = await supabase
    .from("inventory_adjustments")
    .insert({
      company_id: companyId,
      adjustment_number: header.adjustment_number,
      adjustment_date: header.adjustment_date,
      warehouse_id: header.warehouse_id,
      reason: header.reason,
      notes: header.notes,
    })
    .select()
    .single();

  if (error) throw error;

  for (const item of items) {
    await supabase.from("inventory_adjustment_items").insert({
      adjustment_id: adjustment.id,
      batch_id: item.batch_id,
      product_id: item.product_id,
      qty: item.qty,
      adjustment_type: item.adjustment_type,
    });

    const { data: batch } = await supabase.from("inventory_batches").select("*").eq("id", item.batch_id).single();

    if (!batch) {
      throw new Error("Batch tidak ditemukan");
    }

    let newQty = Number(batch.remaining_qty);

    if (item.adjustment_type === "INCREASE") {
      newQty += Number(item.qty);
    } else {
      newQty -= Number(item.qty);
    }

    if (newQty < 0) {
      throw new Error("Stock tidak mencukupi");
    }

    await supabase
      .from("inventory_batches")
      .update({
        remaining_qty: newQty,
      })
      .eq("id", batch.id);

    await supabase.from("stock_movements").insert({
      company_id: companyId,

      movement_type: "ADJUSTMENT",

      movement_date: header.adjustment_date,

      product_id: item.product_id,

      batch_id: item.batch_id,

      warehouse_id: header.warehouse_id,

      qty_in: item.adjustment_type === "INCREASE" ? item.qty : 0,

      qty_out: item.adjustment_type === "DECREASE" ? item.qty : 0,

      unit_cost: batch.unit_cost,

      reference_number: adjustment.adjustment_number,

      source_table: "inventory_adjustments",

      source_id: adjustment.id,

      running_balance: newQty,
    });
  }

  return adjustment;
}

export async function getWarehouses(companyId: string) {
  const { data, error } = await supabase.from("warehouses").select("*").eq("company_id", companyId).eq("is_active", true).order("name");

  if (error) throw error;

  return data;
}

export async function getAvailableBatches(companyId: string) {
  const { data, error } = await supabase
    .from("inventory_batches")
    .select(
      `
      *,
      products(
        name,
        sku
      ),
      warehouses(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .gt("remaining_qty", 0)
    .eq("status", "ACTIVE")
    .order("batch_number");

  if (error) throw error;

  return data;
}
