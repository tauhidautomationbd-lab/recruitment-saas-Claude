import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, subscription_plan, subscription_status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22 }}>Super Admin — All Companies</h1>
        <Link
          href="/admin/dashboard/add-company"
          style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
        >
          + Add Company
        </Link>
      </div>

      <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Company</th>
            <th style={{ padding: 8 }}>Plan</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {companies?.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{c.name}</td>
              <td style={{ padding: 8 }}>{c.subscription_plan}</td>
              <td style={{ padding: 8 }}>{c.subscription_status}</td>
            </tr>
          ))}
          {(!companies || companies.length === 0) && (
            <tr>
              <td colSpan={3} style={{ padding: 16, color: "#888", textAlign: "center" }}>
                এখনো কোনো company নেই — "+ Add Company" দিয়ে প্রথমটা যোগ করুন
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
