import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  // is_super_admin() পলিসির কারণে এই ইউজার সব company দেখতে পারবে
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, subscription_plan, subscription_status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22 }}>Super Admin — All Companies</h1>

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
        </tbody>
      </table>
    </main>
  );
}
