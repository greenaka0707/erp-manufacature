import { useEffect, useState } from "react";

import PageHeader from "@/components/cards/PageHeader";
import Modal from "@/components/dialogs/Modal";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";

import { Button } from "@/components/ui/button";

import { getSalespersons, deleteSalesperson } from "@/services/salesperson.service";

import SalespersonForm from "./SalespersonForm";
import SalespersonTable from "./SalespersonTable";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export default function SalespersonsPage() {
  const [open, setOpen] = useState(false);

  const [salespersons, setSalespersons] = useState<any[]>([]);

  const [selectedSalesperson, setSelectedSalesperson] = useState<any>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [salespersonToDelete, setSalespersonToDelete] = useState<any>(null);

  useEffect(() => {
    loadSalespersons();
  }, []);

  async function loadSalespersons() {
    try {
      const data = await getSalespersons(COMPANY_ID);

      setSalespersons(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  function handleAdd() {
    setSelectedSalesperson(null);
    setOpen(true);
  }

  function handleEdit(salesperson: any) {
    setSelectedSalesperson(salesperson);

    setOpen(true);
  }

  function handleDelete(salesperson: any) {
    setSalespersonToDelete(salesperson);

    setDeleteOpen(true);
  }

  async function confirmDelete() {
    try {
      if (!salespersonToDelete) return;

      await deleteSalesperson(COMPANY_ID, salespersonToDelete.id);

      await loadSalespersons();

      setDeleteOpen(false);
      setSalespersonToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Salespersons" description="Manage salesperson master data" action={<Button onClick={handleAdd}>Add Salesperson</Button>} />

      <SalespersonTable salespersons={salespersons} onEdit={handleEdit} onDelete={handleDelete} />

      <Modal
        open={open}
        title={selectedSalesperson ? "Edit Salesperson" : "Add Salesperson"}
        onClose={() => {
          setOpen(false);
          setSelectedSalesperson(null);
        }}
      >
        <SalespersonForm
          salesperson={selectedSalesperson}
          onSuccess={loadSalespersons}
          onClose={() => {
            setOpen(false);
            setSelectedSalesperson(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Salesperson"
        message={`Delete ${salespersonToDelete?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteOpen(false);
          setSalespersonToDelete(null);
        }}
      />
    </div>
  );
}
