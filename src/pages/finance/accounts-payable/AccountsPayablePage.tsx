import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import SearchInput from "@/components/forms/SearchInput";
import FormInput from "@/components/forms/FormInput";

import { useCompanyStore } from "@/stores/companyStore";

import { getAccountsPayable } from "@/services/accounts-payable.service";

export default function AccountsPayablePage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("all");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getAccountsPayable(companyId);

      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.invoice_number?.toLowerCase().includes(search.toLowerCase()) || item.suppliers?.name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "all" ? true : item.status === status.toUpperCase();

      const matchDate = (!startDate || item.invoice_date >= startDate) && (!endDate || item.invoice_date <= endDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [items, search, status, startDate, endDate]);

  const summary = useMemo(() => {
    const totalOutstanding = items.filter((x) => x.status !== "PAID").reduce((sum, item) => sum + Number(item.grand_total || 0), 0);

    const unpaidCount = items.filter((x) => x.status === "UNPAID").length;

    const partialCount = items.filter((x) => x.status === "PARTIAL").length;

    const overdueCount = items.filter((x) => x.status !== "PAID" && new Date(x.due_date) < new Date()).length;

    return {
      totalOutstanding,
      unpaidCount,
      partialCount,
      overdueCount,
    };
  }, [items]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Payable" description="Manage supplier liabilities" />

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Outstanding</p>

          <p className="mt-2 text-3xl font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(summary.totalOutstanding)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Unpaid</p>

          <p className="mt-2 text-3xl font-bold">{summary.unpaidCount}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Partial</p>

          <p className="mt-2 text-3xl font-bold">{summary.partialCount}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>

          <p className="mt-2 text-3xl font-bold">{summary.overdueCount}</p>
        </div>
      </div>

      {/* STATUS TAB */}
      <div className="flex flex-wrap gap-2">
        {["all", "unpaid", "partial", "paid"].map((item) => (
          <button key={item} onClick={() => setStatus(item)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${status === item ? "bg-black text-white" : "border bg-white hover:bg-gray-50"}`}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
            {" ("}
            {item === "all" ? items.length : items.filter((x) => x.status === item.toUpperCase()).length})
          </button>
        ))}
      </div>

      {/* FILTER */}
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search Invoice / Supplier..." />
          </div>

          <FormInput label="From Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <FormInput label="To Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* TABLE */}
      {filteredItems.length === 0 ? (
        <EmptyState title="No Accounts Payable" description="No supplier liabilities found." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">Invoice Number</th>

                <th className="p-4 text-left">Supplier</th>

                <th className="p-4 text-left">Invoice Date</th>

                <th className="p-4 text-left">Due Date</th>

                <th className="p-4 text-right">Amount</th>

                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <button onClick={() => navigate(`/finance/accounts-payable/${item.id}`)} className="font-medium text-blue-600 hover:underline">
                      {item.invoice_number}
                    </button>
                  </td>

                  <td className="p-4">{item.suppliers?.name}</td>

                  <td className="p-4">{new Date(item.invoice_date).toLocaleDateString("id-ID")}</td>

                  <td className="p-4">{new Date(item.due_date).toLocaleDateString("id-ID")}</td>

                  <td className="p-4 text-right">Rp {Number(item.grand_total || 0).toLocaleString("id-ID")}</td>

                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.status === "PAID" ? "bg-green-100 text-green-700" : item.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
