import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ACTION_LABELS: Record<string, string> = {
  "application.shortlisted": "Candidate Shortlist করা হয়েছে",
  "application.rejected": "Candidate Reject করা হয়েছে",
  "application.selected": "Candidate Select করা হয়েছে",
  "application.screening": "Stage পরিবর্তন হয়েছে",
  "interview.scheduled": "Interview Schedule করা হয়েছে",
  "job.ai_screening_run": "AI Screening চালানো হয়েছে",
  "candidates.bulk_uploaded": "CV Bulk Upload করা হয়েছে",
};

export default async function AuditLogPage() {
  const supabase = createSupabaseServerClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, target_type, metadata, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <Link href="/hr/dashboard" style={{ fontSize: 14, color: "#666" }}>
        ← Dashboard-এ ফিরে যান
      </Link>

      <h1 style={{ fontSize: 22, marginTop: 12 }}>Audit Log</h1>
      <p style={{ color: "#666", fontSize: 14 }}>সাম্প্রতিক ১০০টা কার্যকলাপ (সবচেয়ে নতুনটা উপরে)</p>

      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>সময়</th>
            <th style={{ padding: 8 }}>কে করেছে</th>
            <th style={{ padding: 8 }}>কাজ</th>
            <th style={{ padding: 8 }}>বিস্তারিত</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log: any) => (
            <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8, whiteSpace: "nowrap", color: "#666", fontSize: 12 }}>
                {new Date(log.created_at).toLocaleString("bn-BD")}
              </td>
              <td style={{ padding: 8 }}>{log.profiles?.full_name || "System"}</td>
              <td style={{ padding: 8 }}>{ACTION_LABELS[log.action] || log.action}</td>
              <td style={{ padding: 8, fontSize: 12, color: "#666" }}>
                {log.metadata?.candidateName && <span>{log.metadata.candidateName}</span>}
                {log.metadata?.count && <span>{log.metadata.count} টা</span>}
                {log.metadata?.processed !== undefined && (
                  <span>
                    {log.metadata.processed} সফল, {log.metadata.failedCount || 0} ব্যর্থ
                  </span>
                )}
              </td>
            </tr>
          ))}
          {(!logs || logs.length === 0) && (
            <tr>
              <td colSpan={4} style={{ padding: 16, color: "#888", textAlign: "center" }}>
                এখনো কোনো কার্যকলাপ রেকর্ড হয়নি।
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
