"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("দুটো পাসওয়ার্ড মিলছে না।");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/hr/login"), 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold text-ink-900">নতুন পাসওয়ার্ড সেট করুন</h1>
        </div>

        {success ? (
          <div className={`${ui.card} text-center`}>
            <p className="text-sm text-emerald-600">পাসওয়ার্ড বদলে গেছে! লগইন পেজে নিয়ে যাচ্ছি...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
            <div>
              <label className={ui.label}>নতুন পাসওয়ার্ড</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={ui.input}
              />
            </div>
            <div>
              <label className={ui.label}>পাসওয়ার্ড আবার লিখুন</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={ui.input}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
              {loading ? "সেভ হচ্ছে..." : "পাসওয়ার্ড বদলান"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
