import { useEffect, useState } from "react";
import PageHeader from "@/components/cards/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCompanyStore } from "@/stores/companyStore";
import { getProductionOrders } from "@/services/production-order.service";
import { useNavigate } from "react-router-dom";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Loading from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";

export default function ProductionOrdersPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":
        return "default";
      case "draft":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const fetchData = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const result = await getProductionOrders(companyId);
      console.log(JSON.stringify(result, null, 2));
      setData(result ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  return (
    <>
      <PageHeader title="Production Orders" description="Manage production orders" />

      <div className="mb-4 flex justify-end">
        <PrimaryButton onClick={() => navigate("/production/orders/create")}>Create Production Order</PrimaryButton>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Planned Qty</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No production orders found
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => navigate(`/production/orders/${row.id}`)}>
                <TableCell>{row.order_number}</TableCell>
                <TableCell>{row.order_date}</TableCell>
                <TableCell>{row.product?.name ?? "-"}</TableCell>

                <TableCell>{Number(row.planned_output_qty || 0).toFixed(2)}</TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
