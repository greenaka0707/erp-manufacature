import { supabase } from "@/lib/supabase";

export async function getSupplierInvoices(companyId: string) {
  const { data, error } = await supabase
    .from("supplier_invoices")
    .select(
      `
      *,
      suppliers(
        name
      ),
      purchase_orders(
        po_number
      )
    `,
    )
    .eq("company_id", companyId)
    .order("invoice_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function getPurchaseOrdersForInvoice(companyId: string) {
  const { data: invoices, error: invoiceError } = await supabase.from("supplier_invoices").select("purchase_order_id").eq("company_id", companyId);

  if (invoiceError) throw invoiceError;
  const usedPOIds = invoices?.map((x) => x.purchase_order_id) || [];

  const query = supabase
    .from("purchase_orders")
    .select(
      `
      *,
      suppliers(
        name
      ),
      purchase_order_items(
        qty,
        price,
        total
      )
    `,
    )
    .eq("company_id", companyId)
    .eq("status", "CLOSED");

  if (usedPOIds.length > 0) {
    query.not("id", "in", `(${usedPOIds.map((id) => `"${id}"`).join(",")})`);
  }
  const { data, error } = await query.order("po_date", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}

export async function generateSupplierInvoiceNumber(companyId: string) {
  const result = await supabase.rpc("generate_document_number", {
    p_company_id: companyId,
    p_document_type: "SINV",
  });

  console.log("FULL RPC RESULT", result);

  if (result.error) throw result.error;

  return result.data;
}

export async function createSupplierInvoice(payload: { company_id: string; supplier_id: string; purchase_order_id: string; invoice_date: string; due_date: string; subtotal: number; tax_amount: number; grand_total: number }) {
  const { data, error } = await supabase.rpc("create_supplier_invoice", {
    p_company_id: payload.company_id,
    p_supplier_id: payload.supplier_id,
    p_purchase_order_id: payload.purchase_order_id,
    p_invoice_date: payload.invoice_date,
    p_due_date: payload.due_date,
    p_subtotal: payload.subtotal,
    p_tax_amount: payload.tax_amount,
    p_grand_total: payload.grand_total,
  });

  if (error) throw error;

  return data;
}

export async function getSupplierInvoiceById(id: string) {
  const { data, error } = await supabase
    .from("supplier_invoices")
    .select(
      `
      *,
      suppliers(
        *
      ),
      purchase_orders(
        *,
        purchase_order_items(
          *,
          products(
            name,
            sku
          )
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
