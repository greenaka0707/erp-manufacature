import { useNavigate } from "react-router-dom";

import DataTable from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrderTableProps {
  purchaseOrders: any[];
}

function getTotalQty(items: any[] = []) {
  return items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function getTotalAmount(items: any[] = []) {
  return items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
}

function getReceivedQty(items: any[] = []) {
  return items.reduce((sum, item) => sum + Number(item.received_qty || 0), 0);
}

export default function PurchaseOrderTable({ purchaseOrders }: PurchaseOrderTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      data={purchaseOrders}
      columns={[
        {
          key: "po_number",
          label: "PO Number",
          render: (row) => (
            <button className="font-medium text-blue-600 hover:underline" onClick={() => navigate(`/purchasing/purchase-orders/${row.id}`)}>
              {row.po_number}
            </button>
          ),
        },

        {
          key: "supplier",
          label: "Supplier",
          render: (row) => row.suppliers?.name ?? "-",
        },

        {
          key: "po_date",
          label: "PO Date",
        },

        {
          key: "qty",
          label: "Qty",
          render: (row) => `${getTotalQty(row.purchase_order_items)} Kg`,
        },

        {
          key: "amount",
          label: "Amount",
          render: (row) =>
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(getTotalAmount(row.purchase_order_items)),
        },

        {
          key: "received",
          label: "Received",
          render: (row) => `${getReceivedQty(row.purchase_order_items)} / ${getTotalQty(row.purchase_order_items)} Kg`,
        },

        {
          key: "status",
          label: "Status",
          render: (row) => {
            const variants: Record<string, string> = {
              DRAFT: "secondary",
              APPROVED: "default",
              RECEIVED: "default",
              CLOSED: "outline",
              CANCELLED: "destructive",
            };

            return <Badge variant={variants[row.status] as "default" | "secondary" | "destructive" | "outline"}>{row.status}</Badge>;
          },
        },
      ]}
    />
  );
}
