export function getProductDefaults(category: "GREEN_BEAN" | "ROASTED_BEAN" | "GROUND_COFFEE" | "FINISHED_GOODS" | "PACKAGING") {
  switch (category) {
    case "GREEN_BEAN":
      return {
        product_type: "RAW_MATERIAL" as const,
        is_purchasable: true,
        is_producible: false,
        is_sellable: false,
        is_batch_tracked: true,
      };

    case "ROASTED_BEAN":
      return {
        product_type: "SEMI_FINISHED" as const,
        is_purchasable: false,
        is_producible: true,
        is_sellable: false,
        is_batch_tracked: true,
      };

    case "GROUND_COFFEE":
      return {
        product_type: "SEMI_FINISHED" as const,
        is_purchasable: false,
        is_producible: true,
        is_sellable: false,
        is_batch_tracked: true,
      };

    case "PACKAGING":
      return {
        product_type: "PACKAGING" as const,
        is_purchasable: true,
        is_producible: false,
        is_sellable: false,
        is_batch_tracked: false,
      };

    case "FINISHED_GOODS":
      return {
        product_type: "FINISHED_GOOD" as const,
        is_purchasable: false,
        is_producible: true,
        is_sellable: true,
        is_batch_tracked: true,
      };
  }
}
