import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CvLink from "./CvLink";
import RunScreeningButton from "./RunScreeningButton";
import ApplicationActions from "./ApplicationActions";
import TalentPoolToggle from "./TalentPoolToggle";
import { ui, stageBadge, stageLabel } from "@/lib/ui";

export default async function JobDetailPage({ params }: { params: { jobId: string } }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();
  const canManage = profile?.role !== "interviewer";

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, description, location, status, required_skills")
    .eq("id", params.jobId)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "id, stage, ai_score, ai_recommendation, created_at, candidates(id, full_name, email, phone, cv_file_url, source, is_duplicate_of, in_talent_pool)"
    )
    .eq("job_id", params.jobId)
    .order("ai_score", { ascending: false, nullsFirst: false });

  if (!job) {
    return <p className="text-sm text-ink-500">এই Job খুঁজে পাওয়া যায়নি (অন্য company-র হতে পারে)।</p>;
  }

  const pendingCount = (applications || []).filter((a: any) => a.stage === "applied").length;

  return (
    <div>
      <Link href="/hr/dashboard" className={ui.backLink}>
        ← সব Job
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className={ui.pageTitle}>{job.title}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {job.location} · {job.status}
          </p>
        </div>
        {canManage && (
          <Link href={`/hr/dashboard/jobs/${job.id}/upload`} className={ui.btnPrimary}>
            + Bulk Upload CV
          </Link>
        )}
      </div>

      {canManage && pendingCount > 0 && (
        <div className={`${ui.card} mt-6 border-brand-100 bg-brand-50`}>
          <p className="text-sm text-ink-800">{pendingCount} জন candidate এখনো AI screen করা হয়নি।</p>
          <div className="mt-3">
            <RunScreeningButton jobId={job.id} />
          </div>
        </div>
      )}

      <h2 className={`${ui.sectionTitle} mt-8 mb-3`}>Candidates ({applications?.length || 0})</h2>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50">
              <th className={ui.tableHeadCell}>নাম</th>
              <th className={ui.tableHeadCell}>Score</th>
              <th className={ui.tableHeadCell}>Recommendation</th>
              <th className={ui.tableHeadCell}>Stage</th>
              <th className={ui.tableHeadCell}>CV</th>
              {canManage && <th className={ui.tableHeadCell}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {applications?.map((app: any) => (
              <tr key={app.id} className={ui.tableRow}>
                <td className={ui.tableCell}>
                  <span className="font-medium text-ink-900">{app.candidates?.full_name || "নাম নেই"}</span>
                  {app.candidates?.is_duplicate_of && (
                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">duplicate</span>
                  )}
                  {app.candidates?.email && <div className="text-xs text-ink-500">{app.candidates.email}</div>}
                  {canManage && (
                    <div className="mt-1">
                      <TalentPoolToggle candidateId={app.candidates.id} inPool={!!app.candidates?.in_talent_pool} />
                    </div>
                  )}
                </td>
                <td className={ui.tableCell}>
                  {app.ai_score !== null ? (
                    <span className="font-medium">{app.ai_score}/100</span>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </td>
                <td className={`${ui.tableCell} max-w-xs`}>
                  <span className="line-clamp-3 text-xs text-ink-600">{app.ai_recommendation || "—"}</span>
                </td>
                <td className={ui.tableCell}>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageBadge[app.stage] || "bg-ink-100 text-ink-700"}`}>
                    {stageLabel[app.stage] || app.stage}
                  </span>
                </td>
                <td className={ui.tableCell}>
                  {app.candidates?.cv_file_url ? <CvLink storagePath={app.candidates.cv_file_url} /> : "—"}
                </td>
                {canManage && (
                  <td className={ui.tableCell}>
                    <ApplicationActions applicationId={app.id} stage={app.stage} />
                  </td>
                )}
              </tr>
            ))}
            {(!applications || applications.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                  এখনো কোনো candidate আসেনি{canManage && ' — "+ Bulk Upload CV" দিয়ে CV যোগ করুন'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
