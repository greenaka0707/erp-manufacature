import { useEffect, useState } from "react";
import { ArrowUpRight, Search, Filter, Plus } from "lucide-react";

// Base Components
import Loading from "@/components/ui/loading";
import { Card } from "@/components/ui/card";

// Stores & Services
import { useCompanyStore } from "@/stores/companyStore";
import { getDashboardSummary } from "@/services/dashboard.service";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const companyId = useCompanyStore((state) => state.currentCompany?.id);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchase: 0,
    cashBalance: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
  });

  // Integrasi Data Nyata dari Backend API
  useEffect(() => {
    if (companyId) {
      loadDashboard();
    }
  }, [companyId]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await getDashboardSummary(companyId!);
      setSummary(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      // <-- Sudah diperbaiki dari 'biographical' menjadi 'finally'
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-6 max-w-[1600px] mx-auto bg-[#F8F9FA] min-h-screen font-sans">
      {/* GREETING HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Good morning, Admin</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Stay on top of your tasks, monitor progress, and track status.</p>
        </div>
      </div>

      {/* MASTER MACRO GRID SYSTEM (12 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= AREA KIRI (4 KOLOM) ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Main Balance Card */}
          <Card className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
            <span className="text-xs font-medium text-zinc-400">Total Balance</span>
            <h2 className="text-3xl font-bold text-zinc-900 mt-1 tracking-tight">{formatCurrency(summary.cashBalance)}</h2>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 5%
              </span>
              <span className="text-[11px] text-zinc-400">than last month</span>
            </div>

            {/* Quick Actions Button */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-zinc-800 transition">
                <ArrowUpRight className="w-3.5 h-3.5" /> Transfer
              </button>
              <button className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 rounded-xl py-2.5 text-xs font-semibold hover:bg-zinc-200 transition">
                <Plus className="w-3.5 h-3.5" /> Request
              </button>
            </div>
          </Card>

          {/* Mini Info Card - Limit Operasional / Target Kopi */}
          <Card className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-800">Monthly Spending Limit</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full w-[25%]" />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                <span>{formatCurrency(summary.totalSales)} spent out of</span>
                <span>{formatCurrency(15000000)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= AREA TENGAH & KANAN (8 KOLOM) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Row Atas: Grid Mini Cards & Placeholder Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left: 4 Mini Box Grid */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {/* Total Earnings */}
              <div className="bg-orange-500 text-white p-5 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm">
                <span className="text-xs font-medium opacity-90">Total Sales</span>
                <div>
                  <h4 className="text-xl font-bold tracking-tight">{formatCurrency(summary.totalSales)}</h4>
                  <p className="text-[10px] opacity-75 mt-1">↑ 7% This month</p>
                </div>
              </div>

              {/* Total Spending */}
              <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm">
                <span className="text-xs font-medium text-zinc-400">Total Purchase</span>
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-zinc-900">{formatCurrency(summary.totalPurchase)}</h4>
                  <p className="text-[10px] text-red-500 mt-1">↓ 5% This month</p>
                </div>
              </div>

              {/* Total Income */}
              <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm">
                <span className="text-xs font-medium text-zinc-400">Outstanding AR</span>
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-blue-600">{formatCurrency(summary.accountsReceivable)}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">0 Klaim Aktif</p>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm">
                <span className="text-xs font-medium text-zinc-400">Outstanding AP</span>
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-red-600">{formatCurrency(summary.accountsPayable)}</h4>
                  <p className="text-[10px] text-emerald-500 mt-1">↑ 4% This month</p>
                </div>
              </div>
            </div>

            {/* Right: Chart Card Placeholder */}
            <div className="bg-white border border-zinc-100 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-zinc-800">Total Income Trend</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Periodik data real-time</p>
              </div>
              {/* Dummy Chart Bar Mini */}
              <div className="flex items-end justify-between gap-1 h-20 pt-4">
                <div className="w-full bg-zinc-900 h-[40%] rounded-sm" />
                <div className="w-full bg-orange-500 h-[70%] rounded-sm" />
                <div className="w-full bg-zinc-900 h-[55%] rounded-sm" />
                <div className="w-full bg-orange-500 h-[90%] rounded-sm" />
                <div className="w-full bg-zinc-900 h-[30%] rounded-sm" />
              </div>
            </div>
          </div>

          {/* Row Bawah: Recent Activities (Arus Operasional) */}
          <Card className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-zinc-800">Arus Operasional Terbaru</h3>
              <div className="flex gap-2">
                <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg cursor-pointer text-zinc-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg cursor-pointer text-zinc-500">
                  <Filter className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* List Table Striped Minimalis */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 bg-zinc-50/70 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold">S</div>
                  <div>
                    <p className="font-semibold text-zinc-800">Total Sales Rekap</p>
                    <p className="text-[10px] text-zinc-400">Penjualan Kopi Sukses</p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900">{formatCurrency(summary.totalSales)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-zinc-50/70 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">P</div>
                  <div>
                    <p className="font-semibold text-zinc-800">Bahan Baku & Utilities</p>
                    <p className="text-[10px] text-zinc-400">Outstanding Hutang AP</p>
                  </div>
                </div>
                <span className="font-bold text-red-600">{formatCurrency(summary.accountsPayable)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
