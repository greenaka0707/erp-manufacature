import { supabase } from "@/lib/supabase";

export interface CreateInvoiceItem {
  salesOrderItemId: string;
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  companyId: string;
  deliveryOrderId: string;
  customerId: string;
  invoiceDate: string;
  items: CreateInvoiceItem[];
  shippingCost?: number;
  notes?: string;
}

// List Invoices
export async function getInvoices(companyId: string) {
  const { data, error } = await supabase
    .from("sales_invoices")
    .select(
      `
      *,
      customer:customers!fk_sales_invoices_customer(id,name),
      sales_order:sales_orders(id,so_number),
      delivery_order:delivery_orders(id,do_number),
      invoice_items:sales_invoice_items_sales_invoice_id_fkey(
        *,
        product:products(id,name,sku,unit_id)
      )
    `,
    )
    .eq("company_id", companyId)
    .order("invoice_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Invoice Detail
export async function getInvoiceById(companyId: string, invoiceId: string) {
  const { data, error } = await supabase
    .from("sales_invoices")
    .select(
      `
      *,
      customer:customers(*),
      sales_order:sales_orders(*),
      delivery_order:delivery_orders(*),

     allocations:customer_payment_allocations!fk_sales_invoice(
  allocated_amount
),

      invoice_items:sales_invoice_items!fk_sales_invoice(
        *,
        product:products(*)
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", invoiceId)
    .single();

  if (error) {
    console.error("Error di Supabase Query:", error);
    throw error;
  }

  return data;
}

// Create Invoice
export async function createInvoice(input: CreateInvoiceInput) {
  // Ambil semua item DO
  const { data: doItems, error: doError } = await supabase
    .from("delivery_order_items")
    .select(
      `
    id,
    sales_order_item_id,
    qty_delivered,
    product_id
  `,
    )
    .eq("delivery_order_id", input.deliveryOrderId);

  if (doError) throw doError;

  if (!doItems || doItems.length === 0) {
    throw new Error("Delivery Order tidak memiliki item");
  }

  // Ambil sales_order_id dari header DO
  const { data: deliveryOrder, error: deliveryOrderError } = await supabase.from("delivery_orders").select("sales_order_id").eq("id", input.deliveryOrderId).single();

  if (deliveryOrderError) throw deliveryOrderError;
  if (!deliveryOrder?.sales_order_id) {
    throw new Error("Delivery Order belum memiliki relasi ke Sales Order");
  }

  const soItemIds = input.items.map((item) => item.salesOrderItemId);

  const { data: soItems, error: soItemsError } = await supabase
    .from("sales_order_items")
    .select(
      `
    id,
    selling_price
  `,
    )
    .in("id", soItemIds);

  if (soItemsError) throw soItemsError;

  const priceMap = new Map((soItems || []).map((item: any) => [item.id, Number(item.selling_price || 0)]));

  // Akumulasikan qty_delivered
  const remainingMap = new Map<string, number>();
  doItems.forEach((item: any) => {
    const currentQty = remainingMap.get(item.sales_order_item_id) || 0;
    remainingMap.set(item.sales_order_item_id, currentQty + Number(item.qty_delivered));
  });

  // Validasi item invoice
  for (const item of input.items) {
    const totalDelivered = remainingMap.get(item.salesOrderItemId);
    if (!totalDelivered) throw new Error("Sales Order Item tidak ditemukan di DO");
    if (item.qty <= 0) throw new Error("Qty harus > 0");

    const { data: soItem, error: soItemError } = await supabase.from("sales_order_items").select("invoiced_qty").eq("id", item.salesOrderItemId).single();

    if (soItemError) throw soItemError;

    const invoicedQty = Number(soItem.invoiced_qty || 0);
    const maxAllowedInvoice = totalDelivered - invoicedQty;
    if (item.qty > maxAllowedInvoice) {
      throw new Error(`Qty invoice melebihi sisa DO. Maksimal ${maxAllowedInvoice}`);
    }
  }

  // Generate nomor invoice
  const { data: invoiceNumber, error: numberError } = await supabase.rpc("generate_sales_invoice_number");
  if (numberError) throw numberError;

  // Insert invoice header
  const invoiceItems = input.items.map((item) => {
    const unitPrice = priceMap.get(item.salesOrderItemId) || 0;

    return {
      ...item,
      unitPrice,
      lineTotal: item.qty * unitPrice,
    };
  });

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const grandTotal = subtotal + (input.shippingCost || 0);

  const { data: invoice, error } = await supabase
    .from("sales_invoices")
    .insert({
      company_id: input.companyId,
      invoice_number: invoiceNumber,
      delivery_order_id: input.deliveryOrderId,
      sales_order_id: deliveryOrder.sales_order_id,
      customer_id: input.customerId,
      invoice_date: input.invoiceDate,
      status: "DRAFT",
      subtotal,
      shipping_cost: input.shippingCost || 0,
      tax_amount: 0,
      grand_total: grandTotal,
      notes: input.notes || "",
    })
    .select()
    .single();

  if (error) throw error;

  // Insert invoice items
  const itemsToInsert = invoiceItems.map((item) => ({
    sales_invoice_id: invoice.id,
    sales_order_item_id: item.salesOrderItemId,
    product_id: item.productId,
    qty: item.qty,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
  }));

  const { error: itemsError } = await supabase.from("sales_invoice_items").insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return invoice;
}

// Post Invoice
export async function postInvoice(companyId: string, invoiceId: string) {
  // Ambil invoice dan itemnya dengan relasi yang benar
  const { data: invoice, error } = await supabase
    .from("sales_invoices")
    .select(
      `
      *,
      invoice_items:sales_invoice_items_sales_invoice_id_fkey(
        id,
        sales_order_item_id,
        qty
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("id", invoiceId)
    .single();

  if (error) throw error;

  // Update status invoice ke UNPAID (enum yang valid)
  const { error: updateInvoiceError } = await supabase.from("sales_invoices").update({ status: "UNPAID" }).eq("id", invoiceId);

  if (updateInvoiceError) throw updateInvoiceError;

  // Update qty invoiced di sales_order_items
  for (const item of invoice.invoice_items) {
    const { data: soItem, error: soItemError } = await supabase.from("sales_order_items").select("invoiced_qty").eq("id", item.sales_order_item_id).single();

    if (soItemError) throw soItemError;

    const { error: updateError } = await supabase
      .from("sales_order_items")
      .update({ invoiced_qty: Number(soItem.invoiced_qty || 0) + Number(item.qty) })
      .eq("id", item.sales_order_item_id);

    if (updateError) throw updateError;
  }

  return invoice;
}

// Cancel Invoice
export async function cancelInvoice(companyId: string, invoiceId: string) {
  const { data: invoice, error } = await supabase.from("sales_invoices").select("id,status").eq("company_id", companyId).eq("id", invoiceId).single();

  if (error) throw error;
  if (invoice.status !== "DRAFT") throw new Error("Hanya invoice DRAFT yang bisa dibatalkan");

  const { error: cancelError } = await supabase.from("sales_invoices").update({ status: "CANCELLED" }).eq("id", invoiceId);

  if (cancelError) throw cancelError;

  return true;
}

// Ambil DO yang bisa di-invoice
export async function getDeliveryOrdersForInvoice(companyId: string) {
  const { data, error } = await supabase
    .from("delivery_orders")
    .select(
      `
      *,
      customers(
        id,
        name
      ),
      delivery_order_items(
        *,
        product:products(
          id,
          name,
          sku
        ),
        sales_order_item:sales_order_items(
          id,
          qty,
          invoiced_qty,
          selling_price
        )
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("status", "POSTED")
    .order("delivery_date", { ascending: false });

  if (error) throw error;

  const { data: existingInvoices, error: invoiceError } = await supabase.from("sales_invoices").select("delivery_order_id,status").neq("status", "CANCELLED");
  if (invoiceError) throw invoiceError;

  const usedDOIds = new Set(existingInvoices?.map((x) => x.delivery_order_id));

  return (data ?? []).filter((deliveryOrder: any) => {
    if (usedDOIds.has(deliveryOrder.id)) {
      return false;
    }

    return deliveryOrder.delivery_order_items.some((item: any) => {
      const remainingQty = Number(item.qty_delivered) - Number(item.sales_order_item?.invoiced_qty || 0);

      return remainingQty > 0;
    });
  });
}
