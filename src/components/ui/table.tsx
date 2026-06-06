import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        // Menggunakan text-xs atau text-sm agar ukuran font data ERP lebih proporsional
        className={cn("w-full caption-bottom text-xs sm:text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      // Memberikan warna background tipis pada header agar tabel terlihat kokoh
      className={cn("[&_tr]:border-b bg-slate-50/70", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <div data-slot="table-footer" className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b transition-colors hover:bg-slate-50/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      // PERUBAHAN: Tinggi dikurangi dari h-10 ke h-8, font diubah ke font-semibold, text warna muted-foreground/slate-500
      className={cn("h-8 px-3 py-1 text-left align-middle font-semibold whitespace-nowrap text-slate-500 tracking-wider text-[11px] uppercase [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      // PERUBAHAN: Padding vertikal dikurangi dari p-2 (8px) menjadi py-1.5 (6px) dan px-3 untuk ruang horizontal yang pas
      className={cn("px-3 py-1.5 align-middle whitespace-nowrap text-slate-700 font-normal [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
