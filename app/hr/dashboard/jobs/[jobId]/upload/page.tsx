"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user!.id)
      .single();

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
    <main style={{ padding: 40, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Bulk CV Upload</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        একসাথে অনেকগুলো CV (PDF/DOC) সিলেক্ট করুন। প্রতিটার জন্য একটা candidate record তৈরি হবে —
        নাম/ইমেইল পরে AI screening ধাপে CV থেকে বের করা হবে।
      </p>

      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFiles(e.target.files)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 6 }}
        />

        {status && <p style={{ fontSize: 14, color: "#0070f3" }}>{status}</p>}
        {error && <p style={{ fontSize: 14, color: "red" }}>{error}</p>}

        <button
          type="submit"
          disabled={uploading || !files}
          style={{ padding: 12, borderRadius: 6, background: "#111", color: "#fff", border: "none" }}
        >
          {uploading ? "Upload হচ্ছে..." : "Upload শুরু করুন"}
        </button>
      </form>
    </main>
  );
}
