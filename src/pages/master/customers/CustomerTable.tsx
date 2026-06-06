import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/tables/DataTable";

interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  is_active?: boolean;
}

interface CustomerTableProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export default function CustomerTable({ customers, onEdit, onDelete }: CustomerTableProps) {
  return (
    <DataTable
      data={customers}
      columns={[
        {
          key: "code",
          label: "Code",
        },
        {
          key: "name",
          label: "Customer Name",
        },
        {
          key: "phone",
          label: "Phone",
        },
        {
          key: "is_active",
          label: "Status",
          render: (row) => <Badge variant={row.is_active ? "default" : "secondary"}>{row.is_active ? "Active" : "Inactive"}</Badge>,
        },
        {
          key: "action",
          label: "Action",
          render: (row) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>
                Edit
              </Button>

              <Button size="sm" variant="destructive" onClick={() => onDelete?.(row)}>
                Delete
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
