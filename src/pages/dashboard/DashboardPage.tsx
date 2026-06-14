import { useEffect, useState } from "react";
import { ArrowUpRight, Search, Filter, Plus, DollarSign, ShoppingBag, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

// Base Components
import Loading from "@/components/ui/loading";
import { Card } from "@/components/ui/card";

// Stores & Services
import { useCompanyStore } from "@/stores/companyStore";
import { getDashboardSummary } from "@/services/dashboard.service";

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

  useEffect(() => {
    if (companyId) loadDashboard();
  }, [companyId]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await getDashboardSummary(companyId!);
      setSummary(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  // Label dummy untuk mempercantik sumbu X grafik trend
  const trendLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen tracking-tight">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Good morning, Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Stay on top of your tasks, monitor progress, and track status.</p>
        </div>
        {/* Placeholder untuk filter tanggal di masa depan */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm text-zinc-600 shadow-sm cursor-pointer hover:bg-zinc-50 transition">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span>This Month</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KIRI: Total Balance Box (4 Kolom) */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="bg-zinc-900 text-white rounded-2xl p-6 flex flex-col justify-between h-full min-h-[340px] shadow-lg border-0 relative overflow-hidden">
            {/* Dekorasi estetik background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Balance</span>
              <h2 className="text-4xl font-bold mt-3 tracking-tight">{formatCurrency(summary.cashBalance)}</h2>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 5%
                </span>
                <span className="text-xs text-zinc-400">than last month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8 z-10">
              <button className="flex items-center justify-center gap-2 bg-white text-zinc-900 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-100 transition shadow-sm">
                <ArrowUpRight className="w-4 h-4" /> Transfer
              </button>
              <button className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-700 transition">
                <Plus className="w-4 h-4" /> Request
              </button>
            </div>
          </Card>
        </div>

        {/* KANAN: Grid Finansial & Chart (8 Kolom) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matriks 2x2 Card Finansial */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Total Sales */}
              <Card className="bg-white border border-zinc-100 p-5 rounded-2xl min-h-[135px] shadow-sm flex flex-col justify-between hover:border-orange-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-zinc-500 font-medium">Total Sales</span>
                    <h4 className="text-2xl font-bold mt-2 text-zinc-900">{formatCurrency(summary.totalSales)}</h4>
                  </div>
                  <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  ↑ 7% <span className="text-zinc-400 font-normal">This month</span>
                </p>
              </Card>

              {/* Card 2: Total Purchase */}
              <Card className="bg-white border border-zinc-100 p-5 rounded-2xl min-h-[135px] shadow-sm flex flex-col justify-between hover:border-zinc-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-zinc-500 font-medium">Total Purchase</span>
                    <h4 className="text-2xl font-bold mt-2 text-zinc-900">{formatCurrency(summary.totalPurchase)}</h4>
                  </div>
                  <div className="p-2 bg-zinc-100 text-zinc-600 rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
                  ↓ 5% <span className="text-zinc-400 font-normal">This month</span>
                </p>
              </Card>

              {/* Card 3: Outstanding AR */}
              <Card className="bg-white border border-zinc-100 p-5 rounded-2xl min-h-[135px] shadow-sm flex flex-col justify-between hover:border-blue-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-zinc-500 font-medium">Outstanding AR</span>
                    <h4 className="text-2xl font-bold mt-2 text-blue-600">{formatCurrency(summary.accountsReceivable)}</h4>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                    <ArrowUpCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">0 Klaim Aktif</p>
              </Card>

              {/* Card 4: Outstanding AP */}
              <Card className="bg-white border border-zinc-100 p-5 rounded-2xl min-h-[135px] shadow-sm flex flex-col justify-between hover:border-red-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-zinc-500 font-medium">Outstanding AP</span>
                    <h4 className="text-2xl font-bold mt-2 text-red-600">{formatCurrency(summary.accountsPayable)}</h4>
                  </div>
                  <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                    <ArrowDownCircle className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  ↑ 4% <span className="text-zinc-400 font-normal">This month</span>
                </p>
              </Card>
            </div>

            {/* Column Chart */}
            <Card className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-full">
              <div>
                <span className="text-sm font-bold text-zinc-800">Total Income Trend</span>
                <p className="text-xs text-zinc-400 mt-0.5">Periodik data real-time</p>
              </div>

              {/* Wadah Grafik */}
              <div className="flex flex-col justify-end h-full mt-4">
                <div className="flex items-end justify-between gap-2.5 h-28 px-1">
                  <div className="w-full bg-zinc-950 h-[40%] rounded-md transition-all hover:opacity-80 cursor-pointer" />
                  <div className="w-full bg-orange-500 h-[70%] rounded-md transition-all hover:opacity-80 cursor-pointer" />
                  <div className="w-full bg-zinc-950 h-[55%] rounded-md transition-all hover:opacity-80 cursor-pointer" />
                  <div className="w-full bg-orange-500 h-[90%] rounded-md transition-all hover:opacity-80 cursor-pointer" />
                  <div className="w-full bg-zinc-950 h-[30%] rounded-md transition-all hover:opacity-80 cursor-pointer" />
                </div>

                {/* FIX: Penambahan label sumbu X agar data terbaca rapi */}
                <div className="flex justify-between text-[10px] font-medium text-zinc-400 mt-2 px-0.5 border-t border-zinc-50 pt-1.5">
                  {trendLabels.map((day, idx) => (
                    <span key={idx} className="w-full text-center">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Arus Operasional Section */}
          <Card className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-zinc-800">Arus Operasional Terbaru</h3>
              <div className="flex gap-3">
                <Search className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-zinc-600 transition" />
                <Filter className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-zinc-600 transition" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-zinc-50 hover:bg-zinc-100/60 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-sm">S</div>
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">Total Sales Rekap</p>
                    <p className="text-xs text-zinc-500">Penjualan Kopi Sukses</p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900">{formatCurrency(summary.totalSales)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-zinc-50 hover:bg-zinc-100/60 rounded-xl transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold text-sm">P</div>
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">Bahan Baku & Utilities</p>
                    <p className="text-xs text-zinc-500">Outstanding Hutang AP</p>
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}
