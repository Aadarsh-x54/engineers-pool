"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { BarChart3, BookOpen, Database, FileUp, LogOut, Settings, Shield, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearToken, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/notes", label: "Manage Notes", icon: BookOpen },
  { href: "/admin/upload/rgpv", label: "Upload RGPV", icon: FileUp },
  { href: "/admin/upload/programming", label: "Upload Programming", icon: UploadCloud },
  { href: "/admin/catalog", label: "Catalog", icon: Database },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-black" />;
  }

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-black/90 p-5 backdrop-blur-xl lg:block">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-zinc-400">Admin</p>
            <h1 className="font-semibold text-white">Engineers Pool</h1>
          </div>
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-zinc-400 transition hover:bg-white/[0.08] hover:text-white",
                  active && "bg-white/[0.08] text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button onClick={logout} variant="secondary" className="absolute bottom-5 left-5 right-5">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/admin" className="flex items-center gap-2 font-semibold text-white">
              <Shield className="h-5 w-5" />
              Admin
            </Link>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm text-zinc-400",
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
        <main className="container py-8">{children}</main>
      </div>
    </div>
  );
}
