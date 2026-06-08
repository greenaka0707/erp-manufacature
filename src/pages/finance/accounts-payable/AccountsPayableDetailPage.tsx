import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { getAccountsPayableById } from "@/services/accounts-payable.service";
import { getSupplierPayments } from "@/services/supplier-payment.service";

export default function AccountsPayableDetailPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [invoice, setInvoice] = useState<any>(null);

  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      const invoiceData = await getAccountsPayableById(id!);

      const paymentData = await getSupplierPayments(id!);

      setInvoice(invoiceData);

      setPayments(paymentData || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  if (!invoice) {
    return <div>Data not found</div>;
  }

  const outstanding = Number(invoice.grand_total || 0) - Number(invoice.paid_amount || 0);

  return (
    <div className="space-y-6">
      <PageHeader title={invoice.invoice_number} description="Accounts Payable Detail" />

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Supplier</p>

          <p className="font-medium">{invoice.suppliers?.name}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Grand Total</p>

          <p className="font-medium">Rp {Number(invoice.grand_total).toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Paid Amount</p>

          <p className="font-medium text-green-600">Rp {Number(invoice.paid_amount).toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>

          <p className="font-medium text-red-600">Rp {outstanding.toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Status</p>

          <p className="font-medium">{invoice.status}</p>
        </div>
      </div>

      <div className="flex justify-end">
        {outstanding > 0 && (
          <button
            onClick={() => {
              const url = `/finance/accounts-payable/${invoice.id}/payment`;

              console.log("NAVIGATE TO =", url);

              navigate(url);
            }}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Record Payment
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-4 font-semibold">Payment History</div>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Payment Number</th>

              <th className="p-4 text-left">Payment Date</th>

              <th className="p-4 text-left">Method</th>

              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No payment history
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="p-4">{payment.payment_number}</td>

                  <td className="p-4">{new Date(payment.payment_date).toLocaleDateString("id-ID")}</td>

                  <td className="p-4">{payment.payment_method}</td>

                  <td className="p-4 text-right">Rp {Number(payment.amount).toLocaleString("id-ID")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
