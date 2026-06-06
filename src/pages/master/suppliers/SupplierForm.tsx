import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/forms/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { createSupplier, updateSupplier } from "@/services/supplier.service";

import { supplierSchema, type SupplierFormValues } from "./supplier.schema";

interface SupplierFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  supplier?: any;
}

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function SupplierForm({ onClose, onSuccess, supplier }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name ?? "",
        contact_person: supplier.contact_person ?? "",
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        address: supplier.address ?? "",
      });
    } else {
      reset({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      if (supplier?.id) {
        await updateSupplier(COMPANY_ID, supplier.id, data);
      } else {
        await createSupplier(COMPANY_ID, data);
      }

      reset();

      onSuccess?.();

      onClose?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Supplier Name" {...register("name")} error={errors.name?.message} />

        <FormInput label="Contact Person" {...register("contact_person")} />

        <FormInput label="Phone" {...register("phone")} />

        <FormInput label="Email" {...register("email")} error={errors.email?.message} />

        <div className="md:col-span-2">
          <FormInput label="Address" {...register("address")} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
          Cancel
        </button>

        <PrimaryButton type="submit">{supplier ? "Update" : "Save"}</PrimaryButton>
      </div>
    </form>
  );
}
