import type { RouteObject } from "react-router-dom";

import ERPLayout from "@/app/layouts/ERPLayout";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";

import ProductsPage from "@/pages/master/products/ProductsPage";
import SuppliersPage from "@/pages/master/suppliers/SuppliersPage";
import CustomersPage from "@/pages/master/customers/CustomersPage";
import WarehousesPage from "@/pages/master/warehouses/WarehousesPage";
import SalespersonsPage from "@/pages/master/salespersons/SalespersonsPage";

import PurchaseOrdersPage from "@/pages/purchasing/purchase-orders/PurchaseOrdersPage";
import PurchaseOrderDetailPage from "@/pages/purchasing/purchase-orders/PurchaseOrderDetailPage";
import PurchaseOrderForm from "@/pages/purchasing/purchase-orders/PurchaseOrderForm";

import ReceivingsPage from "@/pages/purchasing/receivings/ReceivingsPage";
import ReceivingFormPage from "@/pages/purchasing/receivings/ReceivingFormPage";
import ReceivingDetailPage from "@/pages/purchasing/receivings/ReceivingDetailPage";

import QCIncomingPage from "@/pages/purchasing/qc-incoming/QCIncomingPage";
import QCIncomingFormPage from "@/pages/purchasing/qc-incoming/QCIncomingFormPage";
import QCIncomingDetailPage from "@/pages/purchasing/qc-incoming/QCIncomingDetailPage";

import SupplierInvoicesPage from "@/pages/purchasing/supplier-invoices/SupplierInvoicesPage";
import SupplierInvoiceFormPage from "@/pages/purchasing/supplier-invoices/SupplierInvoiceFormPage";
import SupplierInvoiceDetailPage from "@/pages/purchasing/supplier-invoices/SupplierInvoiceDetailPage";

import AccountsPayablePage from "@/pages/purchasing/accounts-payable/AccountsPayablePage";
import AccountsPayableDetailPage from "@/pages/purchasing/accounts-payable/AccountsPayableDetailPage";
import SupplierPaymentFormPage from "@/pages/purchasing/accounts-payable/SupplierPaymentFormPage";

import InventoryBatchesPage from "@/pages/inventory/InventoryBatchesPage";
import InventoryBatchDetailPage from "@/pages/inventory/InventoryBatchDetailPage";
import StockMovementsPage from "@/pages/inventory/StockMovementsPage";
import InventoryLedgerPage from "@/pages/inventory/InventoryLedgerPage";

import AdjustmentsPage from "@/pages/adjustments/AdjustmentsPage";
import AdjustmentFormPage from "@/pages/adjustments/AdjustmentFormPage";
import AdjustmentDetailPage from "@/pages/adjustments/AdjustmentDetailPage";

import TransfersPage from "@/pages/transfers/TransfersPage";
import TransferFormPage from "@/pages/transfers/TransferFormPage";
import TransferDetailPage from "@/pages/transfers/TransferDetailPage";

// Import BOM Pages
import BOMPage from "@/pages/production/BOMPage";
import BOMFormPage from "@/pages/production/BOMFormPage";
import BOMDetailPage from "@/pages/production/BOMDetailPage";

import ProductionOrdersPage from "@/pages/production/ProductionOrdersPage";
import ProductionOrderFormPage from "@/pages/production/ProductionOrderFormPage";
import ProductionOrderDetailPage from "@/pages/production/ProductionOrderDetailPage";

import SalesOrdersPage from "@/pages/sales/orders/SalesOrdersPage";
import SalesOrderFormPage from "@/pages/sales/orders/SalesOrderFormPage";
import SalesOrderDetailPage from "@/pages/sales/orders/SalesOrderDetailPage";

import DeliveryOrdersPage from "@/pages/sales/delivery-orders/DeliveryOrdersPage";
import DeliveryOrderFormPage from "@/pages/sales/delivery-orders/DeliveryOrderFormPage";
import DeliveryOrderDetailPage from "@/pages/sales/delivery-orders/DeliveryOrderDetailPage";

import SalesInvoicesPage from "@/pages/sales/invoices/SalesInvoicesPage";
import SalesInvoiceDetailPage from "@/pages/sales/invoices/SalesInvoiceDetailPage";
import InvoiceFormPage from "@/pages/sales/invoices/InvoiceFormPage";

import CustomerPaymentsPage from "@/pages/sales/payments/CustomerPaymentsPage";
import CustomerPaymentDetailPage from "@/pages/sales/payments/CustomerPaymentDetailPage";
import CustomerPaymentFormPage from "@/pages/sales/payments/CustomerPaymentFormPage";
import AccountsReceivablePage from "@/pages/sales/receivables/AccountsReceivablePage";

