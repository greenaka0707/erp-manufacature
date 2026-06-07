import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";

import AppSidebar from "@/components/sidebar/AppSidebar";
import AppNavbar from "@/components/navbar/AppNavbar";

export default function ERPLayout() {
  const user = useAuthStore((state) => state.user);
  const setCurrentCompany = useCompanyStore((state) => state.setCurrentCompany);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user?.companies) {
      setCurrentCompany({
        id: user.companies.id,
        name: user.companies.name,
      });
    }
  }, [user, navigate, setCurrentCompany]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden w-full md:max-w-[calc(100vw-18rem)]">
        <AppNavbar />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
