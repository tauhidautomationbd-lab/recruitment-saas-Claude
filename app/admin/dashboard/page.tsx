import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22 }}>Super Admin — All Companies</h1>
        <Link
          href="/admin/dashboard/add-company"
          style={{ padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 6, textDecoration: "none", fontSize: 14 }}
        >
          + Add Company
        </Link>
      </div>

      <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Company</th>
            <th style={{ padding: 8 }}>Plan</th>
            <th style={{ padding: 8 }}>মূল্য</th>
            <th style={{ padding: 8 }}>যোগাযোগ</th>
            <th style={{ padding: 8 }}>মেয়াদ শেষ</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {companies?.map((c) => {
            const expired = isExpired(c.subscription_end_date);
            const expiringSoon = isExpiringSoon(c.subscription_end_date);
            return (
              <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{c.name}</td>
                <td style={{ padding: 8 }}>{c.subscription_plan}</td>
                <td style={{ padding: 8 }}>{c.subscription_price ? `৳${c.subscription_price}` : "-"}</td>
                <td style={{ padding: 8 }}>
                  {c.contact_email && <div>{c.contact_email}</div>}
                  {c.contact_phone && <div style={{ color: "#666" }}>{c.contact_phone}</div>}
                  {!c.contact_email && !c.contact_phone && "-"}
                </td>
                <td style={{ padding: 8, color: expired ? "#c00" : expiringSoon ? "#b58900" : "inherit" }}>
                  {c.subscription_end_date || "-"}
                  {expired && " (মেয়াদ শেষ)"}
                  {!expired && expiringSoon && " (শীঘ্রই শেষ হবে)"}
                </td>
                <td style={{ padding: 8 }}>{c.subscription_status}</td>
              </tr>
            );
          })}
          {(!companies || companies.length === 0) && (
            <tr>
              <td colSpan={6} style={{ padding: 16, color: "#888", textAlign: "center" }}>
                এখনো কোনো company নেই — "+ Add Company" দিয়ে প্রথমটা যোগ করুন
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
