"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ui } from "@/lib/ui";

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
    <div className="mx-auto max-w-md">
      <h1 className={`${ui.pageTitle} mb-6`}>Interview Schedule করুন</h1>

      <form onSubmit={handleSubmit} className={`${ui.card} space-y-4`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label}>তারিখ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={ui.input} />
          </div>
          <div>
            <label className={ui.label}>সময়</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={ui.input} />
          </div>
        </div>

        <div>
          <label className={ui.label}>Location / Meeting Link</label>
          <input
            value={locationOrLink}
            onChange={(e) => setLocationOrLink(e.target.value)}
            placeholder="অফিস ঠিকানা অথবা Zoom/Meet link"
            className={ui.input}
          />
        </div>

        <div>
          <label className={ui.label}>Interviewer</label>
          <select value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)} className={ui.input}>
            <option value="">-- নির্বাচন করুন (ঐচ্ছিক) --</option>
            {interviewers.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
          {loading ? "সেভ হচ্ছে..." : "Interview Confirm করুন"}
        </button>
      </form>
    </div>
  );
}
