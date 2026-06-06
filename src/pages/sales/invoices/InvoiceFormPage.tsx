import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getDeliveryOrdersForInvoice, createInvoice, type CreateInvoiceItem } from "@/services/invoice.service";

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
  const [selectedDO, setSelectedDO] = useState<{
    id: string;
    do_number: string;
    customer_id: string;
    customers: { id: string; name: string };
    delivery_order_items: DeliveryOrderItem[];
  } | null>(null);

  const [invoiceDate, setInvoiceDate] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    loadDeliveryOrders();
  }, [companyId]);

  // Tambahkan interface untuk tipe item DO
  interface DeliveryOrderItem {
    id: string;
    sales_order_item_id: string;
    product_id: string;
    qty_delivered: number;

    sales_order_item?: {
      id: string;
      qty: number;
      invoiced_qty: number;
      selling_price: number;
    };
  }

  async function loadDeliveryOrders() {
    try {
      setLoading(true);
      const data = await getDeliveryOrdersForInvoice(companyId!);
      setDeliveryOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Hitung subtotal dan grand total dengan tipe
  const invoiceSummary = selectedDO
    ? selectedDO.delivery_order_items?.reduce(
        (acc: { totalItems: number; subtotal: number }, item: any) => {
          const price = Number(item.sales_order_item?.selling_price || 0);

          acc.totalItems += Number(item.qty_delivered);
          acc.subtotal += Number(item.qty_delivered) * price;

          return acc;
        },
        {
          totalItems: 0,
          subtotal: 0,
        },
      )
    : {
        totalItems: 0,
        subtotal: 0,
      };

  const grandTotal = invoiceSummary.subtotal + shippingCost;

  const handleSave = async () => {
    if (!companyId) return;
    if (!selectedDO) return alert("Pilih Delivery Order");
    if (!invoiceDate) return alert("Invoice Date wajib diisi");

    // Map item untuk payload dengan tipe

    const items: CreateInvoiceItem[] =
      selectedDO?.delivery_order_items.map((item: DeliveryOrderItem) => ({
        salesOrderItemId: item.sales_order_item_id,
        productId: item.product_id,
        qty: Number(item.qty_delivered),
        unitPrice: Number(item.sales_order_item?.selling_price || 0), // <-- gunakan selling_price
      })) || [];

    if (items.length === 0) return alert("Delivery Order tidak memiliki item");

    setSaving(true);
    try {
      const payload = {
        companyId,
        deliveryOrderId: selectedDO.id,
        customerId: selectedDO.customer_id,
        invoiceDate,
        items,
        notes,
        shippingCost,
      };

      console.log("CREATE INVOICE PAYLOAD", payload);

      const invoice = await createInvoice(payload);
      navigate(`/sales/invoices/${invoice.id}`);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate("/sales/invoices")} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
          Back
        </button>
      </div>
      <PageHeader title="Create Invoice" description="Create new sales invoice" />

      <div className="rounded-xl border bg-white p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Delivery Order */}
          <div>
            <label className="mb-1 block text-sm font-medium">Delivery Order</label>
            <select
              value={selectedDO?.id || ""}
              className="w-full rounded-lg border p-2"
              onChange={(e) => {
                const deliveryOrder = deliveryOrders.find((x) => x.id === e.target.value);
                setSelectedDO(deliveryOrder || null);
              }}
            >
              <option value="">Select Delivery Order</option>
              {deliveryOrders.map((deliveryOrder) => (
                <option key={deliveryOrder.id} value={deliveryOrder.id}>
                  {deliveryOrder.do_number} - {deliveryOrder.customers?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border p-2" />
          </div>

          {/* Customer */}
          <div>
            <label className="mb-1 block text-sm font-medium">Customer</label>
            <input disabled value={selectedDO?.customers?.name || ""} className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <input disabled value="DRAFT" className="w-full rounded-lg border bg-gray-100 p-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Shipping Cost</label>

            <input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value) || 0)} className="w-full rounded-lg border p-2" />
          </div>
        </div>

        {/* DO Summary */}
        {selectedDO && (
          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <h3 className="mb-4 font-semibold">Delivery Order Summary</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">DO Number</p>
                <p>{selectedDO.do_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p>{selectedDO.customers?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p>{invoiceSummary.totalItems}</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Summary */}
        {selectedDO && (
          <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <h3 className="mb-4 font-semibold">Invoice Summary</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p>{invoiceSummary.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p>Rp {invoiceSummary.subtotal.toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipping Cost</p>

                <p>Rp {shippingCost.toLocaleString("id-ID")}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Grand Total</p>

                <p className="font-semibold">Rp {grandTotal.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50">
            {saving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
