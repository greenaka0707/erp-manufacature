import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAccountsReceivablePdf(invoices: any[]) {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  const totalOutstanding = invoices.reduce((sum, invoice) => {
    const paid = invoice.allocations?.reduce((s: number, item: any) => s + Number(item.allocated_amount || 0), 0) || 0;

    return sum + (Number(invoice.grand_total || 0) - paid);
  }, 0);

  const totalInvoice = invoices.length;

  const totalCustomer = new Set(invoices.map((x) => x.customer?.id)).size;

  const totalPaid = invoices.reduce((sum, invoice) => {
    const paid = invoice.allocations?.reduce((s: number, item: any) => s + Number(item.allocated_amount || 0), 0) || 0;

    return sum + paid;
  }, 0);

  // TITLE

  doc.setFontSize(20);
  doc.text("Accounts Receivable Report", 14, 20);

  // PRINT DATE

  doc.setFontSize(10);
  doc.text(`Print Date : ${new Date().toLocaleString("id-ID")}`, 14, 28);

  // SUMMARY

  doc.setFontSize(11);

  doc.text(`Total Outstanding : Rp ${totalOutstanding.toLocaleString("id-ID")}`, 14, 40);

  doc.text(`Total Invoice : ${totalInvoice}`, 14, 48);

  doc.text(`Total Customer : ${totalCustomer}`, 90, 40);

  doc.text(`Total Paid : Rp ${totalPaid.toLocaleString("id-ID")}`, 90, 48);

  // TABLE

  autoTable(doc, {
    startY: 60,

    head: [["Invoice", "Customer", "Total", "Paid", "Outstanding", "Status"]],

    body: invoices.map((invoice) => {
      const paid = invoice.allocations?.reduce((sum: number, item: any) => sum + Number(item.allocated_amount || 0), 0) || 0;

      const outstanding = Number(invoice.grand_total || 0) - paid;

      return [invoice.invoice_number, invoice.customer?.name, `Rp ${Number(invoice.grand_total).toLocaleString("id-ID")}`, `Rp ${paid.toLocaleString("id-ID")}`, `Rp ${outstanding.toLocaleString("id-ID")}`, invoice.status];
    }),
  });

  doc.save(`accounts-receivable-${new Date().toISOString().split("T")[0]}.pdf`);
}
