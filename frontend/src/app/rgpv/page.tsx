"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { EmptyState } from "@/components/public/empty-state";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { Card } from "@/components/ui/card";
import { publicApi } from "@/lib/api";
import type { CatalogOption } from "@/types/api";

export default function RgpvPage() {
  const [semesters, setSemesters] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .semesters()
      .then(setSemesters)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load semesters."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "RGPV Notes" }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">RGPV Notes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Pick a semester first. Branches, subjects and notes stay aligned after that.
        </p>
      </div>

      {loading ? (
        <SkeletonGrid count={9} />
      ) : semesters.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <Link key={semester.id} href={`/rgpv/${semester.id}`}>
              <Card className="flex h-full items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-google-blue text-black">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{semester.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Browse branch-wise notes</p>
                </div>
              </Card>
            </Link>
          ))}
          <Link href="/common">
            <Card className="flex h-full items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-google-yellow text-black">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Common Documents</h2>
                <p className="mt-1 text-sm text-zinc-400">Shared RGPV files and forms</p>
              </div>
            </Card>
          </Link>
        </div>
      ) : (
        <EmptyState title="No semesters found" description="The admin catalog does not have active semesters yet." />
      )}
    </PageShell>
  );
}
