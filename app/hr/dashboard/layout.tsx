import { createSupabaseServerClient } from "@/lib/supabase-server";
import SidebarNav from "./SidebarNav";
import LogoutButton from "./LogoutButton";
import { roleLabel } from "@/lib/ui";

export default async function HrDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company_id")
    .eq("id", user?.id)
    .single();

  const { data: company } = await supabase
    .from("companies")
    .select("name, subscription_plan")
    .eq("id", profile?.company_id)
    .single();

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-ink-900 py-5">
        <div className="mb-6 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-white">
              R
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{company?.name || "Company"}</p>
              <p className="text-xs text-ink-400">{company?.subscription_plan} plan</p>
            </div>
          </div>
        </div>

        <SidebarNav role={profile?.role} />

        <div className="mt-auto space-y-2 border-t border-ink-800 px-3 pt-4">
          <div className="px-3">
            <p className="truncate text-sm text-white">{profile?.full_name}</p>
            <p className="text-xs text-ink-400">{roleLabel[profile?.role || ""] || profile?.role}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
