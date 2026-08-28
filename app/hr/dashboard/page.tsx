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

  // এই query RLS-এর কারণে শুধু নিজের company-র jobs-ই ফেরত দেবে
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 40, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22 }}>{company?.name || "Your Company"}</h1>
      <p style={{ color: "#666" }}>
        স্বাগতম, {profile?.full_name} ({profile?.role}) — Plan: {company?.subscription_plan}
      </p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Job Postings</h2>
      {jobs && jobs.length > 0 ? (
        <ul>
          {jobs.map((job) => (
            <li key={job.id} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              {job.title} — <span style={{ color: "#888" }}>{job.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#888" }}>এখনো কোনো job posting নেই।</p>
      )}
    </main>
  );
}
