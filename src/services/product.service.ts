import { supabase } from "@/lib/supabase";

export interface ProductPayload {
  name: string;

  category_id: string;

  unit_id: string;

  description?: string;

  minimum_stock?: number;

  is_purchasable?: boolean;
  is_producible?: boolean;
  is_sellable?: boolean;
  is_batch_tracked?: boolean;
}

export async function getProducts(companyId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      units (
        id,
        code,
        name
      ),
      product_categories (
        id,
        code,
        name
      )
    `,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // flatten nested fields
  return (data ?? []).map((p: any) => ({
    ...p,
    category_name: p.product_categories?.name ?? "-",
    unit_name: p.units?.name ?? "-",
  }));
}

export async function getProductById(companyId: string, id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("company_id", companyId).eq("id", id).single();

  if (error) throw error;

  return data;
}

export async function createProduct(companyId: string, payload: ProductPayload) {
  const { data, error } = await supabase.rpc("create_product", {
    p_company_id: companyId,
    p_name: payload.name,
    p_category_id: payload.category_id,
    p_unit_id: payload.unit_id,
    p_minimum_stock: payload.minimum_stock ?? 0,
    p_description: payload.description ?? null,
  });

  if (error) throw error;

  return data;
}

export async function updateProduct(companyId: string, id: string, payload: ProductPayload) {
  const { data, error } = await supabase.rpc("update_product", {
    p_company_id: companyId,
    p_id: id,
    p_name: payload.name,
    p_category_id: payload.category_id,
    p_unit_id: payload.unit_id,
    p_minimum_stock: payload.minimum_stock ?? 0,
    p_description: payload.description ?? null,
  });

  if (error) throw error;

  return data;
}

export async function deleteProduct(companyId: string, id: string) {
  const { error } = await supabase.from("products").delete().eq("company_id", companyId).eq("id", id);

  if (error) throw error;
}

export async function getActiveProducts(companyId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      sku,
      name
    `,
    )
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return data;
}
