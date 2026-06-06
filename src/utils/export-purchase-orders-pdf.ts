import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPurchaseOrdersPdf(data: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Purchase Orders Report", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["PO Number", "Supplier", "PO Date", "Expected Date", "Status"]],
    body: data.map((po) => [po.po_number, po.suppliers?.name ?? "-", po.po_date, po.expected_date ?? "-", po.status]),
  });

  doc.save("purchase-orders.pdf");
}
