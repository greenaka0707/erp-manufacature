import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getQCIncomingById } from "@/services/qc-incoming.service";
import { createBatchFromQC } from "@/services/inventory.service";

export default function QCIncomingDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [qc, setQc] = useState<any>(null);

  const [batchExists, setBatchExists] = useState(false);

  useEffect(() => {
    if (id && companyId) {
      loadData();
    }
  }, [id, companyId]);

  async function loadData() {
    try {
      if (!companyId || !id) return;

      setLoading(true);

      const data = await getQCIncomingById(companyId, id);

      setQc(data);

      await checkBatchExists(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function checkBatchExists(qcId: string) {
    const { data } = await supabase.from("inventory_batches").select("id").eq("source_table", "qc_incomings").eq("source_id", qcId).maybeSingle();

    setBatchExists(!!data);
  }

  async function handleCreateBatch() {
    try {
      if (!companyId) return;

      await createBatchFromQC(companyId, qc);

      setBatchExists(true);

      setQc({
        ...qc,
        status: "PASSED",
      });

      alert("Batch berhasil dibuat");

      alert("Batch berhasil dibuat");
    } catch (error) {
      console.error(error);

      alert("Gagal membuat batch");
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!qc) {
    return <div>QC tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={qc.qc_number} description="QC Incoming Detail" />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">QC Date</p>

            <p>{qc.qc_date}</p>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs font-medium ${qc.status === "PASSED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{qc.status}</span>

          <div>
            <p className="text-sm text-muted-foreground">Receiving</p>

            <p>{qc.receivings?.receiving_number}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Produk</th>

              <th className="p-4 text-left">SKU</th>

              <th className="p-4 text-right">Pass</th>

              <th className="p-4 text-right">Reject</th>
            </tr>
          </thead>

          <tbody>
            {qc.qc_incoming_items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-4">{item.products?.name}</td>

                <td className="p-4">{item.products?.sku}</td>

                <td className="p-4 text-right">{item.qty_passed}</td>

                <td className="p-4 text-right">{item.qty_rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => navigate("/purchasing/qc-incoming")} className="rounded-lg border px-4 py-2">
          Kembali
        </button>

        {batchExists ? (
          <button disabled className="rounded-lg bg-green-600 px-4 py-2 text-white">
            Batch Created
          </button>
        ) : (
          <button onClick={handleCreateBatch} className="rounded-lg bg-black px-4 py-2 text-white">
            Create Batch
          </button>
        )}
      </div>
    </div>
  );
}
