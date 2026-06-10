import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { useCompanyStore } from "@/stores/companyStore";

import { getCustomerPayments } from "@/services/customer-payment.service";

export default function CustomerPaymentsPage() {
  const navigate = useNavigate();

  const company = useCompanyStore((state) => state.currentCompany);

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.id) return;

    loadData();
  }, [company?.id]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getCustomerPayments(company!.id);

      // data sudah array
      setPayments(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Payments" description="Manage customer payments" />

      <div className="flex justify-end">
        <PrimaryButton onClick={() => navigate("/sales/accounts-receivable")}>Record Payment</PrimaryButton>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No Payments" description="No customer payments found" />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3 text-left">Payment Number</th>
                <th className="p-3 text-left">Payment Date</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Cash / Bank</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="cursor-pointer border-b hover:bg-slate-50" onClick={() => navigate(`/sales/payments/${payment.id}`)}>
                  <td className="p-3">{payment.payment_number}</td>

                  <td className="p-3">{payment.payment_date}</td>

                  <td className="p-3">{payment.invoice?.customer?.name ?? "-"}</td>

                  <td className="p-3">{payment.invoice?.invoice_number ?? "-"}</td>

                  <td className="p-3">{payment.account?.name ?? "-"}</td>

                  <td className="p-3 text-right">Rp {Number(payment.amount || 0).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
