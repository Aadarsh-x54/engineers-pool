"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { EmptyState } from "@/components/public/empty-state";
import { NoteCard } from "@/components/public/note-card";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { publicApi } from "@/lib/api";
import type { Note } from "@/types/api";

export default function CommonDocumentsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .common()
      .then(setNotes)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load common documents."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Common Documents" }]} />
      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-google-yellow text-black">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-semibold text-white">Common Documents</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Syllabus, academic notices, forms, timetables and other shared engineering documents.
        </p>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : notes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState title="No common documents yet" description="Published common documents will appear here." />
      )}
    </PageShell>
  );
}
