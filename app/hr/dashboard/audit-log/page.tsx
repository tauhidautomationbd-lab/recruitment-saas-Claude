import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ui } from "@/lib/ui";

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
    <div>
      <h1 className={ui.pageTitle}>Audit Log</h1>
      <p className="mt-1 text-sm text-ink-500">সাম্প্রতিক ১০০টা কার্যকলাপ (সবচেয়ে নতুনটা উপরে)</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50">
              <th className={ui.tableHeadCell}>সময়</th>
              <th className={ui.tableHeadCell}>কে করেছে</th>
              <th className={ui.tableHeadCell}>কাজ</th>
              <th className={ui.tableHeadCell}>বিস্তারিত</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log: any) => (
              <tr key={log.id} className={ui.tableRow}>
                <td className={`${ui.tableCell} whitespace-nowrap text-xs text-ink-500`}>
                  {new Date(log.created_at).toLocaleString("bn-BD")}
                </td>
                <td className={ui.tableCell}>{log.profiles?.full_name || "System"}</td>
                <td className={ui.tableCell}>{ACTION_LABELS[log.action] || log.action}</td>
                <td className="px-4 py-3 text-xs text-ink-500">
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
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-500">
                  এখনো কোনো কার্যকলাপ রেকর্ড হয়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
