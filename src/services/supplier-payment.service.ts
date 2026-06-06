import { supabase } from "@/lib/supabase";

export async function generateSupplierPaymentNumber(companyId: string) {
  const { data, error } = await supabase.rpc("generate_document_number", {
    p_company_id: companyId,
    p_document_type: "SPAY",
  });

  if (error) throw error;

  return data;
}

export async function createSupplierPayment(payload: { company_id: string; supplier_invoice_id: string; payment_date: string; amount: number; payment_method: string; reference_number?: string; notes?: string }) {
  const { data, error } = await supabase.rpc("create_supplier_payment", {
    p_company_id: payload.company_id,
    p_supplier_invoice_id: payload.supplier_invoice_id,
    p_payment_date: payload.payment_date,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_reference_number: payload.reference_number ?? "",
    p_notes: payload.notes ?? "",
  });

  if (error) throw error;

  return data;
}

export async function getSupplierPayments(supplierInvoiceId: string) {
  const { data, error } = await supabase.from("supplier_payments").select("*").eq("supplier_invoice_id", supplierInvoiceId).order("payment_date", {
    ascending: false,
  });

  if (error) throw error;

  return data;
}
