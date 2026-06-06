import { NavLink } from "react-router-dom";

type SidebarItemProps = {
  title: string;
  path: string;
  onClick?: () => void; // 1. Tambahkan tipe prop onClick (opsional)
};

export default function SidebarItem({ title, path, onClick }: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      onClick={onClick} // 2. Pasang di NavLink agar memicu fungsi tutup di mobile
      className={({ isActive }) =>
        `
        flex items-center rounded-md px-3 py-2 text-sm transition
        ${isActive ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-50"}
      `
      }
    >
      {title}
    </NavLink>
  );
}
