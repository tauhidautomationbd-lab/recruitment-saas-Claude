"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ui } from "@/lib/ui";

export default function AddCompanyPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("trial");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
  const [hrFullName, setHrFullName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        subscriptionPlan,
        contactEmail,
        contactPhone,
        subscriptionPrice: subscriptionPrice ? Number(subscriptionPrice) : null,
        subscriptionStartDate: subscriptionStartDate || null,
        subscriptionEndDate: subscriptionEndDate || null,
        hrFullName,
        hrEmail,
        hrPassword,
      }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "একটা সমস্যা হয়েছে");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/dashboard"), 1200);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/dashboard" className="text-sm text-ink-500 hover:text-ink-700">
        ← সব Company-তে ফিরে যান
      </Link>
      <h1 className={`${ui.pageTitle} mt-3 mb-6`}>নতুন Company যোগ করুন</h1>

      <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
        <div>
          <label className={ui.label}>Company নাম</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={ui.input} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label}>যোগাযোগের ইমেইল</label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>যোগাযোগের ফোন</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="01XXXXXXXXX" className={ui.input} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label}>Subscription Plan</label>
            <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} className={ui.input}>
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className={ui.label}>প্যাকেজের মূল্য (টাকা)</label>
            <input
              type="number"
              value={subscriptionPrice}
              onChange={(e) => setSubscriptionPrice(e.target.value)}
              placeholder="যেমন 5000"
              className={ui.input}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label}>শুরুর তারিখ</label>
            <input
              type="date"
              value={subscriptionStartDate}
              onChange={(e) => setSubscriptionStartDate(e.target.value)}
              className={ui.input}
            />
          </div>
          <div>
            <label className={ui.label}>শেষ হওয়ার তারিখ</label>
            <input type="date" value={subscriptionEndDate} onChange={(e) => setSubscriptionEndDate(e.target.value)} className={ui.input} />
          </div>
        </div>

        <hr className="border-ink-100" />
        <p className="text-xs text-ink-500">এই company-র প্রথম HR Admin ইউজার</p>

        <div>
          <label className={ui.label}>HR-এর নাম</label>
          <input value={hrFullName} onChange={(e) => setHrFullName(e.target.value)} className={ui.input} />
        </div>
        <div>
          <label className={ui.label}>HR-এর ইমেইল</label>
          <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} required className={ui.input} />
        </div>
        <div>
          <label className={ui.label}>সাময়িক পাসওয়ার্ড</label>
          <input type="text" value={hrPassword} onChange={(e) => setHrPassword(e.target.value)} required minLength={6} className={ui.input} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">তৈরি হয়ে গেছে! Dashboard-এ ফেরত যাচ্ছি...</p>}

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
          {loading ? "তৈরি হচ্ছে..." : "Company তৈরি করুন"}
        </button>
      </form>
    </div>
  );
}
