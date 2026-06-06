import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Loading from "@/components/ui/loading";
import PageHeader from "@/components/cards/PageHeader";

import { useCompanyStore } from "@/stores/companyStore";

import { getQCIncomings } from "@/services/qc-incoming.service";

export default function QCIncomingPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    if (!companyId) return;

    try {
      setLoading(true);

      const result = await getQCIncomings(companyId);

      setData(result ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="QC Incoming" description="Quality Control Incoming" />

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">QC Number</th>

              <th className="p-4 text-left">QC Date</th>

              <th className="p-4 text-left">Receiving</th>

              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-4">
                  <Link to={`/purchasing/qc-incoming/${row.id}`} className="font-medium hover:underline">
                    {row.qc_number}
                  </Link>
                </td>

                <td className="p-4">{row.qc_date}</td>

                <td className="p-4">{row.receivings?.receiving_number}</td>

                <td className="p-4">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
