import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getSalesOrders } from "@/services/sales-order.service";

import { useMemo } from "react";

import FormInput from "@/components/forms/FormInput";
import SearchInput from "@/components/forms/SearchInput";

import EmptyState from "@/components/ui/empty-state";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = order.so_number?.toLowerCase().includes(search.toLowerCase()) || order.customers?.name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "all" ? true : order.status === status.toUpperCase();

      const matchDate = (!startDate || order.order_date >= startDate) && (!endDate || order.order_date <= endDate);

      return matchSearch && matchStatus && matchDate;
    });
  }, [orders, search, status, startDate, endDate]);

  const summary = useMemo(() => {
    return {
      draftCount: orders.filter((x) => x.status === "DRAFT").length,

      approvedCount: orders.filter((x) => x.status === "APPROVED").length,

      totalOrders: orders.length,

      totalValue: orders.reduce((sum, row) => sum + Number(row.grand_total || 0), 0),
    };
  }, [orders]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const statusParam = params.get("status");

    if (statusParam) {
      setStatus(statusParam);
    }
  }, [location.search]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const data = await getSalesOrders(companyId);

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Orders" description="Manage customer sales orders" />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Orders</p>

          <p className="mt-2 text-3xl font-bold">{summary.totalOrders}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Draft</p>

          <p className="mt-2 text-2xl font-bold">{summary.draftCount}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Approved</p>

          <p className="mt-2 text-2xl font-bold">{summary.approvedCount}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Total Value</p>

          <p className="mt-2 text-3xl font-bold">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(summary.totalValue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search SO Number / Customer..." />
          </div>

          <FormInput label="From Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <FormInput label="To Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <button className="rounded-lg border px-4 py-2">Export PDF</button>

          <PrimaryButton onClick={() => navigate("/sales/orders/create")}>Create SO</PrimaryButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "draft", "approved", "closed", "cancelled"].map((statusItem) => (
          <button key={statusItem} onClick={() => setStatus(statusItem)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${status === statusItem ? "bg-black text-white" : "border bg-white hover:bg-gray-50"}`}>
            {statusItem.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} ({statusItem === "all" ? orders.length : orders.filter((order) => order.status === statusItem.toUpperCase()).length})
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="No Sales Orders" description="Create your first Sales Order." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">SO Number</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">
                    <button onClick={() => navigate(`/sales/orders/${order.id}?status=${status}`)} className="font-medium text-blue-600 hover:underline">
                      {order.so_number}
                    </button>
                  </td>

                  <td className="p-4">{order.order_date}</td>

                  <td className="p-4">{order.customers?.name}</td>

                  <td className="p-4">{order.status}</td>

                  <td className="p-4 text-right">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(Number(order.grand_total || 0))}
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
