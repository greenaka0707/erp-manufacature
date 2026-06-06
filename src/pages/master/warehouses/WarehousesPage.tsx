import { useEffect, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Modal from "@/components/dialogs/Modal";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";

import PrimaryButton from "@/components/ui/PrimaryButton";

import { getWarehouses, deleteWarehouse } from "@/services/warehouse.service";

import WarehouseForm from "./WarehouseForm";
import WarehouseTable from "./WarehouseTable";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function WarehousesPage() {
  const [open, setOpen] = useState(false);

  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [warehouseToDelete, setWarehouseToDelete] = useState<any>(null);

  useEffect(() => {
    loadWarehouses();
  }, []);

  async function loadWarehouses() {
    try {
      const data = await getWarehouses(COMPANY_ID);

      setWarehouses(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  function handleEdit(warehouse: any) {
    setSelectedWarehouse(warehouse);

    setOpen(true);
  }

  function handleDelete(warehouse: any) {
    setWarehouseToDelete(warehouse);

    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!warehouseToDelete) return;

    await deleteWarehouse(COMPANY_ID, warehouseToDelete.id);

    await loadWarehouses();

    setDeleteOpen(false);
    setWarehouseToDelete(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Warehouses" description="Manage warehouse master data" />

      <div className="flex justify-end">
        <PrimaryButton onClick={() => setOpen(true)}>Add Warehouse</PrimaryButton>
      </div>

      <WarehouseTable warehouses={warehouses} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal
        open={open}
        title={selectedWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        onClose={() => {
          setOpen(false);
          setSelectedWarehouse(null);
        }}
      >
        <WarehouseForm
          warehouse={selectedWarehouse}
          onSuccess={loadWarehouses}
          onClose={() => {
            setOpen(false);
            setSelectedWarehouse(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Warehouse"
        message={`Delete ${warehouseToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setWarehouseToDelete(null);
        }}
      />
    </div>
  );
}
