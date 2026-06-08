import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getAccountsPayableById } from "@/services/accounts-payable.service";
import { getCashAccounts } from "@/services/cash-account.service";

import { generateSupplierPaymentNumber, createSupplierPayment } from "@/services/supplier-payment.service";

export default function SupplierPaymentFormPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [invoice, setInvoice] = useState<any>(null);

  const [paymentNumber, setPaymentNumber] = useState("");

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  const [referenceNumber, setReferenceNumber] = useState("");

  const [amount, setAmount] = useState("");

  const [notes, setNotes] = useState("");

  const [cashAccountId, setCashAccountId] = useState("");
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && companyId) {
      loadData();
    }
  }, [id, companyId]);

  async function loadData() {
    try {
      setLoading(true);

      const invoiceData = await getAccountsPayableById(id!);

      const paymentNo = await generateSupplierPaymentNumber(companyId!);

      const accounts = await getCashAccounts(companyId!);
      setCashAccounts(accounts);

      setInvoice(invoiceData);

      setPaymentNumber(paymentNo);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!companyId || !invoice) return;

      if (Number(amount) <= 0) {
        alert("Amount harus lebih besar dari 0");
        return;
      }

      if (Number(amount) > outstanding) {
        alert("Payment melebihi outstanding");
        return;
      }

      if (paymentMethod !== "CASH" && !referenceNumber.trim()) {
        alert("Reference Number wajib diisi");
        return;
      }

      setSaving(true);

      if (!cashAccountId) {
        alert("Pilih rekening pembayaran");
        return;
      }

      await createSupplierPayment({
        company_id: companyId,
        supplier_invoice_id: invoice.id,
        cash_account_id: cashAccountId,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        amount: Number(amount),
        notes,
      });

      navigate(`/finance/accounts-payable/${invoice.id}`);
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

  const outstanding = Number(invoice.grand_total || 0) - Number(invoice.paid_amount || 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Record Supplier Payment" description={invoice.invoice_number} />

      {/* INFO */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Supplier</p>

          <p className="font-medium">{invoice.suppliers?.name}</p>
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

            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border p-2">
              <option value="CASH">Cash</option>

              <option value="BANK_TRANSFER">Bank Transfer</option>

              <option value="GIRO">Giro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Payment Account</label>

            <select value={cashAccountId} onChange={(e) => setCashAccountId(e.target.value)} className="w-full rounded-lg border p-2">
              <option value="">Select Account</option>

              {cashAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
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
          <button onClick={() => navigate(`/finance/accounts-payable/${invoice.id}`)} className="rounded-lg border px-4 py-2">
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
