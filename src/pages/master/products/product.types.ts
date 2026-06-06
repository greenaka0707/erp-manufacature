export interface Product {
  id: string;

  sku: string;
  name: string;

  category: "GREEN_BEAN" | "ROASTED_BEAN" | "GROUND_COFFEE" | "FINISHED_GOODS" | "PACKAGING";

  product_type: "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED_GOOD" | "PACKAGING" | "CONSUMABLE";

  unit_id: string;

  minimum_stock?: number;

  is_purchasable?: boolean;
  is_producible?: boolean;
  is_sellable?: boolean;
  is_batch_tracked?: boolean;

  is_active?: boolean;
}
