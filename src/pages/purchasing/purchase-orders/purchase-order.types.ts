export interface PurchaseOrderItemForm {
  product_id: string;
  qty: number;
  price: number;
}

export interface PurchaseOrderFormData {
  supplier_id: string;
  po_date: string;
  expected_date?: string;
  supplier_reference?: string;
  notes?: string;

  items: PurchaseOrderItemForm[];
}
