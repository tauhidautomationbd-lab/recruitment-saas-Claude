import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ui, stageLabel } from "@/lib/ui";

const STAGE_ORDER = ["applied", "screening", "shortlisted", "interview", "selected", "hired", "rejected", "no_show"];

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, stage, created_at, updated_at, jobs(title)");

  const apps = applications || [];

  const funnel: Record<string, number> = {};
  for (const stage of STAGE_ORDER) funnel[stage] = 0;
  for (const app of apps) funnel[app.stage] = (funnel[app.stage] || 0) + 1;

  const totalApplied = apps.length;

  const jobStats: Record<
    string,
    { title: string; total: number; shortlisted: number; interview: number; selected: number; hired: number }
  > = {};
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
    <div>
      <h1 className={ui.pageTitle}>Recruitment Analytics</h1>
      <p className="mt-1 text-sm text-ink-500">নিয়োগ প্রক্রিয়ার সার্বিক চিত্র</p>

      {totalApplied === 0 ? (
        <div className={`${ui.card} mt-8 text-center`}>
          <p className="text-sm text-ink-500">এখনো কোনো candidate ডেটা নেই।</p>
        </div>
      ) : (
        <>
          <h2 className={`${ui.sectionTitle} mt-8 mb-3`}>Overall Hiring Funnel — {totalApplied} candidates</h2>
          <div className="grid grid-cols-4 gap-3">
            {STAGE_ORDER.map((stage) => (
              <div key={stage} className={ui.cardFlat}>
                <div className="text-2xl font-semibold text-ink-900">{funnel[stage]}</div>
                <div className="mt-0.5 text-xs text-ink-600">{stageLabel[stage]}</div>
                <div className="text-xs text-ink-400">{pct(funnel[stage])}%</div>
              </div>
            ))}
          </div>

          <h2 className={`${ui.sectionTitle} mt-8 mb-3`}>Time-to-Hire</h2>
          <div className={ui.cardFlat}>
            <p className="text-sm text-ink-700">
              {avgTimeToHireDays !== null
                ? `গড়ে ${avgTimeToHireDays} দিন লাগছে (Applied → Hired), ${hiredApps.length} জন hired candidate-এর ভিত্তিতে।`
                : "এখনো কোনো candidate hire করা হয়নি।"}
            </p>
          </div>

          <h2 className={`${ui.sectionTitle} mt-8 mb-3`}>Job-wise Breakdown</h2>
          <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-ink-50">
                  <th className={ui.tableHeadCell}>Job</th>
                  <th className={ui.tableHeadCell}>Total</th>
                  <th className={ui.tableHeadCell}>Shortlist Rate</th>
                  <th className={ui.tableHeadCell}>Interview Rate</th>
                  <th className={ui.tableHeadCell}>Selection Rate</th>
                  <th className={ui.tableHeadCell}>Hired</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(jobStats).map((job, i) => (
                  <tr key={i} className={ui.tableRow}>
                    <td className={ui.tableCell}>{job.title}</td>
                    <td className={ui.tableCell}>{job.total}</td>
                    <td className={ui.tableCell}>{job.total > 0 ? Math.round((job.shortlisted / job.total) * 100) : 0}%</td>
                    <td className={ui.tableCell}>{job.total > 0 ? Math.round((job.interview / job.total) * 100) : 0}%</td>
                    <td className={ui.tableCell}>{job.total > 0 ? Math.round((job.selected / job.total) * 100) : 0}%</td>
                    <td className={ui.tableCell}>{job.hired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
