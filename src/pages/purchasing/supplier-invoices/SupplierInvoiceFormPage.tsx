import PageHeader from "@/components/cards/PageHeader";
import { useEffect, useState } from "react";

import { useCompanyStore } from "@/stores/companyStore";

import { useNavigate } from "react-router-dom";

import { getPurchaseOrdersForInvoice, createSupplierInvoice } from "@/services/supplier-invoice.service";

export default function SupplierInvoiceFormPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const [selectedPO, setSelectedPO] = useState<any>(null);

  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadPurchaseOrders();
    }
  }, [companyId]);

  async function loadPurchaseOrders() {
    try {
      if (!companyId) return;

      const data = await getPurchaseOrdersForInvoice(companyId);

      setPurchaseOrders(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSave() {
    try {
      if (!companyId) return;

      if (!selectedPO) {
        alert("Pilih Purchase Order");
        return;
      }

      if (!invoiceDate) {
        alert("Invoice Date wajib diisi");
        return;
      }

      if (!dueDate) {
        alert("Due Date wajib diisi");
        return;
      }

      // VALIDASI TANGGAL
      if (new Date(dueDate) < new Date(invoiceDate)) {
        alert("Due Date tidak boleh lebih kecil dari Invoice Date");
        return;
      }
      setSaving(true);

      console.log({
        invoiceDate,
        dueDate,
      });

      const payload = {
        company_id: companyId,
        supplier_id: selectedPO.supplier_id,
        purchase_order_id: selectedPO.id,
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal: poTotal,
        tax_amount: 0,
        grand_total: poTotal,
      };

      console.log("INSERT PAYLOAD", payload);

      const invoice = await createSupplierInvoice(payload);

      navigate(`/purchasing/supplier-invoices/${invoice.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan invoice");
    } finally {
      setSaving(false);
    }
  }

  const poTotal = selectedPO?.purchase_order_items?.reduce((sum: number, item: any) => sum + Number(item.total || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Create Supplier Invoice" description="Create supplier invoice" />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase Order</label>

            <select
              className="w-full rounded-lg border p-2"
              onChange={(e) => {
                const po = purchaseOrders.find((x) => x.id === e.target.value);

                setSelectedPO(po);
              }}
            >
              <option value="">Select Purchase Order</option>

              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Supplier</label>

            <input disabled value={selectedPO?.suppliers?.name || ""} className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Invoice Date</label>

            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Due Date</label>

            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>

            <input disabled value="UNPAID" className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>
        </div>

        {selectedPO && (
          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <h3 className="mb-4 font-semibold">Purchase Order Summary</h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">PO Number</p>

                <p>{selectedPO.po_number}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>

                <p>{selectedPO.suppliers?.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Total PO</p>

                <p>Rp {poTotal.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2">Cancel</button>

          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
