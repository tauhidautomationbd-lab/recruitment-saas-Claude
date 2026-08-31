import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const STAGE_ORDER = ["applied", "screening", "shortlisted", "interview", "selected", "hired", "rejected", "no_show"];
const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screened",
  shortlisted: "Shortlisted",
  interview: "Interview",
  selected: "Selected",
  hired: "Hired",
  rejected: "Rejected",
  no_show: "No Show",
};

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, stage, created_at, updated_at, jobs(title)");

  const apps = applications || [];

  // ---------- Overall funnel ----------
  const funnel: Record<string, number> = {};
  for (const stage of STAGE_ORDER) funnel[stage] = 0;
  for (const app of apps) {
    funnel[app.stage] = (funnel[app.stage] || 0) + 1;
  }

  const totalApplied = apps.length;

  // ---------- Per-job breakdown ----------
  const jobStats: Record<string, { title: string; total: number; shortlisted: number; interview: number; selected: number; hired: number }> = {};
  for (const app of apps) {
    const jobTitle = (app as any).jobs?.title || "Unknown Job";
    if (!jobStats[app.job_id]) {
      jobStats[app.job_id] = { title: jobTitle, total: 0, shortlisted: 0, interview: 0, selected: 0, hired: 0 };
    }
    jobStats[app.job_id].total++;
    if (["shortlisted", "interview", "selected", "hired"].includes(app.stage)) jobStats[app.job_id].shortlisted++;
    if (["interview", "selected", "hired"].includes(app.stage)) jobStats[app.job_id].interview++;
    if (["selected", "hired"].includes(app.stage)) jobStats[app.job_id].selected++;
    if (app.stage === "hired") jobStats[app.job_id].hired++;
  }

  // ---------- Time to hire (average days from applied to hired) ----------
  const hiredApps = apps.filter((a) => a.stage === "hired");
  let avgTimeToHireDays: number | null = null;
  if (hiredApps.length > 0) {
    const totalDays = hiredApps.reduce((sum, a) => {
      const created = new Date(a.created_at).getTime();
      const updated = new Date(a.updated_at).getTime();
      return sum + (updated - created) / (1000 * 60 * 60 * 24);
    }, 0);
    avgTimeToHireDays = Math.round((totalDays / hiredApps.length) * 10) / 10;
  }

  const pct = (n: number) => (totalApplied > 0 ? Math.round((n / totalApplied) * 100) : 0);

  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <Link href="/hr/dashboard" style={{ fontSize: 14, color: "#666" }}>
        ← Dashboard-এ ফিরে যান
      </Link>

      <h1 style={{ fontSize: 22, marginTop: 12 }}>Recruitment Analytics</h1>

      {totalApplied === 0 ? (
        <p style={{ color: "#888", marginTop: 24 }}>এখনো কোনো candidate ডেটা নেই।</p>
      ) : (
        <>
          <h2 style={{ fontSize: 16, marginTop: 32 }}>Overall Hiring Funnel ({totalApplied} total candidates)</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                style={{ padding: "12px 16px", background: "#f7f7f7", borderRadius: 8, minWidth: 110, textAlign: "center" }}
              >
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{funnel[stage]}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{STAGE_LABELS[stage]}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{pct(funnel[stage])}%</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 16, marginTop: 32 }}>Time-to-Hire</h2>
          <p style={{ marginTop: 8 }}>
            {avgTimeToHireDays !== null
              ? `গড়ে ${avgTimeToHireDays} দিন লাগছে (Applied → Hired), ${hiredApps.length} জন hired candidate-এর ভিত্তিতে।`
              : "এখনো কোনো candidate hire করা হয়নি।"}
          </p>

          <h2 style={{ fontSize: 16, marginTop: 32 }}>Job-wise Breakdown</h2>
          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: 8 }}>Job</th>
                <th style={{ padding: 8 }}>Total</th>
                <th style={{ padding: 8 }}>Shortlist Rate</th>
                <th style={{ padding: 8 }}>Interview Rate</th>
                <th style={{ padding: 8 }}>Selection Rate</th>
                <th style={{ padding: 8 }}>Hired</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(jobStats).map((job, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{job.title}</td>
                  <td style={{ padding: 8 }}>{job.total}</td>
                  <td style={{ padding: 8 }}>
                    {job.total > 0 ? Math.round((job.shortlisted / job.total) * 100) : 0}%
                  </td>
                  <td style={{ padding: 8 }}>{job.total > 0 ? Math.round((job.interview / job.total) * 100) : 0}%</td>
                  <td style={{ padding: 8 }}>{job.total > 0 ? Math.round((job.selected / job.total) * 100) : 0}%</td>
                  <td style={{ padding: 8 }}>{job.hired}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
