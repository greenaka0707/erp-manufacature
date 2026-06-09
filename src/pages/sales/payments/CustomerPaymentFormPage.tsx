import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getInvoiceById } from "@/services/invoice.service";

import { generateCustomerPaymentNumber, createCustomerPayment } from "@/services/customer-payment.service";

export default function CustomerPaymentFormPage() {
  const { invoiceId } = useParams();

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [invoice, setInvoice] = useState<any>(null);

  const [paymentNumber, setPaymentNumber] = useState("");

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  const [referenceNumber, setReferenceNumber] = useState("");

  const [amount, setAmount] = useState("");

  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  
  const [cashAccountId, setCashAccountId] = useState("");

  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  // Perbarui fungsi useEffect dan loadData di dalam file CustomerPaymentFormPage.tsx kamu

  useEffect(() => {
    // Jalankan loadData hanya jika kedua ID sudah siap tersedia
    if (invoiceId && companyId) {
      loadData();
    } else {
      // Matikan status loading jika data prasyarat belum siap agar tidak tertahan blank/loading
      setLoading(false);
    }
  }, [invoiceId, companyId]);

  async function loadData() {
    try {
      setLoading(true);

      if (!companyId || !invoiceId) {
        return;
      }

      // DI SINI
      console.log("Invoice ID dari route:", invoiceId);
      console.log("Company ID:", companyId);
      const [invoiceData, paymentNo, cashAccountData] = await Promise.all([
  getInvoiceById(companyId, invoiceId),
  generateCustomerPaymentNumber(companyId),
  supabase
    .from("cash_accounts")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true),
]);

setInvoice(invoiceData);
setPaymentNumber(paymentNo);
setCashAccounts(cashAccountData.data || []);

      // DI SINI
      console.log("Invoice Data:", invoiceData);

      setInvoice(invoiceData);
      setPaymentNumber(paymentNo);
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    if (saving) return;

    try {
      setSaving(true);

      if (!companyId || !invoice) return;

      if (Number(amount) <= 0) {
        alert("Amount harus lebih besar dari 0");
        return;
      }

      if (Number(amount) > outstanding) {
        alert("Payment melebihi outstanding");
        return;
      }

if (!cashAccountId) {
  alert("Pilih rekening kas/bank");
  return;
}

      if (paymentMethod !== "CASH" && !referenceNumber.trim()) {
        alert("Reference Number wajib diisi");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("AUTH USER:", user?.id);

      await createCustomerPayment({
  company_id: companyId,
  sales_order_id: invoice.sales_order_id,
  sales_invoice_id: invoice.id,
  payment_number: paymentNumber,
  payment_date: paymentDate,
  payment_method: paymentMethod,
  cash_account_id: cashAccountId,
  reference_number: referenceNumber,
  amount: Number(amount),
  notes,
});

      navigate("/sales/accounts-receivable");
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan pembayaran");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  const paidAmount = Number(invoice.allocations?.reduce((sum: number, item: any) => sum + Number(item.allocated_amount || 0), 0)) || 0;
  const outstanding = Number(invoice.grand_total || 0) - paidAmount;

  return (
    <div className="space-y-6">
      <PageHeader title="Record Customer Payment" description={invoice.invoice_number} />

      {/* INFO */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Customer</p>

          <p className="font-medium">{invoice.customer?.name}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Invoice Number</p>

          <p className="font-medium">{invoice.invoice_number}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Grand Total</p>

          <p className="font-medium">Rp {Number(invoice.grand_total).toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>

          <p className="font-medium text-red-600">Rp {outstanding.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* FORM */}
      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Payment Number</label>

            <input disabled value={paymentNumber} className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Date</label>

            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Method</label>
            <div>
  <label className="mb-1 block text-sm font-medium">
    Cash / Bank Account
  </label>

  <select
    value={cashAccountId}
    onChange={(e) => setCashAccountId(e.target.value)}
    className="w-full rounded-lg border p-2"
  >
    <option value="">Pilih Rekening</option>

    {cashAccounts.map((acc) => (
      <option key={acc.id} value={acc.id}>
        {acc.code} - {acc.name}
      </option>
    ))}
  </select>
</div>

            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border p-2">
              <option value="CASH">Cash</option>

              <option value="BANK_TRANSFER">Bank Transfer</option>

              <option value="GIRO">Giro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Reference Number</label>

            <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Outstanding</label>

            <input disabled value={`Rp ${outstanding.toLocaleString("id-ID")}`} className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Amount</label>

            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">Notes</label>

          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border p-2" />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => navigate("/sales/payments")} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
