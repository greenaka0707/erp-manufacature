import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormSearchSelect from "@/components/forms/FormSearchSelect";

import { getBOMById, createBOM, updateBOM, getFinishedGoods, getBOMMaterials } from "@/services/bom.service";

import type { BOMPayload, BOMDetail } from "@/services/bom.service";

import { Button } from "@/components/ui/button";
import { useCompanyStore } from "@/stores/companyStore";

interface MaterialItem {
  material_id: string;
  qty: number;
}

interface ProductOption {
  id: string;
  name: string;
}

export default function BOMFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const companyId = useCompanyStore((state) => state.currentCompany?.id);

  const [saving, setSaving] = useState(false);

  const [productId, setProductId] = useState("");
  const [version, setVersion] = useState(1);
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<MaterialItem[]>([]);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [materials, setMaterials] = useState<ProductOption[]>([]);

  useEffect(() => {
    if (!companyId) return;

    loadMasterData();
  }, [companyId]);

  useEffect(() => {
    if (!materials.length) return;

    if (isEdit && id) {
      fetchBOM(id);
    }
  }, [id, isEdit, materials]);

  async function loadMasterData() {
    if (!companyId) return;

    const [finishedGoods, materialList] = await Promise.all([getFinishedGoods(companyId), getBOMMaterials(companyId)]);

    setProducts(finishedGoods); // <- ini mengambil semua tipe produk, perlu filter di service
    setMaterials(materialList);
  }

  async function fetchBOM(bomId: string) {
    const data: BOMDetail = await getBOMById(bomId);

    setProductId(data.product_id);
    setVersion(data.version);
    setStatus(data.status);
    setNotes(data.notes ?? "");

    setItems(
      (data.items ?? []).map((item) => ({
        material_id: item.material_id,
        qty: item.qty,
      })),
    );
  }

  function addMaterial() {
    setItems([
      ...items,
      {
        material_id: "",
        qty: 0,
      },
    ]);
  }

  function removeMaterial(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    try {
      if (!companyId) {
        alert("Company belum dipilih");
        return;
      }

      if (!productId) {
        alert("Pilih produk terlebih dahulu");
        return;
      }

      if (items.length === 0) {
        alert("Minimal 1 material");
        return;
      }

      if (items.some((item) => !item.material_id)) {
        alert("Semua material harus dipilih");
        return;
      }

      if (items.some((item) => item.qty < 0)) {
        alert("Qty tidak boleh negatif");
        return;
      }

      setSaving(true);

      const payload: BOMPayload = {
        product_id: productId,
        version,
        status,
        notes,
        items,
      };

      if (isEdit && id) {
        await updateBOM(id, payload);
      } else {
        await createBOM(companyId, payload);
      }

      navigate("/production/bom");
    } catch (error) {
      console.error("BOM ERROR =", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{isEdit ? "Edit BOM" : "Create BOM"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Product (Finished Good)</label>

          <FormSearchSelect value={productId} options={products.map((p) => ({ value: p.id, label: p.name }))} onChange={setProductId} />
        </div>

        <div>
          <label className="block mb-2">Version</label>

          <input type="number" min={1} step={1} value={version} onChange={(e) => setVersion(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block mb-2">Status</label>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Notes</label>

          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b font-semibold">Materials</div>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-3">
                  <FormSearchSelect
                    value={item.material_id}
                    options={materials.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                    onChange={(value) => {
                      const newItems = [...items];
                      newItems[idx].material_id = value;
                      setItems(newItems);
                    }}
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].qty = Number(e.target.value);
                      setItems(newItems);
                    }}
                    className="border rounded px-2 py-1 w-32"
                  />
                </td>

                <td className="p-3">
                  <Button size="sm" variant="destructive" onClick={() => removeMaterial(idx)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4">
          <Button onClick={addMaterial}>Add Material</Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/production/bom")}>
          Cancel
        </Button>

        <Button disabled={saving} onClick={handleSubmit}>
          {saving ? "Saving..." : isEdit ? "Update BOM" : "Create BOM"}
        </Button>
      </div>
    </div>
  );
}
