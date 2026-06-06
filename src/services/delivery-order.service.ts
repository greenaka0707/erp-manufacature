import { supabase } from "@/lib/supabase";

export interface CreateDeliveryOrderItem {
  salesOrderItemId: string;
  productId: string;
  qtyDelivered: number;
}

export interface CreateDeliveryOrderInput {
  companyId: string;
  salesOrderId: string;
  customerId: string;
  deliveryDate: string;
  notes?: string;
  items: CreateDeliveryOrderItem[];
}

// List DO
export async function getDeliveryOrders(companyId: string) {
  const { data, error } = await supabase
    .from("delivery_orders")
    .select(
      `
      *,
      customers(id, name),
      sales_orders(id, so_number)
    `,
    )
    .eq("company_id", companyId)
    .order("delivery_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Detail DO
export async function getDeliveryOrderById(companyId: string, deliveryOrderId: string) {
  const { data, error } = await supabase
    .from("delivery_orders")
    .select(
      `
      *,
      customers(id, name, phone, address),
      sales_orders(id, so_number),
      delivery_order_items(*, product:products(id, name, sku, unit_id))
    `,
    )
    .eq("company_id", companyId)
    .eq("id", deliveryOrderId)
    .single();

  if (error) throw error;
  return data;
}

// Create DO
export async function createDeliveryOrder(input: CreateDeliveryOrderInput) {
  // Validasi remaining_qty
  const { data: soItems, error: soError } = await supabase.from("sales_order_items").select(`id, qty, delivered_qty`).eq("sales_order_id", input.salesOrderId);

  if (soError) throw soError;

  const remainingMap = new Map<string, number>();
  soItems.forEach((item: any) => {
    remainingMap.set(item.id, Number(item.qty) - Number(item.delivered_qty || 0));
  });

  input.items.forEach((item) => {
    const remaining = remainingMap.get(item.salesOrderItemId);
    if (!remaining) throw new Error("Sales Order Item tidak ditemukan");
    if (item.qtyDelivered <= 0) throw new Error("Qty harus > 0");
    if (item.qtyDelivered > remaining) throw new Error(`Qty delivery melebihi sisa qty. Maksimal ${remaining}`);
  });

  // Generate DO Number
  const { data: doNumber, error: numberError } = await supabase.rpc("generate_delivery_order_number");
  if (numberError) throw numberError;

  // Insert DO Header
  const { data: deliveryOrder, error } = await supabase
    .from("delivery_orders")
    .insert({
      company_id: input.companyId,
      do_number: doNumber,
      sales_order_id: input.salesOrderId,
      customer_id: input.customerId,
      delivery_date: input.deliveryDate,
      notes: input.notes,
      status: "DRAFT",
    })
    .select()
    .single();

  if (error) throw error;

  // Insert DO Items
  const itemsToInsert = input.items.map((item) => ({
    delivery_order_id: deliveryOrder.id,
    sales_order_item_id: item.salesOrderItemId,
    product_id: item.productId,
    qty_delivered: item.qtyDelivered,
  }));

  const { error: itemsError } = await supabase.from("delivery_order_items").insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return deliveryOrder;
}

// Post DO (status -> POSTED + stock movement + update SO progress)
export async function postDeliveryOrder(companyId: string, deliveryOrderId: string) {
  // Ambil DO + items
  const { data: deliveryOrder, error } = await supabase
    .from("delivery_orders")
    .select(
      `
      id,
      company_id,
      sales_order_id,
      do_number,
      delivery_order_items(*, product_id, qty_delivered)
    `,
    )
    .eq("company_id", companyId)
    .eq("id", deliveryOrderId)
    .single();

  if (error) throw error;
  if (!deliveryOrder) throw new Error("DO tidak ditemukan");
  const { data: warehouse, error: warehouseError } = await supabase.from("warehouses").select("id").eq("company_id", companyId).eq("is_default", true).single();

  if (warehouseError) throw warehouseError;
  if (!warehouse) throw new Error("Default warehouse tidak ditemukan");

  // Update DO status
  await supabase.from("delivery_orders").update({ status: "POSTED" }).eq("id", deliveryOrderId);

  // FIFO batch consumption & stock movement
  for (const item of deliveryOrder.delivery_order_items) {
    let remainingQty = item.qty_delivered;

    // Ambil batch aktif FG
    const { data: batches, error: batchError } = await supabase.from("inventory_batches").select("*").eq("product_id", item.product_id).eq("warehouse_id", warehouse.id).gt("remaining_qty", 0).order("production_date", { ascending: true });

    if (batchError) throw batchError;

    if (!batches?.length) {
      throw new Error(`Stock batch tidak ditemukan untuk produk ${item.product_id}`);
    }

    const totalAvailable = batches.reduce((sum, batch) => sum + Number(batch.remaining_qty), 0);

    if (totalAvailable < remainingQty) {
      throw new Error(`Stock tidak cukup. Tersedia ${totalAvailable}, dibutuhkan ${remainingQty}`);
    }

    for (const batch of batches ?? []) {
      if (remainingQty <= 0) break;

      const consume = Math.min(batch.remaining_qty, remainingQty);

      // Kurangi batch
      await supabase
        .from("inventory_batches")
        .update({ remaining_qty: batch.remaining_qty - consume, consumed_at: new Date().toISOString() })
        .eq("id", batch.id);

      // Stock movement
      const { error: movementError } = await supabase.from("stock_movements").insert({
        company_id: companyId,
        product_id: item.product_id,
        batch_id: batch.id,
        warehouse_id: batch.warehouse_id, // pastikan bukan placeholder
        movement_type: "SALE_OUT",
        qty_out: consume,
        reference_number: deliveryOrder.do_number,
        source_table: "delivery_orders",
        source_id: deliveryOrder.id,
        created_at: new Date().toISOString(),
      });
      if (movementError) throw movementError;

      remainingQty -= consume;
    }
  }

  // Update delivered_qty di SO items
  for (const item of deliveryOrder.delivery_order_items) {
    const { data: soItem, error: soItemError } = await supabase.from("sales_order_items").select("delivered_qty").eq("id", item.sales_order_item_id).single();

    if (soItemError) throw soItemError;

    const { error: updateError } = await supabase
      .from("sales_order_items")
      .update({
        delivered_qty: Number(soItem.delivered_qty || 0) + Number(item.qty_delivered),
      })
      .eq("id", item.sales_order_item_id);

    if (updateError) throw updateError;
  }

  return deliveryOrder;
}

// Cancel DO (hanya DRAFT)
export async function cancelDeliveryOrder(companyId: string, deliveryOrderId: string) {
  const { data: deliveryOrder, error } = await supabase.from("delivery_orders").select("id, status").eq("company_id", companyId).eq("id", deliveryOrderId).single();

  if (error) throw error;
  if (deliveryOrder.status !== "DRAFT") throw new Error("Hanya DO DRAFT yang bisa dibatalkan");

  const { error: cancelError } = await supabase.from("delivery_orders").update({ status: "CANCELLED" }).eq("id", deliveryOrderId);

  if (cancelError) throw cancelError;

  return true;
}

export async function getApprovedSalesOrders(companyId: string) {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      `
      *,
      customers(id,name),
      sales_order_items(
        *,
        product:products(
          id,
          name,
          sku,
          unit_id
        )
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("status", "APPROVED")
    .order("order_date", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((so: any) => {
      const items = so.sales_order_items.map((item: any) => ({
        ...item,
        remaining_qty: Number(item.qty) - Number(item.delivered_qty || 0),
      }));

      return {
        ...so,
        sales_order_items: items,
      };
    })
    .filter((so: any) => so.sales_order_items.some((item: any) => item.remaining_qty > 0));
}
