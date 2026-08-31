import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CvLink from "./CvLink";
import RunScreeningButton from "./RunScreeningButton";
import ApplicationActions from "./ApplicationActions";

export default async function JobDetailPage({ params }: { params: { jobId: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, location, status, required_skills")
    .eq("id", params.jobId)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, stage, ai_score, ai_recommendation, created_at, candidates(id, full_name, email, phone, cv_file_url, source, is_duplicate_of)"
    )
    .eq("job_id", params.jobId)
    .order("ai_score", { ascending: false, nullsFirst: false });

  if (!job) {
    return (
      <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
        <p>এই Job খুঁজে পাওয়া যায়নি (অন্য company-র হতে পারে)।</p>
      </main>
    );
  }

  const pendingCount = (applications || []).filter((a: any) => a.stage === "applied").length;

  const stageLabels: Record<string, string> = {
    applied: "Applied",
    screening: "Screened",
    shortlisted: "Shortlisted",
    interview: "Interview",
    selected: "Selected",
    rejected: "Rejected",
    hired: "Hired",
    no_show: "No Show",
  };

  return (
    <main style={{ padding: 40, maxWidth: 950, margin: "0 auto" }}>
      <Link href="/hr/dashboard" style={{ fontSize: 14, color: "#666" }}>
        ← সব Job-এ ফিরে যান
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>{job.title}</h1>
          <p style={{ color: "#666", margin: "4px 0" }}>
            {job.location} — <span>{job.status}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/hr/dashboard/jobs/${job.id}/upload`}
            style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
          >
            + Bulk Upload CV
          </Link>
        </div>
      </div>

      {pendingCount > 0 && (
        <div style={{ marginTop: 16, padding: 16, background: "#f7f7f7", borderRadius: 8 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 14 }}>
            {pendingCount} জন candidate এখনো AI screen করা হয়নি।
          </p>
          <RunScreeningButton jobId={job.id} />
        </div>
      )}

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Candidates ({applications?.length || 0})</h2>

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>নাম</th>
            <th style={{ padding: 8 }}>Score</th>
            <th style={{ padding: 8 }}>Recommendation</th>
            <th style={{ padding: 8 }}>Stage</th>
            <th style={{ padding: 8 }}>CV</th>
            <th style={{ padding: 8 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications?.map((app: any) => (
            <tr key={app.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>
                {app.candidates?.full_name || "নাম নেই"}
                {app.candidates?.is_duplicate_of && (
                  <span style={{ color: "#c00", fontSize: 12, marginLeft: 6 }}>(duplicate)</span>
                )}
                {app.candidates?.email && (
                  <div style={{ color: "#888", fontSize: 12 }}>{app.candidates.email}</div>
                )}
              </td>
              <td style={{ padding: 8 }}>{app.ai_score !== null ? `${app.ai_score}/100` : "-"}</td>
              <td style={{ padding: 8, maxWidth: 200 }}>{app.ai_recommendation || "-"}</td>
              <td style={{ padding: 8 }}>{stageLabels[app.stage] || app.stage}</td>
              <td style={{ padding: 8 }}>
                {app.candidates?.cv_file_url ? <CvLink storagePath={app.candidates.cv_file_url} /> : "-"}
              </td>
              <td style={{ padding: 8 }}>
                <ApplicationActions applicationId={app.id} stage={app.stage} />
              </td>
            </tr>
          ))}
          {(!applications || applications.length === 0) && (
            <tr>
              <td colSpan={6} style={{ padding: 16, color: "#888", textAlign: "center" }}>
                এখনো কোনো candidate আসেনি — "+ Bulk Upload CV" দিয়ে CV যোগ করুন
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
