export interface Receiving {
  id: string;
  receiving_number: string;
  receiving_date: string;

  status: "RECEIVED" | "PARTIAL" | "COMPLETED" | "CANCELLED";

  suppliers?: {
    name: string;
  };

  purchase_orders?: {
    po_number: string;
  };
}
