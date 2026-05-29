"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GitBranch } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { EmptyState } from "@/components/public/empty-state";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { Card } from "@/components/ui/card";
import { publicApi } from "@/lib/api";
import type { CatalogOption } from "@/types/api";

type PageProps = {
  params: {
    semesterId: string;
  };
};

export default function BranchSelectionPage({ params }: PageProps) {
  const [branches, setBranches] = useState<CatalogOption[]>([]);
  const [semesters, setSemesters] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);
  const semesterId = Number(params.semesterId);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [branchOptions, semesterOptions] = await Promise.all([
          publicApi.branches(semesterId),
          publicApi.semesters()
        ]);
        if (!mounted) return;
        setBranches(branchOptions);
        setSemesters(semesterOptions);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load branches.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [semesterId]);

  const semester = useMemo(() => semesters.find((item) => item.id === semesterId), [semesterId, semesters]);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "RGPV Notes", href: "/rgpv" },
          { label: semester?.name ?? `Semester ${semesterId}` }
        ]}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">{semester?.name ?? `Semester ${semesterId}`}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Select your branch to see subjects and notes.</p>
      </div>

      {loading ? (
        <SkeletonGrid count={9} />
      ) : branches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Link key={branch.id} href={`/rgpv/${semesterId}/${branch.id}`}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-google-green text-black">
                    <GitBranch className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">{branch.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{branch.fullName ?? "RGPV branch"}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No branches found" description="The admin catalog does not have active branches yet." />
      )}
    </PageShell>
  );
}
