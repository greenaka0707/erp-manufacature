import { supabase } from "@/lib/supabase";

export async function getAccountsPayable(companyId: string) {
  const { data, error } = await supabase
    .from("supplier_invoices")
    .select(
      `
      *,
      suppliers(
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("due_date", {
      ascending: true,
    });

  if (error) throw error;

  return data;
}

export async function generateSupplierPaymentNumber(companyId: string) {
  const { data, error } = await supabase.rpc("generate_document_number", {
    p_company_id: companyId,
    p_document_type: "SPAY",
  });

  if (error) throw error;

  return data;
}

export async function getAccountsPayableById(id: string) {
  const { data, error } = await supabase
    .from("supplier_invoices")
    .select(
      `
      *,
      suppliers(
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
