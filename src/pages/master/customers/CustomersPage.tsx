import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Modal from "@/components/dialogs/Modal";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";

import SearchInput from "@/components/forms/SearchInput";
import StatusFilter from "@/components/forms/StatusFilter";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { getCustomers, deleteCustomer } from "@/services/customer.service";

import CustomerForm from "./CustomerForm";
import CustomerTable from "./CustomerTable";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function CustomersPage() {
  const [open, setOpen] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);

      const data = await getCustomers(COMPANY_ID);

      setCustomers(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddCustomer() {
    setSelectedCustomer(null);
    setOpen(true);
  }

  function handleEdit(customer: any) {
    setSelectedCustomer(customer);
    setOpen(true);
  }

  function handleDelete(customer: any) {
    setCustomerToDelete(customer);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    try {
      if (!customerToDelete) return;

      await deleteCustomer(COMPANY_ID, customerToDelete.id);

      await loadCustomers();

      setDeleteOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchSearch = customer.name?.toLowerCase().includes(search.toLowerCase()) || customer.code?.toLowerCase().includes(search.toLowerCase()) || customer.phone?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "all" ? true : status === "active" ? customer.is_active : !customer.is_active;

      return matchSearch && matchStatus;
    });
  }, [customers, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage customer master data" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search customer..." />

          <StatusFilter value={status} onChange={setStatus} options={["all", "active", "inactive"]} />
        </div>

        <PrimaryButton onClick={handleAddCustomer}>Add Customer</PrimaryButton>
      </div>

      {loading ? (
        <Loading />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState title="No Customers Found" description="Try changing your search criteria." />
      ) : (
        <CustomerTable customers={filteredCustomers} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal
        open={open}
        title={selectedCustomer ? "Edit Customer" : "Add Customer"}
        onClose={() => {
          setOpen(false);
          setSelectedCustomer(null);
        }}
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={loadCustomers}
          onClose={() => {
            setOpen(false);
            setSelectedCustomer(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Customer"
        message={`Delete ${customerToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
}
