"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { EmptyState } from "@/components/public/empty-state";
import { NoteCard } from "@/components/public/note-card";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { publicApi } from "@/lib/api";
import type { ProgrammingGroup } from "@/types/api";

export default function ProgrammingPage() {
  const [groups, setGroups] = useState<ProgrammingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    publicApi
      .programming()
      .then(setGroups)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load programming notes."))
      .finally(() => setLoading(false));
  }, []);

  const filteredGroups = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return groups;
    return groups
      .map((group) => ({
        ...group,
        notes: group.notes.filter((note) =>
          [note.title, note.description, note.fileName, note.programmingCategory?.name, ...note.tags]
            .filter(Boolean)
            .some((item) => item?.toLowerCase().includes(value))
        )
      }))
      .filter((group) => group.notes.length || group.category.name.toLowerCase().includes(value));
  }, [groups, query]);

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Programming Notes" }]} />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-google-green text-black">
            <Code2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold text-white">Programming Notes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Categories are kept grouped in admin-defined order, so Python files stay together, Java files stay together, and DSA files stay together.
          </p>
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter programming notes"
          className="lg:max-w-sm"
        />
      </div>

      {loading ? (
        <SkeletonGrid count={9} />
      ) : filteredGroups.length ? (
        <div className="space-y-10">
          {filteredGroups.map((group) => (
            <section key={group.category.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{group.category.name}</h2>
                  {group.category.description ? (
                    <p className="mt-1 text-sm text-zinc-400">{group.category.description}</p>
                  ) : null}
                </div>
                <Badge tone="green">{group.notes.length} files</Badge>
              </div>
              {group.notes.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No files in this category" description="Published notes for this programming category will appear here." />
              )}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No programming notes found" description="Try another filter or wait for admin-published programming notes." />
      )}
    </PageShell>
  );
}
