import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FormInput from "@/components/forms/FormInput";
import { exportPurchaseOrdersPdf } from "../../../utils/export-purchase-orders-pdf";

import PageHeader from "@/components/cards/PageHeader";
import Modal from "@/components/dialogs/Modal";

import SearchInput from "@/components/forms/SearchInput";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

// TAMBAHAN: Import komponen Card baru yang sudah di-refactor
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { useCompanyStore } from "@/stores/companyStore";
import { getPurchaseOrders } from "@/services/purchase-order.service";

import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderTable from "./PurchaseOrderTable";

export default function PurchaseOrdersPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (companyId) {
      loadPurchaseOrders();
    }
  }, [companyId]);

  async function loadPurchaseOrders() {
    try {
      setLoading(true);
      if (!companyId) return;
      const data = await getPurchaseOrders(companyId);
      setPurchaseOrders(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch = po.po_number?.toLowerCase().includes(search.toLowerCase()) || po.suppliers?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" ? true : po.status === status.toUpperCase();
      const matchDate = (!startDate || po.po_date >= startDate) && (!endDate || po.po_date <= endDate);
      return matchSearch && matchStatus && matchDate;
    });
  }, [purchaseOrders, search, status, startDate, endDate]);

  const summary = useMemo(() => {
    const draftCount = purchaseOrders.filter((po) => po.status === "DRAFT").length;
    const approvedCount = purchaseOrders.filter((po) => po.status === "APPROVED").length;

    const outstandingQty = purchaseOrders.reduce(
      (sum, po) =>
        sum +
        (po.purchase_order_items ?? []).reduce((itemSum: number, item: any) => {
          const outstanding = Math.max(Number(item.qty || 0) - Number(item.received_qty || 0), 0);
          return itemSum + outstanding;
        }, 0),
      0,
    );

    const outstandingValue = purchaseOrders.reduce(
      (sum, po) =>
        sum +
        (po.purchase_order_items ?? []).reduce((itemSum: number, item: any) => {
          const outstanding = Math.max(Number(item.qty || 0) - Number(item.received_qty || 0), 0);
          return itemSum + outstanding * Number(item.price || 0);
        }, 0),
      0,
    );

    return {
      draftCount,
      approvedCount,
      outstandingQty,
      outstandingValue,
    };
  }, [purchaseOrders]);

  return (
    // PERUBAHAN: Memperkecil jarak vertikal halaman dari space-y-6 menjadi space-y-4
    <div className="space-y-4">
      <PageHeader title="Purchase Orders" description="Manage purchase orders" />

      {/* SUMMARY - Menggunakan komponen Card yang sudah compact */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Draft PO</CardTitle>
            <CardDescription>{summary.draftCount}</CardDescription>
          </CardHeader>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Approved PO</CardTitle>
            <CardDescription>{summary.approvedCount}</CardDescription>
          </CardHeader>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Outstanding Qty</CardTitle>
            <CardDescription>{summary.outstandingQty}</CardDescription>
          </CardHeader>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Outstanding Value</CardTitle>
            <CardDescription>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(summary.outstandingValue)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* STATUS TAB - Dibuat h-8 agar kompak dan teks-nya text-xs/sm */}
      <div className="flex flex-wrap gap-1.5">
        {["all", "draft", "approved", "closed", "cancelled"].map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`rounded-md px-3 h-8 text-xs font-semibold uppercase tracking-wide transition border
              ${status === item ? "bg-slate-900 text-white border-transparent shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            {item} ({item === "all" ? purchaseOrders.length : purchaseOrders.filter((po) => po.status === item.toUpperCase()).length})
          </button>
        ))}
      </div>

      {/* FILTER - Menyelaraskan baris input pencarian, tanggal, dan tombol-tombol aksi */}
      <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search PO Number / Supplier..." />
          </div>

          {/* Sisi input tanggal kustom */}
          <div className="flex items-center gap-2">
            <FormInput label="From Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <FormInput label="To Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            {/* Menggunakan PrimaryButton variant outline dengan size default sm */}
            <PrimaryButton variant="outline" onClick={() => exportPurchaseOrdersPdf(filteredPurchaseOrders)}>
              Export PDF
            </PrimaryButton>

            {/* Menggunakan PrimaryButton variant primary dengan size default sm */}
            <PrimaryButton onClick={() => navigate("/purchasing/purchase-orders/create")}>Tambah PO</PrimaryButton>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {loading ? <Loading /> : filteredPurchaseOrders.length === 0 ? <EmptyState title="No Purchase Orders" description="Create your first Purchase Order." /> : <PurchaseOrderTable purchaseOrders={filteredPurchaseOrders} />}
      </div>

      <Modal open={open} title="Create Purchase Order" onClose={() => setOpen(false)}>
        <PurchaseOrderForm onSuccess={loadPurchaseOrders} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
