import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ui } from "@/lib/ui";

export default async function HrDashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, location, created_at, applications(count)")
    .order("created_at", { ascending: false });

  const canPostJob = profile?.role !== "interviewer";

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={ui.pageTitle}>জব পোস্টিং</h1>
          <p className="mt-1 text-sm text-ink-500">আপনার সব নিয়োগ প্রক্রিয়া একজায়গায়</p>
        </div>
        {canPostJob && (
          <Link href="/hr/dashboard/jobs/new" className={ui.btnPrimary}>
            + নতুন জব পোস্ট করুন
          </Link>
        )}
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Link
              key={job.id}
              href={`/hr/dashboard/jobs/${job.id}`}
              className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-5 py-4 transition-colors hover:border-brand-500"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{job.title}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {job.location} · {job.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-900">{job.applications?.[0]?.count || 0}</p>
                <p className="text-xs text-ink-500">candidates</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={`${ui.card} text-center`}>
          <p className="text-sm text-ink-500">এখনো কোনো job posting নেই।</p>
          {canPostJob && (
            <Link href="/hr/dashboard/jobs/new" className={`${ui.btnPrimary} mt-4 inline-flex`}>
              + প্রথম জবটি পোস্ট করুন
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
