import { supabase } from "@/lib/supabase";

import { createPurchaseOrderLog } from "./purchase-order-log.service";

export interface PurchaseOrderPayload {
  supplier_id: string;
  po_date: string;
  expected_date?: string;
  supplier_reference?: string;
  notes?: string;
}

export async function getPurchaseOrders(COMPANY_ID: string) {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      `
      *,
      suppliers (
        id,
        code,
        name
      ),
      purchase_order_items (
        qty,
        price,
        received_qty
      )
    `,
    )
    .eq("company_id", COMPANY_ID)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createPurchaseOrder(COMPANY_ID: string, payload: CreatePurchaseOrderPayload) {
  // HEADER
  const { data: po, error: poError } = await supabase.rpc("create_purchase_order", {
    p_company_id: COMPANY_ID,
    p_supplier_id: payload.supplier_id,
    p_po_date: payload.po_date,
    p_expected_date: payload.expected_date || null,
    p_supplier_reference: payload.supplier_reference || null,
    p_notes: payload.notes || null,
  });

  if (poError) throw poError;

  console.log("PO RESULT =>", po);
  console.log("PO ID =>", po.id);

  // ITEMS
  const { error: itemError } = await supabase.from("purchase_order_items").insert(
    payload.items.map((item) => ({
      purchase_order_id: po.id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price,
      received_qty: 0,
    })),
  );

  if (itemError) {
    console.error("ITEM ERROR =>", itemError);

    // rollback sederhana
    await supabase.from("purchase_orders").delete().eq("id", po.id);

    throw itemError;
  }

  // LOG ACTIVITY
  try {
    console.log("CREATE LOG PO_CREATED");

    await createPurchaseOrderLog({
      company_id: COMPANY_ID,
      purchase_order_id: po.id,
      activity: "PO_CREATED",
      description: "Purchase Order dibuat",
    });

    console.log("CREATE LOG SUCCESS");
  } catch (err) {
    console.error("CREATE LOG ERROR =>", err);
  }

  return po;
}

export async function getPurchaseOrderById(COMPANY_ID: string, id: string) {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      `
      *,
      suppliers (
        id,
        code,
        name
      )
    `,
    )
    .eq("company_id", COMPANY_ID)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updatePurchaseOrder(COMPANY_ID: string, id: string, payload: CreatePurchaseOrderPayload) {
  // UPDATE HEADER
  const { data, error } = await supabase
    .from("purchase_orders")
    .update({
      supplier_id: payload.supplier_id,
      po_date: payload.po_date,
      expected_date: payload.expected_date && payload.expected_date.trim() !== "" ? payload.expected_date : null,
      supplier_reference: payload.supplier_reference ?? null,
      notes: payload.notes ?? null,
    })
    .eq("company_id", COMPANY_ID)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // HAPUS ITEM LAMA
  const { error: deleteError } = await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id);

  if (deleteError) throw deleteError;

  // INSERT ITEM BARU
  const { error: itemError } = await supabase.from("purchase_order_items").insert(
    payload.items.map((item) => ({
      purchase_order_id: id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price,
      received_qty: 0,
    })),
  );

  if (itemError) throw itemError;

  return data;
}

export async function deletePurchaseOrder(COMPANY_ID: string, id: string) {
  const { error } = await supabase.from("purchase_orders").delete().eq("company_id", COMPANY_ID).eq("id", id);

  if (error) throw error;
}

export async function approvePurchaseOrder(COMPANY_ID: string, id: string) {
  // VALIDASI STATUS
  const po = await getPurchaseOrderDetail(COMPANY_ID, id);

  if (po.status !== "DRAFT") {
    throw new Error("Only DRAFT purchase order can be approved");
  }

  const { data, error } = await supabase
    .from("purchase_orders")
    .update({
      status: "APPROVED",
      approved_at: new Date().toISOString(),
    })
    .eq("company_id", COMPANY_ID)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await createPurchaseOrderLog({
    company_id: COMPANY_ID,
    purchase_order_id: id,
    activity: "PO_APPROVED",
    description: "Purchase Order approved",
  });

  return data;
}

export async function cancelPurchaseOrder(companyId: string, id: string) {
  const { error } = await supabase
    .from("purchase_orders")
    .update({
      status: "CANCELLED",
    })
    .eq("company_id", companyId)
    .eq("id", id);

  if (error) throw error;
}

export async function updatePurchaseOrderReceivingStatus(purchaseOrderId: string) {
  const { data: items, error: itemError } = await supabase.from("purchase_order_items").select("qty, received_qty").eq("purchase_order_id", purchaseOrderId);

  if (itemError) throw itemError;

  const totalQty = items.reduce((sum, item) => sum + Number(item.qty), 0);

  const totalReceived = items.reduce((sum, item) => sum + Number(item.received_qty || 0), 0);

  let status = "APPROVED";

  if (totalReceived >= totalQty) {
    status = "CLOSED";
  }

  const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", purchaseOrderId);

  if (error) throw error;

  return status;
}

export interface PurchaseOrderItemPayload {
  product_id: string;
  qty: number;
  price: number;
}

export interface CreatePurchaseOrderPayload {
  supplier_id: string;
  po_date: string;
  expected_date?: string;
  supplier_reference?: string;
  notes?: string;

  items: PurchaseOrderItemPayload[];
}

export async function getPurchaseOrderDetail(companyId: string, id: string) {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      `
      *,
      suppliers(
        id,
        code,
        name
      ),
      purchase_order_items(
        id,
        product_id,
        qty,
        price,
        received_qty,
        products(
          id,
          sku,
          name
        )
      ),
      receivings(
        id,
        receiving_number,
        receiving_date,
        status,
        notes,
        created_at
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
