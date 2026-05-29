import { UploadNoteForm } from "@/components/admin/upload-note-form";

export default function UploadProgrammingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Upload Programming Note</h1>
        <p className="mt-2 text-sm text-zinc-400">Attach a verified programming resource to one ordered category.</p>
      </div>
      <UploadNoteForm mode="programming" />
    </div>
  );
}
