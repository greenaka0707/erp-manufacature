import { Link } from "react-router-dom";

export default function ReceivingTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left">Receiving No</th>

            <th className="p-4 text-left">Date</th>

            <th className="p-4 text-left">PO Number</th>

            <th className="p-4 text-left">Supplier</th>

            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b">
              <td className="p-4">
                <Link to={`/purchasing/receivings/${row.id}`} className="font-medium hover:underline">
                  {row.receiving_number}
                </Link>
              </td>

              <td className="p-4">{row.receiving_date}</td>

              <td className="p-4">{row.purchase_orders?.po_number}</td>

              <td className="p-4">{row.purchase_orders?.suppliers?.name}</td>

              <td className="p-4">
                <span className="rounded-full border px-2 py-1 text-xs">{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
