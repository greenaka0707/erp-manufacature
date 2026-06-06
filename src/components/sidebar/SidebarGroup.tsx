import { useState } from "react";
import { ChevronDown } from "lucide-react";

import SidebarItem from "./SidebarItem";

type ChildItem = {
  title: string;
  path: string;
};

type SidebarGroupProps = {
  title: string;
  icon?: React.ElementType;
  childrenItems: ChildItem[];
  onItemClick?: () => void; // Tambahkan prop ini
};

export default function SidebarGroup({ title, icon: Icon, childrenItems, onItemClick }: SidebarGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} />}
          <span>{title}</span>
        </div>

        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l pl-2 border-slate-100">
          {childrenItems.map((item) => (
            <SidebarItem
              key={item.path}
              title={item.title}
              path={item.path}
              onClick={onItemClick} // Teruskan fungsi close ke sini
            />
          ))}
        </div>
      )}
    </div>
  );
}
