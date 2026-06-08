import { supabase } from "@/lib/supabase";

interface CreateCustomerPaymentInput {
  company_id: string;
  sales_order_id: string;
  sales_invoice_id: string;
  payment_number: string;
  payment_date: string;
  payment_method: string;
  cash_account_id: string;
  reference_number?: string;
  amount: number;
  notes?: string;
}

export async function generateCustomerPaymentNumber(companyId: string) {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");

  const { count } = await supabase.from("customer_payments").select("*", { count: "exact", head: true }).eq("company_id", companyId);

  const running = String((count || 0) + 1).padStart(3, "0");

  return `CP-${yyyymmdd}-${running}`;
}

export async function createCustomerPayment(payload: CreateCustomerPaymentInput) {
  // VALIDASI DULU

  const { data: invoice, error: invoiceError } = await supabase
  .from("sales_invoices")
  .select("id, grand_total, status, payment_status")
  .eq("id", payload.sales_invoice_id)
  .single();

  if (invoiceError) throw invoiceError;

  if (invoice.payment_status === "PAID") {
  throw new Error("Invoice sudah PAID");
}

if (invoice.status === "CANCELLED") {
  throw new Error("Invoice sudah dibatalkan");
}

if (invoice.status === "DRAFT") {
  throw new Error("Invoice belum diposting");
}

  const { data: existingAllocations } = await supabase.from("customer_payment_allocations").select("allocated_amount").eq("sales_invoice_id", payload.sales_invoice_id);

  const alreadyPaid = existingAllocations?.reduce((sum, row) => sum + Number(row.allocated_amount || 0), 0) || 0;

  const outstanding = Number(invoice.grand_total) - alreadyPaid;

  if (outstanding <= 0) {
    throw new Error("Invoice sudah lunas");
  }

  if (Number(payload.amount) > outstanding) {
    throw new Error(`Pembayaran melebihi outstanding. Maksimal ${outstanding}`);
  }

  // BARU INSERT PAYMENT

  const { data: payment, error: paymentError } = await supabase.from("customer_payments").insert(payload).select().single();

  if (paymentError) throw paymentError;

  // INSERT ALLOCATION

  const { error: allocationError } = await supabase.from("customer_payment_allocations").insert({
    company_id: payload.company_id,
    customer_payment_id: payment.id,
    sales_invoice_id: payload.sales_invoice_id,
    allocated_amount: payload.amount,
  });

  if (allocationError) throw allocationError;

  // HITUNG ULANG TOTAL PEMBAYARAN

  const { data: allocations } = await supabase.from("customer_payment_allocations").select("allocated_amount").eq("sales_invoice_id", payload.sales_invoice_id);

  const paidAmount = allocations?.reduce((sum, row) => sum + Number(row.allocated_amount || 0), 0) || 0;

 let paymentStatus = "UNPAID";

if (paidAmount >= Number(invoice.grand_total)) {
  paymentStatus = "PAID";
} else if (paidAmount > 0) {
  paymentStatus = "PARTIAL";
}

const { error: updateError } = await supabase
  .from("sales_invoices")
  .update({
    payment_status: paymentStatus,
  })
  .eq("id", payload.sales_invoice_id);

if (updateError) throw updateError;

  return payment;
}

// Fix getCustomerPayments untuk TypeScript dan Supabase response
export async function getCustomerPayments(companyId: string) {
  const { data, error } = await supabase
    .from("customer_payments")
    .select(
      `
      *,
      allocations:customer_payment_allocations!fk_customer_payment(*)  -- gunakan constraint fk_customer_payment
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
