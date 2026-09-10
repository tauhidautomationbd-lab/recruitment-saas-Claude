import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ui, roleLabel, roleBadge } from "@/lib/ui";
import AddTeamMemberForm from "./AddTeamMemberForm";

export default async function TeamPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase.from("profiles").select("role, company_id").eq("id", user?.id).single();

  const isAdmin = myProfile?.role === "company_admin";

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active, created_at")
    .eq("company_id", myProfile?.company_id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={ui.pageTitle}>টিম</h1>
          <p className="mt-1 text-sm text-ink-500">আপনার company-র সব ইউজার ও তাদের role</p>
        </div>
        {isAdmin && <AddTeamMemberForm />}
      </div>

      {!isAdmin && (
        <div className={`${ui.cardFlat} mb-6 bg-amber-50 border-amber-100`}>
          <p className="text-sm text-amber-800">শুধুমাত্র Company Admin নতুন টিম মেম্বার যোগ করতে পারবে।</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50">
              <th className={ui.tableHeadCell}>নাম</th>
              <th className={ui.tableHeadCell}>Role</th>
              <th className={ui.tableHeadCell}>যোগ হয়েছে</th>
              <th className={ui.tableHeadCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => (
              <tr key={m.id} className={ui.tableRow}>
                <td className={`${ui.tableCell} font-medium text-ink-900`}>{m.full_name || "—"}</td>
                <td className={ui.tableCell}>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleBadge[m.role] || "bg-ink-100 text-ink-700"}`}>
                    {roleLabel[m.role] || m.role}
                  </span>
                </td>
                <td className={`${ui.tableCell} text-xs text-ink-500`}>
                  {new Date(m.created_at).toLocaleDateString("bn-BD")}
                </td>
                <td className={ui.tableCell}>
                  {m.is_active ? (
                    <span className="text-emerald-600">সক্রিয়</span>
                  ) : (
                    <span className="text-ink-400">নিষ্ক্রিয়</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
