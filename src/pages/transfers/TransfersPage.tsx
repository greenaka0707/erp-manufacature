import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";
import { getTransfers } from "@/services/transfer.service";

export default function TransfersPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return; // <- tambahkan guard

      setLoading(true);

      const data = await getTransfers(companyId); // companyId sudah pasti string
      setTransfers(data || []);
    } catch (error) {
      console.error("Failed to load transfers:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Transfers" description="Manage stock transfers between warehouses" />
      <div className="flex justify-end">
        <button onClick={() => navigate("/inventory/transfers/create")} className="rounded-lg bg-black px-4 py-2 text-white">
          Create Transfer
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">Transfer No</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">From Warehouse</th>
              <th className="p-4 text-left">To Warehouse</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No transfers found
                </td>
              </tr>
            ) : (
              transfers.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/inventory/transfers/${t.id}`)}>
                  <td className="p-4">{t.transfer_number}</td>
                  <td className="p-4">{new Date(t.transfer_date).toLocaleDateString("id-ID")}</td>
                  <td className="p-4">{t.from_warehouse?.name}</td>
                  <td className="p-4">{t.to_warehouse?.name}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        t.status === "DRAFT" ? "bg-gray-100 text-gray-700" : t.status === "IN_TRANSIT" ? "bg-blue-100 text-blue-700" : t.status === "RECEIVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
