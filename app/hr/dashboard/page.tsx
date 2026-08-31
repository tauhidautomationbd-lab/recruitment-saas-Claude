import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function HrDashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company_id")
    .eq("id", user!.id)
    .single();

  const { data: company } = await supabase
    .from("companies")
    .select("name, subscription_plan")
    .eq("id", profile?.company_id)
    .single();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at, applications(count)")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22 }}>{company?.name || "Your Company"}</h1>
          <p style={{ color: "#666" }}>
            স্বাগতম, {profile?.full_name} ({profile?.role}) — Plan: {company?.subscription_plan}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/hr/dashboard/analytics" style={{ fontSize: 14, color: "#0070f3" }}>
            📊 Analytics দেখুন
          </Link>
          <Link href="/hr/dashboard/audit-log" style={{ fontSize: 14, color: "#0070f3" }}>
            📋 Audit Log
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Job Postings</h2>
        <Link
          href="/hr/dashboard/jobs/new"
          style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
        >
          + Post New Job
        </Link>
      </div>

      {jobs && jobs.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {jobs.map((job: any) => (
            <li key={job.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <Link href={`/hr/dashboard/jobs/${job.id}`} style={{ color: "#111", textDecoration: "none" }}>
                <strong>{job.title}</strong>
              </Link>
              <span style={{ color: "#888", marginLeft: 8 }}>
                {job.status} — {job.applications?.[0]?.count || 0} candidate(s)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#888" }}>এখনো কোনো job posting নেই — "+ Post New Job" দিয়ে প্রথমটা তৈরি করুন।</p>
      )}
    </main>
  );
}
