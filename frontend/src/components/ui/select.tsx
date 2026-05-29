import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-google-blue/70 focus:ring-2 focus:ring-google-blue/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
