"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500 text-lg font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold text-ink-900">পাসওয়ার্ড ভুলে গেছেন?</h1>
          <p className="mt-1 text-sm text-ink-500">ইমেইল দিন, একটা reset link পাঠিয়ে দেব</p>
        </div>

        {sent ? (
          <div className={`${ui.card} text-center`}>
            <p className="text-sm text-ink-800">
              <b>{email}</b> ঠিকানায় একটা reset link পাঠানো হয়েছে। ইনবক্স (এবং Spam ফোল্ডার) চেক করুন।
            </p>
            <Link href="/hr/login" className={`${ui.btnPrimary} mt-4 inline-flex`}>
              লগইন পেজে ফিরে যান
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
            <div>
              <label className={ui.label}>ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={ui.input}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
              {loading ? "পাঠানো হচ্ছে..." : "Reset Link পাঠান"}
            </button>

            <p className="text-center text-sm text-ink-500">
              <Link href="/hr/login" className="text-brand-600 hover:underline">
                লগইন পেজে ফিরে যান
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
