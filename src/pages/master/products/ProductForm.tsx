import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { getActiveUnits } from "@/services/unit.service";
import { createProduct, updateProduct } from "@/services/product.service";
import { getCategories } from "@/services/category.service";

import { productSchema, type ProductFormValues } from "./product.schema";

interface ProductFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  product?: any;
}

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function ProductForm({ onClose, onSuccess, product }: ProductFormProps) {
  const [units, setUnits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category_id: "",
      unit_id: "",
      minimum_stock: 0,
      description: "",
    },
  });

  const categoryId = watch("category_id");
  const selectedCategory = categories.find((category) => category.id === categoryId);

  useEffect(() => {
    loadUnits();
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? "",
        category_id: product.category_id ?? "",
        unit_id: product.unit_id ?? "",
        minimum_stock: product.minimum_stock ?? 0,
        description: product.description ?? "",
      });
    } else {
      reset({
        name: "",
        category_id: "",
        unit_id: "",
        minimum_stock: 0,
        description: "",
      });
    }
  }, [product, reset]);

  async function loadCategories() {
    try {
      const data = await getCategories();

      setCategories(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadUnits() {
    try {
      const data = await getActiveUnits(COMPANY_ID);

      setUnits(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      console.log("FORM DATA =>", data);

      const payload = {
        ...data,
      };

      console.log("PRODUCT PAYLOAD =>", payload);

      if (product?.id) {
        const updated = await updateProduct(COMPANY_ID, product.id, payload);

        console.log("UPDATED PRODUCT =>", updated);
      } else {
        const created = await createProduct(COMPANY_ID, payload);

        console.log("CREATED PRODUCT =>", created);
      }

      await onSuccess?.();

      onClose?.();
    } catch (error) {
      console.error("Failed save product", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Product Name" {...register("name")} error={errors.name?.message} />

        <FormSelect
          label="Category"
          {...register("category_id")}
          error={errors.category_id?.message}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />

        <FormSelect
          label="Unit"
          {...register("unit_id")}
          error={errors.unit_id?.message}
          options={units.map((unit) => ({
            value: unit.id,
            label: `${unit.code} - ${unit.name}`,
          }))}
        />
        <FormInput
          type="number"
          label="Minimum Stock"
          {...register("minimum_stock", {
            valueAsNumber: true,
          })}
        />

        <div className="md:col-span-2">
          <FormInput label="Description" {...register("description")} />
        </div>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4 text-sm">
        <div>
          Category:
          <strong>{selectedCategory?.name ?? "-"}</strong>
        </div>

        <div className="mt-2 text-slate-600">Product settings akan otomatis mengikuti kategori yang dipilih.</div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
          Cancel
        </button>

        <PrimaryButton type="submit">{product ? "Update Product" : "Save Product"}</PrimaryButton>
      </div>
    </form>
  );
}
