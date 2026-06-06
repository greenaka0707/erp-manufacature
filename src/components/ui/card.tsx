import * as React from "react";
import { cn } from "@/lib/utils";

// 1. Buat Context sederhana untuk mengoper info size ke anak-anak komponen Card
const CardSizeContext = React.createContext<"default" | "sm">("default");

function Card({ className, size = "default", ...props }: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <CardSizeContext.Provider value={size}>
      <div
        data-slot="card"
        data-size={size}
        className={cn(
          "flex flex-col gap-3.5 overflow-hidden rounded-xl bg-white text-sm text-card-foreground border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
          size === "sm" && "gap-1.5 py-2.5 rounded-lg has-data-[slot=card-footer]:pb-0",
          size === "default" && "py-4",
          className,
        )}
        {...props}
      />
    </CardSizeContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardSizeContext);

  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-0.5 rounded-t-xl px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4",
        size === "sm" && "px-3.5 [.border-b]:pb-2",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardSizeContext);

  return <div data-slot="card-title" className={cn("font-heading leading-snug font-medium text-slate-700", size === "sm" ? "text-xs font-semibold text-slate-500" : "text-sm", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardSizeContext);

  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", size === "sm" ? "text-xl font-bold text-slate-900" : "text-sm", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardSizeContext);

  return <div data-slot="card-content" className={cn("px-4", size === "sm" && "px-3.5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  const size = React.useContext(CardSizeContext);

  return <div data-slot="card-footer" className={cn("flex items-center rounded-b-xl border-t bg-muted/50 p-4", size === "sm" && "p-2.5", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
