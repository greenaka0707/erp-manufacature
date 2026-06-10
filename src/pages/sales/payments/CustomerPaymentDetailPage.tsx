import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { getCustomerPaymentById } from "@/services/customer-payment.service";

export default function CustomerPaymentDetailPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getCustomerPaymentById(id!);

      setPayment(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  if (!payment) {
    return <div>Payment not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Payment Detail" description={payment.payment_number} />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Payment Number</p>
            <p className="font-medium">{payment.payment_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Date</p>
            <p className="font-medium">{payment.payment_date}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Invoice Number</p>
            <p className="font-medium">{payment.invoice?.invoice_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Invoice Status</p>
            <p className="font-medium">{payment.invoice?.status}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-medium">{payment.payment_method}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Cash / Bank</p>
            <p className="font-medium">{payment.account?.name ?? "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Reference Number</p>
            <p className="font-medium">{payment.reference_number ?? "-"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-medium">Rp {Number(payment.amount).toLocaleString("id-ID")}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Notes</p>

          <p className="mt-1">{payment.notes || "-"}</p>
        </div>
      </div>
    </div>
  );
}
