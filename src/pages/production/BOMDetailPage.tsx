import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBOMById } from "@/services/bom.service";
import { Button } from "@/components/ui/button";

export default function BOMDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBOM] = useState<any>(null);

  useEffect(() => {
    if (id) fetchBOM(id);
  }, [id]);

  async function fetchBOM(bomId: string) {
    const data = await getBOMById(bomId);
    setBOM(data);
  }

  if (!bom) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">BOM Detail</h1>

      <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl border">
        <div>
          <p className="text-sm text-muted-foreground">Code</p>
          <p className="font-medium">{bom.bom_code}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Product</p>
          <p className="font-medium">{bom.product?.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Version</p>
          <p className="font-medium">{bom.version}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium">{bom.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b font-semibold">Materials</div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-left">Qty</th>
            </tr>
          </thead>
          <tbody>
            {bom.items.map((item: any) => (
              <tr key={item.id}>
                <td className="p-3">{item.material?.name}</td>
                <td className="p-3">{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" onClick={() => navigate("/production/bom")}>
        Back
      </Button>
    </div>
  );
}
