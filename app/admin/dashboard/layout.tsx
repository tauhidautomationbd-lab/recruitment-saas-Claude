import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminLogoutButton from "./AdminLogoutButton";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).single();

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-ink-950 py-5">
        <div className="mb-6 flex items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-ink-900">
            R
          </div>
          <div>
            <p className="text-sm font-medium text-white">Super Admin</p>
            <p className="text-xs text-ink-500">Platform control</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <div className="flex items-center gap-2.5 rounded-md bg-brand-500 px-3 py-2 text-sm text-white">
            <span aria-hidden>🏢</span> সব কোম্পানি
          </div>
        </nav>

        <div className="mt-auto space-y-2 border-t border-ink-800 px-3 pt-4">
          <p className="truncate px-3 text-sm text-white">{profile?.full_name}</p>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
