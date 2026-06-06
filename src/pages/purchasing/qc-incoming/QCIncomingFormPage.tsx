import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Loading from "@/components/ui/loading";
import PageHeader from "@/components/cards/PageHeader";

import { useCompanyStore } from "@/stores/companyStore";

import { getReceivingForQC, createQCIncoming } from "@/services/qc-incoming.service";

export default function QCIncomingFormPage() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const receivingId = searchParams.get("receiving");

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [receiving, setReceiving] = useState<any>(null);

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (receivingId && companyId) {
      loadReceiving();
    }
  }, [receivingId, companyId]);

  async function loadReceiving() {
    if (!companyId || !receivingId) return;

    try {
      setLoading(true);

      const data = await getReceivingForQC(companyId, receivingId);

      setReceiving(data);

      setItems(
        data.receiving_items.map((item: any) => ({
          receiving_item_id: item.id,
          product_id: item.product_id,

          qty_received: Number(item.qty_received),

          qty_pass: Number(item.qty_received),

          qty_reject: 0,

          notes: "",
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  async function handleSave() {
    try {
      if (!companyId) return;

      const qc = await createQCIncoming(
        companyId,
        {
          company_id: companyId,
          receiving_id: receiving.id,
          qc_number: `QC-${Date.now()}`,
          qc_date: new Date().toISOString().slice(0, 10),
          status: "COMPLETED",
        },
        items,
      );

      navigate(`/purchasing/qc-incoming/${qc.id}`);
    } catch (error) {
      console.error(error);

      alert("Gagal menyimpan QC");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create QC Incoming" description="Quality Control Incoming" />
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Produk</th>

            <th className="p-4 text-right">Qty Received</th>

            <th className="p-4 text-right">Qty Pass</th>

            <th className="p-4 text-right">Qty Reject</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.receiving_item_id} className="border-b">
              <td className="p-4">{receiving.receiving_items.find((x: any) => x.id === item.receiving_item_id)?.products?.name}</td>

              <td className="p-4 text-right">{item.qty_received}</td>

              <td className="p-4 text-right">
                <input
                  type="number"
                  value={item.qty_pass}
                  onChange={(e) => {
                    const pass = Math.min(Number(e.target.value), item.qty_received);

                    setItems((prev) =>
                      prev.map((row) =>
                        row.receiving_item_id === item.receiving_item_id
                          ? {
                              ...row,
                              qty_pass: pass,
                              qty_reject: row.qty_received - pass,
                            }
                          : row,
                      ),
                    );
                  }}
                  className="w-24 rounded-lg border px-2 py-1 text-right"
                />
              </td>

              <td className="p-4 text-right">{item.qty_reject}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <button onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white">
          Save QC
        </button>
      </div>
    </div>
  );
}
