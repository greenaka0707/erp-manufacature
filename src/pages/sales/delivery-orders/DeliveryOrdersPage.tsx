import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SearchInput from "@/components/forms/SearchInput";
import FormInput from "@/components/forms/FormInput";

import { useCompanyStore } from "@/stores/companyStore";
import { getDeliveryOrders } from "@/services/delivery-order.service";

export default function DeliveryOrdersPage() {
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  async function loadData() {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await getDeliveryOrders(companyId);
      setOrders(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();
      const matchSearch = order.do_number?.toLowerCase().includes(keyword) || order.sales_orders?.so_number?.toLowerCase().includes(keyword) || order.customers?.name?.toLowerCase().includes(keyword);

      const matchStatus = status === "all" ? true : order.status === status.toUpperCase();

      const matchDate = (!startDate || order.delivery_date >= startDate) && (!endDate || order.delivery_date <= endDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, status, startDate, endDate]);

  const summary = useMemo(() => {
    return {
      total: orders.length,
      draft: orders.filter((x) => x.status === "DRAFT").length,
      posted: orders.filter((x) => x.status === "POSTED").length,
      cancelled: orders.filter((x) => x.status === "CANCELLED").length,
      totalValue: orders.reduce((sum, x) => sum + Number(x.grand_total || 0), 0),
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery Orders" description="Manage customer delivery orders" />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total DO" value={summary.total} />
        <SummaryCard title="Draft" value={summary.draft} />
        <SummaryCard title="Posted" value={summary.posted} />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search DO Number / SO Number / Customer..." />
        </div>
        <FormInput label="From Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <FormInput label="To Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <PrimaryButton onClick={() => navigate("/sales/delivery-orders/create")}>Create DO</PrimaryButton>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "draft", "posted", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-4 py-2 text-sm font-medium ${status === s ? "bg-black text-white" : "border bg-white hover:bg-gray-50"}`}>
            {s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} ({s === "all" ? orders.length : orders.filter((o) => o.status === s.toUpperCase()).length})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <Loading />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="No Delivery Orders" description="Create your first Delivery Order." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">DO Number</th>
                <th className="p-4 text-left">SO Number</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <button onClick={() => navigate(`/sales/delivery-orders/${order.id}`)} className="font-medium text-blue-600 hover:underline">
                      {order.do_number}
                    </button>
                  </td>
                  <td className="p-4">{order.sales_orders?.so_number}</td>
                  <td className="p-4">{order.delivery_date}</td>
                  <td className="p-4">{order.customers?.name}</td>
                  <td className="p-4">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
