"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, FileText, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rgpv", label: "RGPV", icon: BookOpen },
  { href: "/programming", label: "Programming", icon: Code2 },
  { href: "/common", label: "Common", icon: FileText }
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Engineers Pool home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-soft">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-base font-semibold tracking-normal text-white sm:inline">Engineers Pool</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white",
                  active && "bg-white/[0.08] text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/login">
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </Button>
      </div>
      <nav className="container flex gap-1 overflow-x-auto pb-3 md:hidden">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm text-zinc-400 transition",
                active && "bg-white/[0.08] text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
