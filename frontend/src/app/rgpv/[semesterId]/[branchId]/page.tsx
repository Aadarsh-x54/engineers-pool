"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { EmptyState } from "@/components/public/empty-state";
import { NoteCard } from "@/components/public/note-card";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { Badge } from "@/components/ui/badge";
import { publicApi } from "@/lib/api";
import type { CatalogOption, Note } from "@/types/api";

type PageProps = {
  params: {
    semesterId: string;
    branchId: string;
  };
};

export default function BranchNotesPage({ params }: PageProps) {
  const semesterId = Number(params.semesterId);
  const branchId = Number(params.branchId);
  const [notes, setNotes] = useState<Note[]>([]);
  const [branches, setBranches] = useState<CatalogOption[]>([]);
  const [semesters, setSemesters] = useState<CatalogOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [noteList, branchOptions, semesterOptions] = await Promise.all([
          publicApi.rgpvNotes({ semester: semesterId, branch: branchId }),
          publicApi.branches(semesterId),
          publicApi.semesters()
        ]);
        if (!mounted) return;
        setNotes(noteList);
        setBranches(branchOptions);
        setSemesters(semesterOptions);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load notes.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [branchId, semesterId]);

  const branch = useMemo(() => branches.find((item) => item.id === branchId), [branchId, branches]);
  const semester = useMemo(() => semesters.find((item) => item.id === semesterId), [semesterId, semesters]);
  const grouped = useMemo(() => {
    return notes.reduce<Record<string, Note[]>>((acc, note) => {
      const key = note.subject?.name ?? "Other Notes";
      acc[key] = [...(acc[key] ?? []), note];
      return acc;
    }, {});
  }, [notes]);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "RGPV Notes", href: "/rgpv" },
          { label: semester?.name ?? `Semester ${semesterId}`, href: `/rgpv/${semesterId}` },
          { label: branch?.name ?? `Branch ${branchId}` }
        ]}
      />
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-white">{branch?.fullName ?? branch?.name ?? "Branch Notes"}</h1>
          {branch?.code ? <Badge tone="blue">{branch.code}</Badge> : null}
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {semester?.name ?? `Semester ${semesterId}`} notes grouped by subject.
        </p>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : notes.length ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([subject, subjectNotes]) => (
            <section key={subject}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">{subject}</h2>
                <Badge>{subjectNotes.length} files</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjectNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notes uploaded yet"
          description="This semester and branch is ready. Admin-uploaded subject notes will appear here after publishing."
        />
      )}
    </PageShell>
  );
}
