export interface Warehouse {
  id: string;

  code: string;
  name: string;

  description?: string;

  warehouse_type?: "GENERAL" | "RAW_MATERIAL" | "PRODUCTION" | "FINISHED_GOODS";

  is_default?: boolean;

  allow_negative_stock?: boolean;

  is_active?: boolean;
}
