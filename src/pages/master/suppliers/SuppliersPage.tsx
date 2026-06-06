import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Modal from "@/components/dialogs/Modal";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";

import SearchInput from "@/components/forms/SearchInput";
import StatusFilter from "@/components/forms/StatusFilter";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

import { getSuppliers, deleteSupplier } from "@/services/supplier.service";

import SupplierForm from "./SupplierForm";
import SupplierTable from "./SupplierTable";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function SuppliersPage() {
  const [open, setOpen] = useState(false);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setLoading(true);

      const data = await getSuppliers(COMPANY_ID);

      setSuppliers(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddSupplier() {
    setSelectedSupplier(null);
    setOpen(true);
  }

  function handleEdit(supplier: any) {
    setSelectedSupplier(supplier);
    setOpen(true);
  }

  function handleDelete(supplier: any) {
    setSupplierToDelete(supplier);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    try {
      if (!supplierToDelete) return;

      await deleteSupplier(COMPANY_ID, supplierToDelete.id);

      await loadSuppliers();

      setDeleteOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchSearch =
        supplier.name?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.code?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(search.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = status === "all" ? true : status === "active" ? supplier.is_active : !supplier.is_active;

      return matchSearch && matchStatus;
    });
  }, [suppliers, search, status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="Manage supplier master data" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder="Search supplier..." />

          <StatusFilter value={status} onChange={setStatus} options={["all", "active", "inactive"]} />
        </div>

        <PrimaryButton onClick={handleAddSupplier}>Add Supplier</PrimaryButton>
      </div>

      {loading ? (
        <Loading />
      ) : filteredSuppliers.length === 0 ? (
        <EmptyState title="No Suppliers Found" description="Try changing your search criteria." />
      ) : (
        <SupplierTable suppliers={filteredSuppliers} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal
        open={open}
        title={selectedSupplier ? "Edit Supplier" : "Add Supplier"}
        onClose={() => {
          setOpen(false);
          setSelectedSupplier(null);
        }}
      >
        <SupplierForm
          supplier={selectedSupplier}
          onSuccess={loadSuppliers}
          onClose={() => {
            setOpen(false);
            setSelectedSupplier(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Supplier"
        message={`Delete ${supplierToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setSupplierToDelete(null);
        }}
      />
    </div>
  );
}
