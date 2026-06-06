import { useEffect, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { getReceivings } from "@/services/receiving.service";

import ReceivingTable from "./ReceivingTable";
import { useCompanyStore } from "@/stores/companyStore";

export default function ReceivingsPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [receivings, setReceivings] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    if (!companyId) return;

    try {
      setLoading(true);

      const data = await getReceivings(companyId);

      setReceivings(data ?? []);
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
      <PageHeader title="Receivings" description="Manage incoming deliveries from suppliers" />

      <ReceivingTable data={receivings} />
    </div>
  );
}
