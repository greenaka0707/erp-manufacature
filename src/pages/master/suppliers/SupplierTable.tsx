import DataTable from "@/components/tables/DataTable";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  is_active?: boolean;
}

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
}

export default function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  return (
    <DataTable
      data={suppliers}
      columns={[
        {
          key: "code",
          label: "Code",
        },
        {
          key: "name",
          label: "Supplier Name",
        },
        {
          key: "contact_person",
          label: "Contact Person",
        },
        {
          key: "phone",
          label: "Phone",
        },
        {
          key: "is_active",
          label: "Status",
          render: (row) => <span className={`rounded-full px-3 py-1 text-xs font-medium ${row.is_active ? "bg-black text-white" : "bg-red-100 text-red-600"}`}>{row.is_active ? "Active" : "Inactive"}</span>,
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <div className="flex gap-2">
              <button onClick={() => onEdit?.(row)} className="text-blue-600">
                Edit
              </button>

              <button onClick={() => onDelete?.(row)} className="text-red-600">
                Delete
              </button>
            </div>
          ),
        },
      ]}
    />
  );
}
