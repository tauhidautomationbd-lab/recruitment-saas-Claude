"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

export default function AdminLoginPage() {
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

    if (!profile || profile.role !== "super_admin") {
      setError("এই লগইন শুধুমাত্র Super Admin-এর জন্য।");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white text-lg font-bold text-ink-900">
            R
          </div>
          <h1 className="text-lg font-semibold text-white">Super Admin Login</h1>
          <p className="mt-1 text-sm text-ink-400">Platform operator access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-ink-800 bg-ink-900 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-300">ইমেইল</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-300">পাসওয়ার্ড</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
            {loading ? "লগইন হচ্ছে..." : "Login"}
          </button>

          <p className="text-center text-sm">
            <Link href="/forgot-password" className="text-ink-400 hover:text-white hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
