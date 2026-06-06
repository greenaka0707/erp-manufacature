import DataTable from "@/components/tables/DataTable";

interface Salesperson {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

interface SalespersonTableProps {
  salespersons: Salesperson[];
  onEdit?: (salesperson: Salesperson) => void;
  onDelete?: (salesperson: Salesperson) => void;
}

export default function SalespersonTable({ salespersons, onEdit, onDelete }: SalespersonTableProps) {
  return (
    <DataTable
      data={salespersons}
      columns={[
        {
          key: "code",
          label: "Code",
        },
        {
          key: "name",
          label: "Name",
        },
        {
          key: "phone",
          label: "Phone",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "is_active",
          label: "Status",
          render: (row) => (row.is_active ? "Active" : "Inactive"),
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
