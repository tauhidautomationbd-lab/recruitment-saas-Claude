"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

export default function HrLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();

    if (!profile || profile.role === "super_admin") {
      setError("এই লগইন শুধুমাত্র company HR ইউজারদের জন্য।");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/hr/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold text-ink-900">Client HR Login</h1>
          <p className="mt-1 text-sm text-ink-500">আপনার company account-এ প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleLogin} className={`${ui.card} space-y-4`}>
          <div>
            <label className={ui.label}>ইমেইল</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={ui.input}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
            {loading ? "লগইন হচ্ছে..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
