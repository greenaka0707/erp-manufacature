import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "@/components/forms/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { createSalesperson, updateSalesperson } from "@/services/salesperson.service";

import { salespersonSchema, type SalespersonFormValues } from "./salesperson.schema";

interface SalespersonFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  salesperson?: any;
}

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function SalespersonForm({ onClose, onSuccess, salesperson }: SalespersonFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalespersonFormValues>({
    resolver: zodResolver(salespersonSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (salesperson) {
      reset({
        name: salesperson.name ?? "",
        phone: salesperson.phone ?? "",
        email: salesperson.email ?? "",
        address: salesperson.address ?? "",
      });
    }
  }, [salesperson, reset]);

  const onSubmit = async (data: SalespersonFormValues) => {
    console.log("FORM DATA =>", data);

    try {
      if (salesperson?.id) {
        await updateSalesperson(COMPANY_ID, salesperson.id, data);
      } else {
        await createSalesperson(COMPANY_ID, data);
      }

      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("FAILED SAVE =>", error);

      alert(error?.message || error?.error_description || JSON.stringify(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Name" {...register("name")} error={errors.name?.message} />

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

        <PrimaryButton type="submit">{salesperson ? "Update" : "Save"}</PrimaryButton>
      </div>
    </form>
  );
}
