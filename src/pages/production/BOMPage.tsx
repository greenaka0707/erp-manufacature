import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getBOMs } from "@/services/bom.service";
import type { BOM } from "@/services/bom.service";

import { useCompanyStore } from "@/stores/companyStore";

export default function BOMPage() {
  const navigate = useNavigate();
  const [boms, setBoms] = useState<BOM[]>([]);
  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  useEffect(() => {
    if (!companyId) return; // jangan fetch kalau belum ada companyId
    fetchBOMs();
  }, [companyId]);

  async function fetchBOMs() {
    if (!companyId) return; // tambahkan cek supaya tidak null
    const data = await getBOMs(companyId);
    setBoms(data);
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Bill Of Material</h1>
        <Button onClick={() => navigate("/production/bom/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create BOM
        </Button>
      </div>

      <table className="w-full border rounded-lg">
        <thead>
          <tr className="bg-muted/40 border-b">
            <th className="p-3 text-left">Code</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Version</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {boms.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No BOM Found
              </td>
            </tr>
          ) : (
            boms.map((bom) => (
              <tr key={bom.id} className="border-b hover:bg-muted/20">
                <td className="p-3">{bom.bom_code}</td>
                <td className="p-3">{bom.product?.name}</td>
                <td className="p-3">{bom.version}</td>
                <td className="p-3">{bom.status}</td>
                <td className="p-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/production/bom/${bom.id}`)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/production/bom/${bom.id}/edit`)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (confirm("Delete BOM?")) {
                        await import("@/services/bom.service").then((svc) => svc.deleteBOM(bom.id));
                        fetchBOMs();
                      }
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
