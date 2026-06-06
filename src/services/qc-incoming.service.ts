import { supabase } from "@/lib/supabase";

import { createBatchFromQC } from "./inventory.service";

export async function getReceivingForQC(companyId: string, receivingId: string) {
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

export async function createQCIncoming(companyId: string, header: any, items: any[]) {
  const { data: qc, error } = await supabase.from("qc_incomings").insert(header).select().single();

  if (error) throw error;

  const { error: itemError } = await supabase.from("qc_incoming_items").insert(
    items.map((item) => ({
      qc_incoming_id: qc.id,
      product_id: item.product_id,
      qty_passed: item.qty_pass,
      qty_rejected: item.qty_reject,
      notes: item.notes,
    })),
  );

  if (itemError) throw itemError;

  // ambil QC lengkap
  const { data: qcDetail, error: qcDetailError } = await supabase
    .from("qc_incomings")
    .select(
      `
      *,
      qc_incoming_items(*)
    `,
    )
    .eq("id", qc.id)
    .single();

  if (qcDetailError) throw qcDetailError;

  // buat batch otomatis
  await createBatchFromQC(companyId, qcDetail);

  return qc;
}

export async function getQCIncomings(companyId: string) {
  const { data, error } = await supabase
    .from("qc_incomings")
    .select(
      `
      *,
      receivings(
        receiving_number
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

export async function getQCIncomingById(companyId: string, qcId: string) {
  const { data, error } = await supabase
    .from("qc_incomings")
    .select(
      `
  *,
  receivings(
    id,
    receiving_number
  ),
  qc_incoming_items(
    *,
    products(
      name,
      sku
    )
  )
`,
    )
    .eq("company_id", companyId)
    .eq("id", qcId)
    .single();

  if (error) throw error;

  return data;
}
