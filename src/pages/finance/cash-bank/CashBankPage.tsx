import { useEffect, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getCashAccounts } from "@/services/cash-account.service";

export default function CashBankPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!companyId) return;

    loadData();
  }, [companyId]);

  async function loadData() {
    try {
      setLoading(true);

      const data = await getCashAccounts(companyId!);

      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Cash & Bank" description="Manage company cash and bank accounts" />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Accounts</p>

          <p className="text-2xl font-bold">{accounts.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Balance</p>

          <p className="text-2xl font-bold">Rp {totalBalance.toLocaleString("id-ID")}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Active Accounts</p>

          <p className="text-2xl font-bold">{accounts.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Account Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b">
                <td className="p-3">{account.code}</td>

                <td className="p-3">{account.name}</td>

                <td className="p-3">{account.account_type}</td>

                <td className="p-3 text-right">Rp {Number(account.balance).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
