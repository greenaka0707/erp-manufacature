import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils"; // Gunakan utility cn agar penggabungan class lebih aman

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg"; // Tambahkan prop size opsional
}

export default function PrimaryButton({
  children,
  variant = "primary",
  size = "sm", // Kita set default ke "sm" agar otomatis kompak di seluruh halaman ERP
  className = "",
  ...props
}: PrimaryButtonProps) {
  // Base styles untuk seluruh tombol
  const baseStyles = "rounded-md font-medium text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50";

  // Varian Warna
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
  };

  // Ukuran Padding & Tinggi (ERP Friendly)
  const sizes = {
    sm: "px-3 py-1.5 h-8", // Ukuran compact untuk data-dense UI (tinggi ~32px)
    md: "px-4 py-2 h-9", // Ukuran standard menengah (tinggi ~36px)
    lg: "px-5 py-2.5 h-10", // Ukuran besar untuk form/halaman landing
  };

  return (
    <button {...props} className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </button>
  );
}
