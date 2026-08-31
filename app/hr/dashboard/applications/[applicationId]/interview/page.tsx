"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ScheduleInterviewPage({ params }: { params: { applicationId: string } }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [interviewers, setInterviewers] = useState<{ id: string; full_name: string }[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [interviewerId, setInterviewerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputStyle = { width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 };

  useEffect(() => {
    async function loadInterviewers() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user!.id).single();

      const { data: teamMembers } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", profile?.company_id);

      setInterviewers(teamMembers || []);
    }
    loadInterviewers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    const res = await fetch(`/api/hr/applications/${params.applicationId}/schedule-interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt, locationOrLink, interviewerId: interviewerId || null }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "সমস্যা হয়েছে");
      return;
    }

    router.push("/hr/dashboard");
  }

  return (
    <main style={{ padding: 40, maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Interview Schedule করুন</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <label style={{ flex: 1 }}>
            তারিখ
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={inputStyle} />
          </label>
          <label style={{ flex: 1 }}>
            সময়
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={inputStyle} />
          </label>
        </div>

        <label>
          Location / Meeting Link
          <input
            value={locationOrLink}
            onChange={(e) => setLocationOrLink(e.target.value)}
            placeholder="অফিস ঠিকানা অথবা Zoom/Meet link"
            style={inputStyle}
          />
        </label>

        <label>
          Interviewer
          <select value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)} style={inputStyle}>
            <option value="">-- নির্বাচন করুন (ঐচ্ছিক) --</option>
            {interviewers.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </label>

        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, borderRadius: 6, background: "#111", color: "#fff", border: "none", marginTop: 8 }}
        >
          {loading ? "সেভ হচ্ছে..." : "Interview Confirm করুন"}
        </button>
      </form>
    </main>
  );
}
