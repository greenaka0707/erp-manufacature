import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "@/components/cards/PageHeader";
import Loading from "@/components/ui/loading";

import { useCompanyStore } from "@/stores/companyStore";

import { getCustomers } from "@/services/customer.service";
import { getActiveProducts } from "@/services/product.service";

import { createSalesOrder, type SalesOrderItemPayload } from "@/services/sales-order.service";
import { getSalespersons } from "@/services/salesperson.service";

import FormSearchSelect from "@/components/forms/FormSearchSelect";

export default function SalesOrderFormPage() {
  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  const [salespersons, setSalespersons] = useState<any[]>([]);
  const [salespersonId, setSalespersonId] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<SalesOrderItemPayload[]>([
    {
      product_id: "",
      qty: 1,
      selling_price: 0,
    },
  ]);

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  async function loadData() {
    try {
      if (!companyId) return;

      setLoading(true);

      const [customerData, productData, salespersonData] = await Promise.all([getCustomers(companyId), getActiveProducts(companyId), getSalespersons(companyId)]);

      setCustomers(customerData || []);
      setProducts(productData || []);
      setSalespersons(salespersonData || []);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems([
      ...items,
      {
        product_id: "",
        qty: 1,
        selling_price: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const copy = [...items];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setItems(copy);
  }

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + item.qty * item.selling_price;
    }, 0);
  }, [items]);

  const grandTotal = subtotal;

  async function handleSave() {
    try {
      if (!companyId) return;

      if (!customerId) {
        alert("Customer wajib dipilih");
        return;
      }

      if (!salespersonId) {
        alert("Sales Person wajib dipilih");
        return;
      }

      if (items.some((x) => !x.product_id || Number(x.qty) <= 0 || Number(x.selling_price) <= 0)) {
        alert("Item belum lengkap");
        return;
      }
      setSaving(true);

      await createSalesOrder(companyId, {
        customer_id: customerId,
        salesperson_id: salespersonId,
        order_date: orderDate,
        notes,
        items,
      });

      navigate("/sales/orders");
    } catch (error) {
      console.error(error);

      alert("Gagal membuat Sales Order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Sales Order" description="Create customer sales order" />

      <div className="space-y-4">
        {/* ORDER INFO */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold">Order Information</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm">Order Date</label>

              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="mb-1 block text-sm">Customer</label>

              <FormSearchSelect
                value={customerId}
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                onChange={(value) => setCustomerId(value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Sales Person</label>

              <FormSearchSelect
                value={salespersonId}
                options={salespersons.map((sales) => ({
                  value: sales.id,
                  label: sales.name,
                }))}
                onChange={(value) => setSalespersonId(value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm">Notes</label>

            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>

        {/* ITEMS */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Order Items</h3>

            <button type="button" onClick={addItem} className="rounded-lg bg-black px-3 py-2 text-white">
              Add Item
            </button>
          </div>

          <div className="overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Product</th>
                  <th className="w-24 p-2 text-center">Qty</th>
                  <th className="w-36 p-2 text-center">Price</th>
                  <th className="w-40 p-2 text-right">Total</th>
                  <th className="w-16 p-2"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <FormSearchSelect
                        value={item.product_id}
                        options={products.map((product) => ({
                          value: product.id,
                          label: product.name,
                        }))}
                        onChange={(value) => updateItem(index, "product_id", value)}
                      />
                    </td>

                    <td className="p-2">
                      <input type="number" value={item.qty} onChange={(e) => updateItem(index, "qty", Number(e.target.value))} className="w-full rounded border px-2 py-1 text-center" />
                    </td>

                    <td className="p-2">
                      <input type="number" value={item.selling_price} onChange={(e) => updateItem(index, "selling_price", Number(e.target.value))} className="w-full rounded border px-2 py-1 text-right" />
                    </td>

                    <td className="p-2 text-right font-medium">Rp {(item.qty * item.selling_price).toLocaleString("id-ID")}</td>

                    <td className="p-2 text-center">
                      <button type="button" disabled={items.length === 1} onClick={() => removeItem(index)} className="text-red-600 disabled:text-gray-300">
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY + ACTION */}
          <div className="mt-6 flex justify-end">
            <div className="w-80">
              <div className="space-y-2 text-right">
                <p>
                  Subtotal :<strong className="ml-2">Rp {subtotal.toLocaleString("id-ID")}</strong>
                </p>

                <p className="text-2xl font-bold">
                  Total :<span className="ml-2">Rp {grandTotal.toLocaleString("id-ID")}</span>
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => navigate("/sales/orders")} className="rounded-lg border px-4 py-2">
                  Cancel
                </button>

                <button type="button" disabled={saving} onClick={handleSave} className="rounded-lg bg-black px-4 py-2 text-white">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
