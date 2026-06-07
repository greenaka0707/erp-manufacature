import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import QueryProvider from "@/app/providers/QueryProvider";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";

import "./index.css";

// Fungsi restore session
async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const session = data.session;
  useAuthStore.getState().setSession(session);

  // Ambil user dari company_users
  const userId = session.user.id;
  const { data: companyUser, error } = await supabase
    .from("company_users")
    .select(
      `
      *,
      companies(*),
      roles:role_id(name, code)
    `,
    )
    .eq("user_id", userId)
    .single();

  if (!error && companyUser) {
    useAuthStore.getState().setUser(companyUser);
    if (companyUser.companies) {
      useCompanyStore.getState().setCurrentCompany(companyUser.companies);
    }
  }
}

// Panggil restore session sebelum render
restoreSession().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </React.StrictMode>,
  );
});
