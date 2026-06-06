import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import AppSidebar from "@/components/sidebar/AppSidebar";
import AppNavbar from "@/components/navbar/AppNavbar";

import { useCompanyStore } from "@/stores/companyStore";

export default function ERPLayout() {
  const setCurrentCompany = useCompanyStore((state) => state.setCurrentCompany);

  useEffect(() => {
    setCurrentCompany({
      id: "90f378b0-4ac3-44ac-8d5c-ba318b7e1536",
      name: "ERP Manufacture Kopi",
    });
  }, []);

  return (
    // Pastikan screen-nya memenuhi layar penuh dan tidak memicu scroll horizontal global
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar kamu yang lebarnya w-72 */}
      <AppSidebar />

      {/* Konten Utama: max-w menggunakan hitungan layar dikurangi lebar sidebar di mode desktop */}
      <div className="flex flex-1 flex-col overflow-hidden w-full md:max-w-[calc(100vw-18rem)]">
        <AppNavbar />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
