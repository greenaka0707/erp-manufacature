import { supabase } from "@/lib/supabase";

interface CreateCustomerPaymentInput {
  company_id: string;
  sales_order_id: string;
  sales_invoice_id: string;
  cash_account_id: string;
  payment_number: string;
  payment_date: string;
  payment_method: string;
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

  const { data: invoice, error: invoiceError } = await supabase.from("sales_invoices").select("id, grand_total, status, payment_status").eq("id", payload.sales_invoice_id).single();

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

  if (!payload.cash_account_id) {
    throw new Error("Cash account wajib dipilih");
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

  const { error: cashTxError } = await supabase.from("cash_transactions").insert({
    company_id: payload.company_id,
    cash_account_id: payload.cash_account_id,
    transaction_type: "CUSTOMER_PAYMENT",
    transaction_date: payload.payment_date,
    reference_type: "CUSTOMER_PAYMENT",
    reference_id: payment.id,
    amount: payload.amount,
    description: `Pembayaran Customer ${payload.payment_number}`,
  });

  if (cashTxError) throw cashTxError;

  const { data: account, error: accountError } = await supabase.from("cash_accounts").select("balance").eq("id", payload.cash_account_id).single();

  if (accountError) throw accountError;

  const { error: balanceError } = await supabase
    .from("cash_accounts")
    .update({
      balance: Number(account.balance || 0) + Number(payload.amount),
    })
    .eq("id", payload.cash_account_id);

  if (balanceError) throw balanceError;

  return payment;
}

// Fix getCustomerPayments untuk TypeScript dan Supabase response
export async function getCustomerPayments(companyId: string) {
  const { data, error } = await supabase
    .from("customer_payments")
    .select(
      `
      *,
      invoice:sales_invoices(
        invoice_number,
        customer:customers(
          id,
          name
        )
      ),
      account:cash_accounts(
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

export async function getCustomerPaymentById(id: string) {
  const { data, error } = await supabase
    .from("customer_payments")
    .select(
      `
      *,
      invoice:sales_invoices(
        invoice_number,
        status,
        customer:customers(
          name
        )
      ),
      account:cash_accounts(
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
