"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

export default function BulkUploadPage({ params }: { params: { jobId: string } }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user!.id).single();

    if (!profile?.company_id) {
      setError("Company profile পাওয়া যায়নি।");
      setUploading(false);
      return;
    }

    const uploadedFiles: { fileName: string; storagePath: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatus(`Upload হচ্ছে: ${file.name} (${i + 1}/${files.length})`);

      const storagePath = `${profile.company_id}/${params.jobId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("cvs").upload(storagePath, file);

      if (uploadError) {
        setError(`"${file.name}" upload ব্যর্থ: ${uploadError.message}`);
        continue;
      }

      uploadedFiles.push({ fileName: file.name, storagePath });
    }

    setStatus("Candidate record তৈরি হচ্ছে...");

    const res = await fetch("/api/hr/candidates/bulk-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: params.jobId, files: uploadedFiles }),
    });

    const result = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(result.error || "candidate তৈরি করতে সমস্যা হয়েছে");
      return;
    }

    setStatus(`সম্পন্ন — ${result.created} জন candidate যোগ হয়েছে।`);
    setTimeout(() => router.push(`/hr/dashboard/jobs/${params.jobId}`), 1500);
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href={`/hr/dashboard/jobs/${params.jobId}`} className="text-sm text-ink-500 hover:text-ink-700">
        ← Job-এ ফিরে যান
      </Link>
      <h1 className={`${ui.pageTitle} mt-3 mb-2`}>Bulk CV Upload</h1>
      <p className="mb-6 text-sm text-ink-500">
        একসাথে অনেকগুলো CV (PDF/DOCX) সিলেক্ট করুন। পুরনো .doc ফরম্যাট সাপোর্ট করে না — .pdf বা .docx ব্যবহার করুন।
      </p>

      <form onSubmit={handleUpload} className={`${ui.card} space-y-4`}>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFiles(e.target.files)}
          className="w-full rounded-md border border-ink-300 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100"
        />

        {status && <p className="text-sm text-brand-600">{status}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={uploading || !files} className={`${ui.btnPrimary} w-full`}>
          {uploading ? "Upload হচ্ছে..." : "Upload শুরু করুন"}
        </button>
      </form>
    </div>
  );
}
