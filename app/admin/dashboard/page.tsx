import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ui } from "@/lib/ui";

function isExpired(endDate: string | null) {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}
function isExpiringSoon(endDate: string | null) {
  if (!endDate) return false;
  const days = (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: companies } = await supabase
    .from("companies")
    .select(
      "id, name, subscription_plan, subscription_status, contact_email, contact_phone, subscription_price, subscription_end_date, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={ui.pageTitle}>সব কোম্পানি</h1>
          <p className="mt-1 text-sm text-ink-500">{companies?.length || 0}টা active client</p>
        </div>
        <Link href="/admin/dashboard/add-company" className={ui.btnPrimary}>
          + Add Company
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ink-50">
              <th className={ui.tableHeadCell}>Company</th>
              <th className={ui.tableHeadCell}>Plan</th>
              <th className={ui.tableHeadCell}>মূল্য</th>
              <th className={ui.tableHeadCell}>যোগাযোগ</th>
              <th className={ui.tableHeadCell}>মেয়াদ শেষ</th>
              <th className={ui.tableHeadCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((c) => {
              const expired = isExpired(c.subscription_end_date);
              const expiringSoon = isExpiringSoon(c.subscription_end_date);
              return (
                <tr key={c.id} className={ui.tableRow}>
                  <td className={`${ui.tableCell} font-medium text-ink-900`}>{c.name}</td>
                  <td className={ui.tableCell}>
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                      {c.subscription_plan}
                    </span>
                  </td>
                  <td className={ui.tableCell}>{c.subscription_price ? `৳${c.subscription_price}` : "—"}</td>
                  <td className={`${ui.tableCell} text-xs`}>
                    {c.contact_email && <div>{c.contact_email}</div>}
                    {c.contact_phone && <div className="text-ink-500">{c.contact_phone}</div>}
                    {!c.contact_email && !c.contact_phone && "—"}
                  </td>
                  <td className={ui.tableCell}>
                    <span className={expired ? "text-red-600" : expiringSoon ? "text-amber-600" : "text-ink-700"}>
                      {c.subscription_end_date || "—"}
                      {expired && " (মেয়াদ শেষ)"}
                      {!expired && expiringSoon && " (শীঘ্রই শেষ হবে)"}
                    </span>
                  </td>
                  <td className={ui.tableCell}>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {c.subscription_status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!companies || companies.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                  এখনো কোনো company নেই — "+ Add Company" দিয়ে প্রথমটা যোগ করুন
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
