import { supabase } from "@/lib/supabase";

const COMPANY_ID = "90f378b0-4ac3-44ac-8d5c-ba318b7e1536";

export async function getCategories() {
  const { data, error } = await supabase.from("product_categories").select("*").eq("company_id", COMPANY_ID).order("code");

  if (error) throw error;

  return data;
}

export async function createCategory(payload: any) {
  const { data, error } = await supabase
    .from("product_categories")
    .insert({
      ...payload,
      company_id: COMPANY_ID,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateCategory(id: string, payload: any) {
  const { data, error } = await supabase.from("product_categories").update(payload).eq("id", id).select().single();

  if (error) throw error;

  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("product_categories").delete().eq("id", id);

  if (error) throw error;
}
