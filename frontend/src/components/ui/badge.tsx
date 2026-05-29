import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "green" | "yellow" | "red" | "neutral";
};

const tones = {
  blue: "border-google-blue/30 bg-google-blue/10 text-google-blue",
  green: "border-google-green/30 bg-google-green/10 text-google-green",
  yellow: "border-google-yellow/30 bg-google-yellow/10 text-google-yellow",
  red: "border-google-red/30 bg-google-red/10 text-google-red",
  neutral: "border-white/10 bg-white/[0.08] text-zinc-300"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
