"use client";

import { useEffect, useState } from "react";
import { BookOpen, Code2, Download, FileText, Layers } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";
import { NoteCard } from "@/components/public/note-card";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { EmptyState } from "@/components/public/empty-state";
import { adminApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { DashboardStats } from "@/types/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminApi
      .dashboard(token)
      .then(setStats)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">Overview of notes, downloads and recently uploaded files.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total notes" value={stats?.totalNotes ?? 0} icon={Layers} />
        <StatCard label="Downloads" value={stats?.totalDownloads ?? 0} icon={Download} />
        <StatCard label="RGPV materials" value={stats?.totalRgpvMaterials ?? 0} icon={BookOpen} />
        <StatCard label="Programming" value={stats?.totalProgrammingNotes ?? 0} icon={Code2} />
        <StatCard label="Common docs" value={stats?.totalCommonDocuments ?? 0} icon={FileText} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">Recently uploaded files</h2>
        {loading ? (
          <SkeletonGrid count={3} />
        ) : stats?.recentlyUploadedFiles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.recentlyUploadedFiles.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState title="No uploads yet" description="Uploaded and published files will appear in this dashboard." />
        )}
      </section>
    </div>
  );
}
