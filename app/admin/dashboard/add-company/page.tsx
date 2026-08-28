"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCompanyPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("trial");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
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
    setTimeout(() => router.push("/admin/dashboard"), 1500);
  }

  const inputStyle = { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 };

  return (
    <main style={{ padding: 40, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>নতুন Company যোগ করুন</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Company নাম
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          যোগাযোগের ইমেইল
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={inputStyle} />
        </label>

        <label>
          যোগাযোগের ফোন
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={inputStyle} placeholder="01XXXXXXXXX" />
        </label>

        <label>
          Subscription Plan
          <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)} style={inputStyle}>
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </label>

        <label>
          প্যাকেজের মূল্য (টাকা)
          <input
            type="number"
            value={subscriptionPrice}
            onChange={(e) => setSubscriptionPrice(e.target.value)}
            style={inputStyle}
            placeholder="যেমন 5000"
          />
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ flex: 1 }}>
            শুরুর তারিখ
            <input
              type="date"
              value={subscriptionStartDate}
              onChange={(e) => setSubscriptionStartDate(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ flex: 1 }}>
            শেষ হওয়ার তারিখ
            <input
              type="date"
              value={subscriptionEndDate}
              onChange={(e) => setSubscriptionEndDate(e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #eee" }} />
        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
          এই company-র প্রথম HR Admin ইউজার (তারা প্রথমবার লগইন করে আরও HR ইউজার যোগ করতে পারবে)
        </p>

        <label>
          HR-এর নাম
          <input value={hrFullName} onChange={(e) => setHrFullName(e.target.value)} style={inputStyle} />
        </label>

        <label>
          HR-এর ইমেইল
          <input type="email" value={hrEmail} onChange={(e) => setHrEmail(e.target.value)} required style={inputStyle} />
        </label>

        <label>
          সাময়িক পাসওয়ার্ড
          <input type="text" value={hrPassword} onChange={(e) => setHrPassword(e.target.value)} required minLength={6} style={inputStyle} />
        </label>

        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: "green", fontSize: 14 }}>তৈরি হয়ে গেছে! Dashboard-এ ফেরত যাচ্ছি...</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, borderRadius: 6, background: "#111", color: "#fff", border: "none", marginTop: 8 }}
        >
          {loading ? "তৈরি হচ্ছে..." : "Company তৈরি করুন"}
        </button>
      </form>
    </main>
  );
}
