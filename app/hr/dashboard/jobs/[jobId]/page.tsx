import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CvLink from "./CvLink";

export default async function JobDetailPage({ params }: { params: { jobId: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, location, status, required_skills")
    .eq("id", params.jobId)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, stage, ai_score, created_at, candidates(id, full_name, email, phone, cv_file_url, source)")
    .eq("job_id", params.jobId)
    .order("created_at", { ascending: false });

  if (!job) {
    return (
      <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
        <p>এই Job খুঁজে পাওয়া যায়নি (অন্য company-র হতে পারে)।</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <Link href="/hr/dashboard" style={{ fontSize: 14, color: "#666" }}>
        ← সব Job-এ ফিরে যান
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>{job.title}</h1>
          <p style={{ color: "#666", margin: "4px 0" }}>
            {job.location} — <span>{job.status}</span>
          </p>
        </div>
        <Link
          href={`/hr/dashboard/jobs/${job.id}/upload`}
          style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
        >
          + Bulk Upload CV
        </Link>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Candidates ({applications?.length || 0})</h2>

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>নাম</th>
            <th style={{ padding: 8 }}>Source</th>
            <th style={{ padding: 8 }}>Stage</th>
            <th style={{ padding: 8 }}>CV</th>
          </tr>
        </thead>
        <tbody>
          {applications?.map((app: any) => (
            <tr key={app.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{app.candidates?.full_name || "নাম নেই"}</td>
              <td style={{ padding: 8 }}>{app.candidates?.source}</td>
              <td style={{ padding: 8 }}>{app.stage}</td>
              <td style={{ padding: 8 }}>
                {app.candidates?.cv_file_url ? (
                  <CvLink storagePath={app.candidates.cv_file_url} />
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {(!applications || applications.length === 0) && (
            <tr>
              <td colSpan={4} style={{ padding: 16, color: "#888", textAlign: "center" }}>
                এখনো কোনো candidate আসেনি — "+ Bulk Upload CV" দিয়ে CV যোগ করুন
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
