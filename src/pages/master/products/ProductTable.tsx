import DataTable from "@/components/tables/DataTable";

interface Product {
  id: string;
  sku: string;
  name: string;
  minimum_stock?: number;

  units?: {
    code: string;
    name: string;
  };

  product_categories?: {
    id: string;
    code: string;
    name: string;
  };

  is_active?: boolean;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <DataTable
      data={products}
      columns={[
        {
          key: "sku",
          label: "SKU",
        },
        {
          key: "name",
          label: "Product Name",
        },
        {
          key: "category",
          label: "Category",
          render: (row) => row.product_categories?.name ?? "-",
        },
        {
          key: "unit",
          label: "Unit",
          render: (row) => row.units?.code ?? "-",
        },
        {
          key: "minimum_stock",
          label: "Min Stock",
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
