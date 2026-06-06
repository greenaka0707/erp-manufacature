import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/forms/FormInput";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { createCustomer, updateCustomer } from "@/services/customer.service";
import { customerSchema, type CustomerFormValues } from "./customer.schema";
interface CustomerFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  customer?: any;
}
const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";
export default function CustomerForm({ onClose, onSuccess, customer }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema), defaultValues: { name: "", phone: "", email: "", address: "" } });
  useEffect(() => {
    if (customer) {
      reset({ name: customer.name ?? "", phone: customer.phone ?? "", email: customer.email ?? "", address: customer.address ?? "" });
    } else {
      reset({ name: "", phone: "", email: "", address: "" });
    }
  }, [customer, reset]);
  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (customer?.id) {
        const updatedCustomer = await updateCustomer(COMPANY_ID, customer.id, data);
        console.log("Customer updated", updatedCustomer);
      } else {
        const newCustomer = await createCustomer(COMPANY_ID, data);
        console.log("Customer saved", newCustomer);
      }
      reset();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Failed save customer", error);
      alert("Failed to save customer.");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {" "}
      <div className="grid gap-4 md:grid-cols-2">
        {" "}
        <FormInput label="Customer Name" {...register("name")} error={errors.name?.message} /> <FormInput label="Phone" {...register("phone")} /> <FormInput label="Email" {...register("email")} error={errors.email?.message} />{" "}
        <div className="md:col-span-2">
          {" "}
          <FormInput label="Address" {...register("address")} />{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex justify-end gap-2">
        {" "}
        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
          {" "}
          Cancel{" "}
        </button>{" "}
        <PrimaryButton type="submit"> {customer ? "Update" : "Save"} </PrimaryButton>{" "}
      </div>{" "}
    </form>
  );
}
