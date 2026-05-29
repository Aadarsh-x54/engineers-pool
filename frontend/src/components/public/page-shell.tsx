import type { ReactNode } from "react";
import { SiteHeader } from "@/components/public/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-8 sm:py-10">{children}</main>
    </div>
  );
}
