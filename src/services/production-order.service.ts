import { supabase } from "@/lib/supabase";

export interface ProductionOrder {
  id: string;
  company_id: string;

  order_number: string;
  order_date: string;

  bom_id: string;
  product_id: string;

  planned_input_qty: number;
  planned_output_qty: number;

  expected_yield_percent: number;

  actual_input_qty: number;
  actual_output_qty: number;

  actual_yield_percent: number;

  status: string;
  notes?: string;

  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getProductionOrders(companyId: string) {
  const { data, error } = await supabase
    .from("production_orders")
    .select(
      `
  *,
  product:products(
    id,
    sku,
    name
  ),
  bom:boms(
    id,
    bom_code
  )
`,
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getProductionOrderById(id: string) {
  const { data, error } = await supabase
    .from("production_orders")
    .select(
      `
  *,
  product:products(
    id,
    sku,
    name
  ),
  bom:boms(
    id,
    bom_code
  ),
  production_order_materials(
    *,
    material:products(
      id,
      sku,
      name
    )
  ),
  production_order_costs(*),
  production_order_outputs(
  *,
  inventory_batches(
    id,
    batch_number,
    batch_type
  )
),
 production_order_consumptions(
  *,
  material:products(
    id,
    sku,
    name
  ),
  batch:inventory_batches(
    id,
    batch_number,
    remaining_qty
  )
)
`,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateProductionOrder(id: string, data: Partial<ProductionOrder>) {
  const { data: result, error } = await supabase.from("production_orders").update(data).eq("id", id).select().single();

  console.log("UPDATE RESULT", result);
  console.log("UPDATE ERROR", error);

  if (error) throw error;

  return result;
}
export async function deleteProductionOrder(id: string) {
  const { error } = await supabase.from("production_orders").delete().eq("id", id);
  if (error) throw error;
}

// Complete production: update output, yield, generate finished goods, create stock movements
export interface ProductionOrderMaterialPayload {
  material_id: string;
  bom_qty: number;
  required_qty: number;
}
export interface ProductionOrderPayload {
  production_date: string;

  warehouse_id: string;

  bom_id: string;
  product_id: string;

  planned_output_qty: number;
  planned_input_qty: number;

  expected_yield_percent: number;

  notes?: string;

  materials: ProductionOrderMaterialPayload[];
}

export async function createProductionOrder(companyId: string, payload: ProductionOrderPayload) {
  const { data: noData, error: noError } = await supabase.rpc("generate_production_order_number");

  if (noError) throw noError;

  const { data: productionOrder, error } = await supabase
    .from("production_orders")
    .insert({
      company_id: companyId,

      warehouse_id: payload.warehouse_id,

      order_number: noData,

      order_date: payload.production_date,

      bom_id: payload.bom_id,
      product_id: payload.product_id,

      planned_output_qty: payload.planned_output_qty,
      planned_input_qty: payload.planned_input_qty,

      expected_yield_percent: payload.expected_yield_percent,

      actual_input_qty: 0,
      actual_output_qty: 0,

      actual_yield_percent: 0,

      status: "draft",

      notes: payload.notes,
    })
    .select()
    .single();

  if (error) throw error;

  if (payload.materials.length > 0) {
    const materials = payload.materials.map((item) => ({
      production_order_id: productionOrder.id,
      material_id: item.material_id,
      bom_qty: item.bom_qty,
      required_qty: item.required_qty,
    }));

    const { error: materialError } = await supabase.from("production_order_materials").insert(materials);

    if (materialError) throw materialError;
  }

  return productionOrder;
}

export async function startProductionOrder(id: string) {
  const { error } = await supabase
    .from("production_orders")
    .update({
      status: "in_progress",
    })
    .eq("id", id);

  if (error) throw error;
}
