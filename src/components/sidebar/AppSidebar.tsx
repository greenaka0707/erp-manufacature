import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { sidebarMenu } from "@/constants/sidebar-menu";
import SidebarGroup from "./SidebarGroup";

export default function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Button - Diperbaiki agar tidak nabrak text navbar jika ada */}
      <button onClick={() => setOpen(true)} className="fixed left-4 top-14 z-40 rounded-lg border bg-white p-2 md:hidden shadow-sm">
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 border-r bg-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        {/* Header Sidebar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b p-4">
          <h1 className="text-lg font-bold">ERP Manufacture Kopi</h1>

          <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-md hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Menu Items dengan flex-1 overflow-y-auto agar scrollable jika menu kepanjangan */}
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarMenu.map((menu) => {
            if (menu.children) {
              return <SidebarGroup key={menu.title} title={menu.title} icon={menu.icon} childrenItems={menu.children} onItemClick={() => setOpen(false)} />;
            }
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.title}
                to={menu.path!}
                onClick={() => setOpen(false)} // Otomatis tutup sidebar di mobile setelah klik menu
                className={({ isActive }) =>
                  `
                  flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
                  ${isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `
                }
              >
                {Icon && <Icon size={18} />}
                <span>{menu.title}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}
