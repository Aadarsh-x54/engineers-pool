import { UploadNoteForm } from "@/components/admin/upload-note-form";

export default function UploadRgpvPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Upload RGPV Note</h1>
        <p className="mt-2 text-sm text-zinc-400">Attach a verified file to semester, branch and subject.</p>
      </div>
      <UploadNoteForm mode="rgpv" />
    </div>
  );
}
