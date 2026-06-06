import { supabase } from "@/lib/supabase";

export async function getSalesOrders(companyId: string) {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      `
      *,
      customers(
        id,
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getSalesOrderById(id: string) {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(
      `
  *,
  customers(
    id,
    name
  ),
  salespersons(
    id,
    name
  ),
  sales_order_items(
    *,
    products(
      id,
      sku,
      name
    )
  )
`,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export interface SalesOrderItemPayload {
  product_id: string;
  qty: number;
  selling_price: number;
  discount_amount?: number;
}

export interface SalesOrderPayload {
  customer_id: string;

  salesperson_id: string;

  order_date: string;

  notes?: string;

  items: SalesOrderItemPayload[];
}

export async function createSalesOrder(companyId: string, payload: SalesOrderPayload) {
  const { data: soNumber, error: numberError } = await supabase.rpc("generate_sales_order_number");

  if (numberError) throw numberError;

  const subtotal = payload.items.reduce((sum, item) => sum + item.qty * item.selling_price, 0);

  const discountAmount = payload.items.reduce((sum, item) => {
    return sum + Number(item.discount_amount || 0);
  }, 0);

  const totalAmount = subtotal - discountAmount;

  const { data: salesOrder, error } = await supabase
    .from("sales_orders")
    .insert({
      company_id: companyId,

      so_number: soNumber,

      customer_id: payload.customer_id,

      salesperson_id: payload.salesperson_id,

      order_date: payload.order_date,

      status: "DRAFT",

      subtotal,
      discount_amount: discountAmount,
      tax_amount: 0,
      grand_total: totalAmount,

      notes: payload.notes,
    })
    .select()
    .single();

  if (error) throw error;

  const items = payload.items.map((item) => ({
    sales_order_id: salesOrder.id,

    product_id: item.product_id,

    qty: item.qty,

    selling_price: item.selling_price,
    line_total: item.qty * item.selling_price,
  }));

  const { error: itemError } = await supabase.from("sales_order_items").insert(items);

  if (itemError) throw itemError;

  return salesOrder;
}

export async function updateSalesOrder(id: string, data: any) {
  const { data: result, error } = await supabase.from("sales_orders").update(data).eq("id", id).select().single();

  if (error) throw error;

  return result;
}

export async function deleteSalesOrder(id: string) {
  const { error } = await supabase.from("sales_orders").delete().eq("id", id);

  if (error) throw error;
}
