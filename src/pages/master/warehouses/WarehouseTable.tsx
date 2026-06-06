import DataTable from "@/components/tables/DataTable";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  warehouse_type?: string;
  is_default?: boolean;
  is_active?: boolean;
}

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit?: (warehouse: Warehouse) => void;

  onDelete?: (warehouse: Warehouse) => void;
}

export default function WarehouseTable({ warehouses, onEdit, onDelete }: WarehouseTableProps) {
  return (
    <DataTable
      data={warehouses}
      columns={[
        {
          key: "code",
          label: "Code",
        },
        {
          key: "name",
          label: "Warehouse Name",
        },
        {
          key: "warehouse_type",
          label: "Type",
        },
        {
          key: "is_default",
          label: "Default",
          render: (row) => (row.is_default ? "Yes" : "No"),
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
