export function getProductionConfig(processType: string) {
  switch (processType) {
    case "ROASTING":
      return {
        movementOut: "PRODUCTION_OUT",
        movementIn: "PRODUCTION_IN",
        outputBatchType: "ROASTED_BEAN",
      };

    case "GRINDING":
      return {
        movementOut: "PRODUCTION_OUT",
        movementIn: "PRODUCTION_IN",
        outputBatchType: "GROUND_COFFEE",
      };

    case "PACKING":
      return {
        movementOut: "PRODUCTION_OUT",
        movementIn: "PRODUCTION_IN",
        outputBatchType: "FINISHED_GOODS",
      };

    default:
      return {
        movementOut: "PRODUCTION_OUT",
        movementIn: "PRODUCTION_IN",
        outputBatchType: "FINISHED_GOODS",
      };
  }
}