import CashBankPage from "@/pages/finance/cash-bank/CashBankPage";
import CashBankFormPage from "@/pages/finance/cash-bank/CashBankFormPage";
import CashBankDetailPage from "@/pages/finance/cash-bank/CashBankDetailPage";

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: <ERPLayout />,
    children: [
      // Dashboard
      {
        index: true,
        element: <DashboardPage />,
      },

      // Master Data
      {
        path: "master/products",
        element: <ProductsPage />,
      },

      {
        path: "master/suppliers",
        element: <SuppliersPage />,
      },

      {
        path: "master/customers",
        element: <CustomersPage />,
      },

      {
        path: "master/warehouses",
        element: <WarehousesPage />,
      },

      {
        path: "master/salespersons",
        element: <SalespersonsPage />,
      },
      {
        path: "purchasing/purchase-orders",
        element: <PurchaseOrdersPage />,
      },

      {
        path: "purchasing/purchase-orders/create",
        element: <PurchaseOrderForm />,
      },

      {
        path: "purchasing/purchase-orders/:id",
        element: <PurchaseOrderDetailPage />,
      },

      {
        path: "purchasing/purchase-orders/:id/edit",
        element: <PurchaseOrderForm />,
      },

      {
        path: "purchasing/receivings",
        element: <ReceivingsPage />,
      },

      {
        path: "purchasing/receivings/create",
        element: <ReceivingFormPage />,
      },

      {
        path: "purchasing/receivings/:id",
        element: <ReceivingDetailPage />,
      },

      {
        path: "purchasing/qc-incoming",
        element: <QCIncomingPage />,
      },

      {
        path: "purchasing/qc-incoming/create",
        element: <QCIncomingFormPage />,
      },

      {
        path: "purchasing/qc-incoming/:id",
        element: <QCIncomingDetailPage />,
      },

      {
        path: "purchasing/supplier-invoices",
        element: <SupplierInvoicesPage />,
      },
      {
        path: "purchasing/supplier-invoices/create",
        element: <SupplierInvoiceFormPage />,
      },
      {
        path: "purchasing/supplier-invoices/:id",
        element: <SupplierInvoiceDetailPage />,
      },

      {
        path: "finance/accounts-payable",
        element: <AccountsPayablePage />,
      },

      {
        path: "finance/accounts-payable/:id/payment",
        element: <SupplierPaymentFormPage />,
      },

      {
        path: "finance/accounts-payable/:id",
        element: <AccountsPayableDetailPage />,
      },

      {
        path: "inventory/batches",
        element: <InventoryBatchesPage />,
      },
      {
        path: "inventory/batches/:id",
        element: <InventoryBatchDetailPage />,
      },

      {
        path: "inventory/ledger",
        element: <InventoryLedgerPage />,
      },

      {
        path: "inventory/stock-movements",
        element: <StockMovementsPage />,
      },

      {
        path: "inventory/adjustments",
        element: <AdjustmentsPage />,
      },

      {
        path: "inventory/adjustments/create",
        element: <AdjustmentFormPage />,
      },

      {
        path: "inventory/adjustments/:id",
        element: <AdjustmentDetailPage />,
      },

      {
        path: "inventory/transfers",
        element: <TransfersPage />,
      },
      {
        path: "inventory/transfers/create",
        element: <TransferFormPage />,
      },
      {
        path: "inventory/transfers/:id",
        element: <TransferDetailPage />,
      },

      // Production
      {
        path: "production/orders",
        element: <ProductionOrdersPage />,
      },
      {
        path: "production/orders/create",
        element: <ProductionOrderFormPage />,
      },
      {
        path: "production/orders/:id",
        element: <ProductionOrderDetailPage />,
      },

      // BOM
      {
        path: "production/bom",
        element: <BOMPage />,
      },
      {
        path: "production/bom/create",
        element: <BOMFormPage />,
      },
      {
        path: "production/bom/:id",
        element: <BOMDetailPage />,
      },
      {
        path: "production/bom/:id/edit",
        element: <BOMFormPage />,
      },

      // Sales Orders
      {
        path: "sales/orders",
        element: <SalesOrdersPage />,
      },
      {
        path: "sales/orders/create",
        element: <SalesOrderFormPage />,
      },
      {
        path: "sales/orders/:id",
        element: <SalesOrderDetailPage />,
      },

      // Delivery Orders
      {
        path: "sales/delivery-orders",
        element: <DeliveryOrdersPage />,
      },
      {
        path: "sales/delivery-orders/create",
        element: <DeliveryOrderFormPage />,
      },
      {
        path: "sales/delivery-orders/:id",
        element: <DeliveryOrderDetailPage />,
      },

      // Sales Invoices
      {
        path: "sales/invoices",
        element: <SalesInvoicesPage />,
      },
      {
        path: "sales/invoices/create",
        element: <InvoiceFormPage />,
      },
      {
        path: "sales/invoices/:id",
        element: <SalesInvoiceDetailPage />,
      },

      // ==========================================
      // GANTI BAGIAN INI DI FILE ROUTES KAMU
      // ==========================================

      // Customer Payments (Daftar Riwayat Pembayaran)
      {
        path: "sales/payments",
        element: <CustomerPaymentsPage />,
      },

      // PERBAIKAN 1: Tambahkan parameter /:id agar menangkap ID invoice yang dikirim dari list piutang
      {
        path: "sales/payments/create/:invoiceId",
        element: <CustomerPaymentFormPage />,
      },

      {
        path: "sales/payments/:id",
        element: <CustomerPaymentDetailPage />,
      },

      // PERBAIKAN 2: Ubah path menjadi "sales/accounts-receivable" agar sinkron dengan menu sidebar kamu
      {
        path: "sales/accounts-receivable",
        element: <AccountsReceivablePage />,
      },

      {
        path: "finance/cash-bank",
        element: <CashBankPage />,
      },

      {
        path: "finance/cash-bank/create",
        element: <CashBankFormPage />,
      },

      {
        path: "finance/cash-bank/:id",
        element: <CashBankDetailPage />,
      },
    ],
  },
];
