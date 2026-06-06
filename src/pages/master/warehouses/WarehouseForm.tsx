import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/forms/FormInput";
import FormSelect from "@/components/forms/FormSelect";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { createWarehouse, updateWarehouse } from "@/services/warehouse.service";

import { warehouseSchema, type WarehouseFormValues } from "./warehouse.schema";

interface WarehouseFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  warehouse?: any;
}

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function WarehouseForm({ onClose, onSuccess, warehouse }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      warehouse_type: "GENERAL",
      is_default: false,
      allow_negative_stock: false,
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code ?? "",
        name: warehouse.name ?? "",
        description: warehouse.description ?? "",
        warehouse_type: warehouse.warehouse_type ?? "GENERAL",
        is_default: warehouse.is_default ?? false,
        allow_negative_stock: warehouse.allow_negative_stock ?? false,
      });
    }
  }, [warehouse, reset]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      if (warehouse?.id) {
        await updateWarehouse(COMPANY_ID, warehouse.id, data);
      } else {
        await createWarehouse(COMPANY_ID, data);
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Warehouse Code" {...register("code")} error={errors.code?.message} />

        <FormInput label="Warehouse Name" {...register("name")} error={errors.name?.message} />

        <FormSelect
          label="Warehouse Type"
          value={watch("warehouse_type")}
          onChange={(e) => setValue("warehouse_type", e.target.value as any)}
          options={[
            {
              label: "General",
              value: "GENERAL",
            },
            {
              label: "Green Bean Warehouse",
              value: "GREEN_BEAN",
            },
            {
              label: "Production",
              value: "PRODUCTION",
            },
            {
              label: "Finished Goods",
              value: "FINISHED_GOODS",
            },
            {
              label: "Reject",
              value: "REJECT",
            },
          ]}
        />

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("is_default")} />

          <label>Default Warehouse</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("allow_negative_stock")} />

          <label>Allow Negative Stock</label>
        </div>

        <div className="md:col-span-2">
          <FormInput label="Description" {...register("description")} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
          Cancel
        </button>

        <PrimaryButton type="submit">{warehouse ? "Update" : "Save"}</PrimaryButton>
      </div>
    </form>
  );
}
