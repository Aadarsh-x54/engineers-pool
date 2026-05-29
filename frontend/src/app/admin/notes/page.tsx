"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Eye, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { UploadNoteForm } from "@/components/admin/upload-note-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { absoluteApiUrl, formatDate } from "@/lib/utils";
import type { Note, NoteType } from "@/types/api";

const noteTypes: Array<{ label: string; value: NoteType | "" }> = [
  { label: "All types", value: "" },
  { label: "RGPV", value: "RGPV" },
  { label: "Programming", value: "PROGRAMMING" },
  { label: "Common", value: "COMMON" }
];

export default function ManageNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState("");
  const [noteType, setNoteType] = useState<NoteType | "">("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Note | null>(null);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const response = await adminApi.notes(token, {
        q: query,
        noteType: noteType || undefined,
        size: 50
      });
      setNotes(response.content);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteType]);

  async function togglePublish(note: Note, published: boolean) {
    const token = getToken();
    if (!token) return;
    try {
      const updated = await adminApi.publish(token, note.id, published);
      setNotes((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(published ? "Note published." : "Note unpublished.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update publish state.");
    }
  }

  async function deleteNote(note: Note) {
    const token = getToken();
    if (!token) return;
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    try {
      await adminApi.deleteNote(token, note.id);
      setNotes((items) => items.filter((item) => item.id !== note.id));
      toast.success("Note deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete note.");
    }
  }

  async function updateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const token = getToken();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    try {
      const updated = await adminApi.updateNote(token, editing.id, form);
      setNotes((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setEditing(null);
      toast.success("Note updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update note.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Manage Notes</h1>
          <p className="mt-2 text-sm text-zinc-400">Search, filter, publish, unpublish and delete uploaded material.</p>
        </div>
        <Button onClick={load} variant="secondary">
          <Search className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="mb-6 p-5">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" />
          <Select value={noteType} onChange={(event) => setNoteType(event.target.value as NoteType | "")}>
            {noteTypes.map((type) => (
              <option key={type.label} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Button type="submit">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>

      {editing ? (
        <Card className="mb-6 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Edit note</h2>
              <p className="text-sm text-zinc-400">Update metadata or replace the file.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Close edit form">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={updateNote} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" name="title" defaultValue={editing.title} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" name="description" defaultValue={editing.description ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input id="edit-tags" name="tags" defaultValue={editing.tags.join(", ")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-file">Replace file</Label>
              <Input id="edit-file" name="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <Pencil className="h-4 w-4" />
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-zinc-400" colSpan={7}>
                    Loading notes
                  </td>
                </tr>
              ) : notes.length ? (
                notes.map((note) => (
                  <tr key={note.id} className="border-b border-white/10 last:border-0">
                    <td className="max-w-xs px-4 py-4">
                      <p className="truncate font-medium text-white">{note.title}</p>
                      <p className="mt-1 truncate text-xs text-zinc-500">{note.fileName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={note.noteType === "RGPV" ? "blue" : note.noteType === "PROGRAMMING" ? "green" : "yellow"}>
                        {note.noteType}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {[note.semester?.name, note.branch?.name, note.subject?.name, note.programmingCategory?.name]
                        .filter(Boolean)
                        .join(" / ") || "Common"}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{note.downloadCount}</td>
                    <td className="px-4 py-4 text-zinc-400">{formatDate(note.createdAt)}</td>
                    <td className="px-4 py-4">
                      <Switch checked={note.published} onCheckedChange={(checked) => togglePublish(note, checked)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button asChild variant="secondary" size="icon" title="Open file">
                          <a href={absoluteApiUrl(note.downloadUrl)} target="_blank" rel="noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="secondary" size="icon" onClick={() => setEditing(note)} title="Edit note">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="danger" size="icon" onClick={() => deleteNote(note)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-zinc-400" colSpan={7}>
                    No notes match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <Upload className="h-5 w-5 text-google-yellow" />
          <h2 className="text-xl font-semibold text-white">Upload Common Document</h2>
        </div>
        <UploadNoteForm mode="common" />
      </section>
    </div>
  );
}
