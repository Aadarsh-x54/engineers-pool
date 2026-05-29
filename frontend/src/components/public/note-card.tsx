"use client";

import { Calendar, Download, Eye, FileArchive, FileText, HardDrive, Tags } from "lucide-react";
import type { Note } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { absoluteApiUrl, formatDate } from "@/lib/utils";

const fileIcon = {
  PDF: FileText,
  DOC: FileText,
  DOCX: FileText,
  PPT: FileText,
  PPTX: FileText,
  ZIP: FileArchive
};

export function NoteCard({ note }: { note: Note }) {
  const Icon = fileIcon[note.fileType] ?? FileText;
  const subject = note.subject?.name ?? note.programmingCategory?.name ?? "Common document";
  const previewUrl = absoluteApiUrl(`/api/notes/${note.id}/preview`);

  return (
    <Card className="group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-black">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white">{note.title}</h3>
          <p className="mt-1 truncate text-sm text-zinc-400">{subject}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-zinc-400">
        {note.semester || note.branch ? (
          <p className="truncate">
            {[note.semester?.name, note.branch?.name].filter(Boolean).join(" • ")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge tone={note.fileType === "PDF" ? "red" : "blue"}>{note.fileType}</Badge>
          <Badge tone="neutral">
            <HardDrive className="mr-1 h-3 w-3" />
            {note.readableFileSize}
          </Badge>
          <Badge tone="green">
            <Download className="mr-1 h-3 w-3" />
            {note.downloadCount}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          Uploaded {formatDate(note.createdAt)}
        </div>
        {note.tags?.length ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Tags className="h-3.5 w-3.5" />
            <span className="truncate">{note.tags.slice(0, 4).join(", ")}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-2">
        <Button asChild className="flex-1">
          <a href={absoluteApiUrl(note.downloadUrl)} download>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
        {note.fileType === "PDF" ? (
          <Button asChild variant="secondary" size="icon" title="Preview PDF">
            <a href={previewUrl} target="_blank" rel="noreferrer" aria-label={`Preview ${note.title}`}>
              <Eye className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
