"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code2, FileText, FolderOpen, MessageCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/public/page-shell";
import { SearchBar } from "@/components/public/search-bar";
import { NoteCard } from "@/components/public/note-card";
import { WhatsappCard } from "@/components/public/whatsapp-card";
import { EmptyState } from "@/components/public/empty-state";
import { SkeletonGrid } from "@/components/public/skeleton-grid";
import { Card } from "@/components/ui/card";
import { publicApi } from "@/lib/api";
import type { Note } from "@/types/api";

const sections = [
  {
    title: "RGPV Notes",
    description: "Semester, branch and subject wise material.",
    href: "/rgpv",
    icon: BookOpen,
    tone: "bg-google-blue"
  },
  {
    title: "Programming Notes",
    description: "Topic groups kept in clean learning order.",
    href: "/programming",
    icon: Code2,
    tone: "bg-google-green"
  },
  {
    title: "Common Documents",
    description: "Syllabus, forms, timetables and shared files.",
    href: "/common",
    icon: FileText,
    tone: "bg-google-yellow"
  }
];

export default function HomePage() {
  const [recent, setRecent] = useState<Note[]>([]);
  const [popular, setPopular] = useState<Note[]>([]);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [whatsapp, setWhatsapp] = useState("8839173936");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [recentNotes, popularNotes, setting] = await Promise.all([
          publicApi.recent(),
          publicApi.popular(),
          publicApi.whatsapp()
        ]);
        if (!mounted) return;
        setRecent(recentNotes);
        setPopular(popularNotes);
        setWhatsapp(setting.value);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load home data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      setSearchResults(await publicApi.search(value));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  const hasSearch = query.trim().length > 0;
  const primaryNotes = useMemo(() => (hasSearch ? searchResults : recent), [hasSearch, recent, searchResults]);

  return (
    <PageShell>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
              <FolderOpen className="h-4 w-4 text-google-blue" />
              RGPV and programming notes
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              Engineers Pool
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Engineering notes, programming resources, and RGPV materials in one clean place.
            </p>
          </motion.div>
          <div className="mt-7">
            <SearchBar onSearch={handleSearch} loading={searching} />
          </div>
        </div>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-google-blue text-black">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Fast access</p>
              <h2 className="text-lg font-semibold text-white">Organized by real student paths</h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/[0.05] p-3">
              <p className="text-xl font-semibold text-white">8</p>
              <p className="text-xs text-zinc-500">Semesters</p>
            </div>
            <div className="rounded-xl bg-white/[0.05] p-3">
              <p className="text-xl font-semibold text-white">32</p>
              <p className="text-xs text-zinc-500">Branches</p>
            </div>
            <div className="rounded-xl bg-white/[0.05] p-3">
              <p className="text-xl font-semibold text-white">14</p>
              <p className="text-xs text-zinc-500">Topics</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-black ${section.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-white">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{section.description}</p>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="mt-8">
        <WhatsappCard number={whatsapp} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {hasSearch ? `Search results for "${query}"` : "Recently Added Notes"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {hasSearch ? "Matches across subjects, branches and programming categories." : "Fresh uploads from the admin library."}
            </p>
          </div>
        </div>
        {loading || searching ? (
          <SkeletonGrid />
        ) : primaryNotes.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {primaryNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState title="No notes found" description="Try a different search term or check the RGPV and programming sections." />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-white">Popular Downloads</h2>
          <p className="mt-1 text-sm text-zinc-400">Most downloaded files across the platform.</p>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : popular.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <EmptyState title="No downloads yet" description="Popular notes will appear after students start downloading material." />
        )}
      </section>
    </PageShell>
  );
}
