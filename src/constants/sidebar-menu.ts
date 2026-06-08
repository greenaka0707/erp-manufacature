import { LayoutDashboard, ShoppingCart, Receipt, Factory, Database, Package, Wallet, Calculator } from "lucide-react";

export const sidebarMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },

  // 1. Purchasing (Pembelian bahan)
  {
    title: "Purchasing",
    icon: ShoppingCart,
    children: [
      {
        title: "Purchase Orders",
        path: "/purchasing/purchase-orders",
      },
      {
        title: "Receivings",
        path: "/purchasing/receivings",
      },
      {
        title: "QC Incoming",
        path: "/purchasing/qc-incoming",
      },
      {
        title: "Supplier Invoices",
        path: "/purchasing/supplier-invoices",
      },
      {
        title: "Accounts Payable",
        path: "/purchasing/accounts-payable",
      },
    ],
  },

  // 2. Sales (Penjualan produk)
  {
    title: "Sales",
    icon: Receipt,
    children: [
      {
        title: "Sales Orders",
        path: "/sales/orders",
      },
      {
        title: "Delivery Orders",
        path: "/sales/delivery-orders",
      },
      {
        title: "Sales Invoices",
        path: "/sales/invoices",
      },
      {
        title: "Customer Payments",
        path: "/sales/payments",
      },
    ],
  },

  // 3. Production (Proses pembuatan)
  {
    title: "Production",
    icon: Factory,
    children: [
      {
        title: "Bill Of Material",
        path: "/production/bom",
      },
      {
        title: "Production Orders",
        path: "/production/orders",
      },
    ],
  },

  // 4. Master Data
  {
    title: "Master Data",
    icon: Database,
    children: [
      {
        title: "Products",
        path: "/master/products",
      },
      {
        title: "Suppliers",
        path: "/master/suppliers",
      },
      {
        title: "Customers",
        path: "/master/customers",
      },
      {
        title: "Warehouses",
        path: "/master/warehouses",
      },
      {
        title: "Salespersons",
        path: "/master/salespersons",
      },
    ],
  },

  // 5. Inventory
  {
    title: "Inventory",
    icon: Package,
    children: [
      {
        title: "Inventory Batches",
        path: "/inventory/batches",
      },
      {
        title: "Stock Movements",
        path: "/inventory/stock-movements",
      },
      {
        title: "Inventory Ledger",
        path: "/inventory/ledger",
      },
      {
        title: "Adjustments",
        path: "/inventory/adjustments",
      },
      {
        title: "Transfers",
        path: "/inventory/transfers",
      },
    ],
  },

  // 6. Finance
  {
    title: "Finance",
    icon: Wallet,
    children: [
      {
        title: "Cash & Bank",
        path: "/finance/cash-bank",
      },
      {
        title: "Accounts Receivable",
        path: "/sales/accounts-receivable", // Diarahkan ke rute yang sama agar sinkron
      },
      {
        title: "Accounts Payable",
        path: "/finance/ap",
      },
    ],
  },

  // 7. Accounting
  {
    title: "Accounting",
    icon: Calculator,
    children: [
      {
        title: "Chart Of Accounts",
        path: "/accounting/coa",
      },
      {
        title: "Journal Entries",
        path: "/accounting/journals",
      },
      {
        title: "General Ledger",
        path: "/accounting/ledger",
      },
      {
        title: "Trial Balance",
        path: "/accounting/trial-balance",
      },
      {
        title: "Profit & Loss",
        path: "/accounting/pnl",
      },
      {
        title: "Balance Sheet",
        path: "/accounting/balance-sheet",
      },
    ],
  },
];
