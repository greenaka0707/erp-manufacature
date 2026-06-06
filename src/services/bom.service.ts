import { supabase } from "@/lib/supabase";

export interface BOM {
  id: string;
  company_id: string;
  bom_code: string;
  product_id: string;
  version: number;
  status: string;
  notes?: string;
  created_at: string;

  product?: {
    id: string;
    sku: string;
    name: string;
  };
}
export interface BOMItemPayload {
  material_id: string;
  qty: number;
}

export interface BOMPayload {
  product_id: string;
  version?: number;
  status?: string;
  notes?: string;
  items: BOMItemPayload[];
}

// Ambil produk dengan tipe FINISHED_GOOD
export async function getFinishedGoods(companyId: string) {
  const { data, error } = await supabase.from("products").select("id, sku, name, product_type").eq("company_id", companyId).in("product_type", ["SEMI_FINISHED", "FINISHED_GOOD"]).eq("is_active", true);

  if (error) throw error;
  return data ?? [];
}

// Ambil material untuk BOM: RAW_MATERIAL, SEMI_FINISHED, PACKAGING
export async function getBOMMaterials(companyId: string) {
  const { data, error } = await supabase.from("products").select("id, sku, name, product_type").eq("company_id", companyId).in("product_type", ["RAW_MATERIAL", "SEMI_FINISHED", "PACKAGING"]).eq("is_active", true);

  if (error) throw error;
  return data ?? [];
}
/**
 * Get list of BOMs for a company
 */
export async function getBOMs(companyId: string) {
  const { data, error } = await supabase
    .from("boms")
    .select(
      `
      *,
      product:products (
        id,
        sku,
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get BOM detail by id, including materials
 */
export async function getBOMById(id: string): Promise<BOMDetail> {
  const { data, error } = await supabase
    .from("boms")
    .select(
      `
    *,
    product:products (
      id,
      sku,
      name,
      product_type
    ),
    items:bom_items (
      id,
      material_id,
      qty,
      material:products (
        id,
        sku,
        name,
        product_type
      )
    )
  `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create BOM with header + items in one flow
 */
export async function createBOM(companyId: string, payload: BOMPayload) {
  // 1. Generate BOM code via RPC
  const { data: bomCodeData, error: codeError } = await supabase.rpc("generate_bom_number");
  if (codeError) throw codeError;

  // 2. Insert BOM header
  const { data: bom, error: bomError } = await supabase
    .from("boms")
    .insert({
      company_id: companyId,
      bom_code: bomCodeData,
      product_id: payload.product_id,
      version: payload.version ?? 1,
      status: payload.status ?? "active",
      notes: payload.notes,
    })
    .select()
    .single();

  if (bomError) throw bomError;

  // 3. Insert BOM items
  if (payload.items.length > 0) {
    const items = payload.items.map((item) => ({
      bom_id: bom.id,
      material_id: item.material_id,
      qty: item.qty,
    }));

    const { error: itemError } = await supabase.from("bom_items").insert(items);
    if (itemError) throw itemError;
  }

  return bom;
}

/**
 * Update BOM header + items
 */
export async function updateBOM(id: string, payload: BOMPayload) {
  const { error } = await supabase
    .from("boms")
    .update({
      product_id: payload.product_id,
      version: payload.version,
      status: payload.status,
      notes: payload.notes,
    })
    .eq("id", id);

  if (error) throw error;

  // Delete old items
  await supabase.from("bom_items").delete().eq("bom_id", id);

  // Insert new items
  if (payload.items.length > 0) {
    const items = payload.items.map((item) => ({
      bom_id: id,
      material_id: item.material_id,
      qty: item.qty,
    }));

    const { error: itemError } = await supabase.from("bom_items").insert(items);
    if (itemError) throw itemError;
  }
}

/**
 * Delete BOM
 */
export async function deleteBOM(id: string) {
  const { error } = await supabase.from("boms").delete().eq("id", id);
  if (error) throw error;
}

export interface BOMDetail extends BOMPayload {
  id: string;
  product_id: string;
  version: number;
  status: string;
  notes?: string;
  items: {
    id: string;
    material_id: string;
    qty: number;
    material?: {
      id: string;
      sku?: string;
      name: string;
      product_type: string;
    };
  }[];
}
