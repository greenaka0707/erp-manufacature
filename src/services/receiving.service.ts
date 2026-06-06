import { supabase } from "@/lib/supabase";

export async function getReceivings(companyId: string) {
  const { data, error } = await supabase
    .from("receivings")
    .select(
      `
      *,
      purchase_orders(
        id,
        po_number,
        supplier_id,
        suppliers(
          id,
          name
        )
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function createReceiving(receiving: any, items: any[]) {
  const { data: header, error: headerError } = await supabase.from("receivings").insert(receiving).select().single();

  console.log("HEADER =>", header);
  console.log("HEADER ERROR =>", headerError);

  if (headerError) throw headerError;

  const { error: itemError } = await supabase.from("receiving_items").insert(
    items.map((item) => ({
      receiving_id: header.id,
      product_id: item.product_id,
      purchase_order_item_id: item.purchase_order_item_id,
      qty_received: item.qty_received,
    })),
  );

  if (itemError) throw itemError;

  return header;
}

export async function updateReceivedQty(purchaseOrderItemId: string, qtyReceived: number) {
  const { data: currentItem, error: currentError } = await supabase.from("purchase_order_items").select("received_qty").eq("id", purchaseOrderItemId).single();

  if (currentError) throw currentError;

  const { error } = await supabase
    .from("purchase_order_items")
    .update({
      received_qty: Number(currentItem?.received_qty || 0) + Number(qtyReceived),
    })
    .eq("id", purchaseOrderItemId);

  if (error) throw error;
}

export async function getReceivingById(companyId: string, receivingId: string) {
  const { data, error } = await supabase
    .from("receivings")
    .select(
      `
      *,
      purchase_orders(
        po_number,
        suppliers(
          name
        )
      ),
      receiving_items(
        *,
        products(
          name,
          sku
        )
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", receivingId)
    .single();

  if (error) throw error;

  return data;
}
