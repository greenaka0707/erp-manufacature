import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, useFieldArray } from "react-hook-form";
import { getActiveProducts } from "@/services/product.service";

import FormInput from "@/components/forms/FormInput";
import FormSearchSelect from "@/components/forms/FormSearchSelect";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { getSuppliers } from "@/services/supplier.service";
import { createPurchaseOrder, getPurchaseOrderDetail, updatePurchaseOrder } from "@/services/purchase-order.service";

import { purchaseOrderSchema, type PurchaseOrderFormValues } from "./purchase-order.schema";

import { useCompanyStore } from "@/stores/companyStore";

interface PurchaseOrderFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PurchaseOrderForm(_props: PurchaseOrderFormProps) {
  const { id } = useParams();

  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      po_date: new Date().toISOString().split("T")[0],
      expected_date: "",
      notes: "",
      items: [
        {
          product_id: "",
          qty: 1,
          price: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    if (companyId) {
      loadSuppliers();
      loadProducts();
    }
  }, [companyId]);

  useEffect(() => {
    if (isEdit && id && companyId) {
      loadPurchaseOrder();
    }
  }, [id, companyId]);

  async function loadSuppliers() {
    try {
      if (!companyId) return;

      const data = await getSuppliers(companyId);
      setSuppliers(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadProducts() {
    try {
      if (!companyId) return;

      const data = await getActiveProducts(companyId);

      setProducts(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPurchaseOrder() {
    try {
      if (!companyId || !id) return;

      const po = await getPurchaseOrderDetail(companyId, id);

      setValue("supplier_id", po.supplier_id);

      setValue("po_date", po.po_date);

      setValue("expected_date", po.expected_date || "");

      setValue("notes", po.notes || "");

      setValue(
        "items",
        po.purchase_order_items.map((item: any) => ({
          product_id: item.product_id,
          qty: Number(item.qty),
          price: Number(item.price),
        })),
      );
    } catch (error) {
      console.error(error);
    }
  }

  const onSubmit = async (data: PurchaseOrderFormValues) => {
    if (!companyId) return;

    try {
      console.log("PO PAYLOAD =>", data);

      const payload = {
        ...data,
        expected_date: data.expected_date || undefined,
      };

      if (isEdit) {
        await updatePurchaseOrder(companyId, id!, payload);

        navigate(`/purchasing/purchase-orders/${id}`);
      } else {
        await createPurchaseOrder(companyId, payload);

        navigate("/purchasing/purchase-orders");
      }
    } catch (error: any) {
      console.error("PO ERROR =>", error);
      console.error("MESSAGE =>", error?.message);
      console.error("DETAILS =>", error?.details);
      console.error("HINT =>", error?.hint);
      console.error("CODE =>", error?.code);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSearchSelect
        label="Pemasok"
        value={watch("supplier_id")}
        options={suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.name,
        }))}
        onChange={(value) => setValue("supplier_id", value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="PO Date" type="date" {...register("po_date")} error={errors.po_date?.message?.toString()} />

        <FormInput label="Expected Date" type="date" {...register("expected_date")} />
      </div>

      <FormInput label="Notes" {...register("notes")} />

      {/* ITEMS */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Items</h3>

          <button
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() =>
              append({
                product_id: "",
                qty: 1,
                price: 0,
              })
            }
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-6">
                <FormSearchSelect
                  label="Produk"
                  value={watch(`items.${index}.product_id`)}
                  options={products.map((product) => ({
                    value: product.id,
                    label: product.name,
                  }))}
                  onChange={(value) => setValue(`items.${index}.product_id`, value)}
                />
              </div>

              <div className="md:col-span-2">
                <FormInput
                  type="number"
                  label="Qty"
                  {...register(`items.${index}.qty`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="md:col-span-3">
                <FormInput
                  type="number"
                  label="Price"
                  {...register(`items.${index}.price`, {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button type="button" className="w-full rounded border px-2 py-2 text-red-600" onClick={() => remove(index)}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => navigate("/purchasing/purchase-orders")} className="rounded-lg border px-4 py-2">
          Cancel
        </button>

        <PrimaryButton type="submit">{isEdit ? "Update PO" : "Save PO"}</PrimaryButton>
      </div>
    </form>
  );
}
