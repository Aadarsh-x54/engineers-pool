"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api";
import { setToken } from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: string;
              text?: string;
              shape?: "rectangular" | "pill" | "circle" | "square";
            }
          ) => void;
        };
      };
    };
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@engineerspool.local");
  const [password, setPassword] = useState("0000");
  const [loading, setLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    try {
      const authData = await adminApi.googleLogin(response.credential);
      setToken(authData.token);
      toast.success("Google login successful.");
      router.replace("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined" || !googleClientId) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLogin,
          });
          const container = document.getElementById("google-signin-btn");
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width: "384",
              shape: "rectangular",
            });
          }
        } catch (err) {
          console.error("Failed to initialize Google login:", err);
        }
      } else if (attempts > 50) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [googleClientId, handleGoogleLogin]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await adminApi.login(email, password);
      setToken(response.token);
      toast.success("Admin login successful.");
      router.replace("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
          <Card className="p-6 bg-zinc-950/80 border border-white/10 backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Admin Login</h1>
                <p className="text-sm text-zinc-400">Protected upload and catalog management</p>
                <p className="mt-1 text-xs text-zinc-500">Development password: 0000</p>
              </div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-white hover:bg-zinc-200 text-black" disabled={loading}>
                {loading ? "Signing in" : "Sign in"}
              </Button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <span className="absolute inset-x-0 border-t border-white/10"></span>
              <span className="relative bg-zinc-950 px-3 text-xs uppercase text-zinc-500">Or continue with</span>
            </div>

            {googleClientId ? (
              <div className="flex justify-center">
                <div id="google-signin-btn" className="w-full min-h-[40px] flex items-center justify-center" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center">
                <p className="text-xs text-zinc-500">
                  Configure <code className="text-zinc-400">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in environment to enable Google Sign-In.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
