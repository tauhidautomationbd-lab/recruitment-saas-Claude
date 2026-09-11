"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/ui";

const TEMPLATE_OPTIONS = [
  { value: "interview_invite", label: "Interview Invitation" },
  { value: "rejection", label: "Rejection" },
  { value: "selection", label: "Selection / Offer" },
];

export default function ComposeEmailPage({ params }: { params: { applicationId: string } }) {
  const router = useRouter();
  const [templateType, setTemplateType] = useState("interview_invite");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    const res = await fetch(`/api/hr/applications/${params.applicationId}/generate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateType }),
    });

    const result = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setError(result.error || "Draft তৈরি করতে সমস্যা হয়েছে");
      return;
    }

    setSubject(result.subject);
    setBody(result.body);
  }

  async function handleSend() {
    setSending(true);
    setError(null);

    const res = await fetch(`/api/hr/applications/${params.applicationId}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, htmlBody: body, templateType }),
    });

    const result = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(result.error || "Email পাঠাতে সমস্যা হয়েছে");
      return;
    }

    setSent(true);
    setTimeout(() => router.back(), 1500);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className={`${ui.pageTitle} mb-2`}>Candidate-কে Email পাঠান</h1>
      <p className="mb-6 text-sm text-ink-500">
        AI প্রথমে একটা draft তৈরি করবে — পাঠানোর আগে আপনি চাইলে সম্পাদনা করে নিতে পারবেন।
      </p>

      <div className={`${ui.card} space-y-4`}>
        <div>
          <label className={ui.label}>Email ধরন</label>
          <select value={templateType} onChange={(e) => setTemplateType(e.target.value)} className={ui.input}>
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleGenerate} disabled={generating} className={ui.btnSecondary}>
          {generating ? "Draft তৈরি হচ্ছে..." : "🤖 AI Draft তৈরি করুন"}
        </button>

        {subject && (
          <>
            <div>
              <label className={ui.label}>Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>Body (HTML)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className={ui.input} />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {sent && <p className="text-sm text-emerald-600">Email পাঠানো হয়েছে!</p>}

        {subject && (
          <button onClick={handleSend} disabled={sending} className={`${ui.btnPrimary} w-full`}>
            {sending ? "পাঠানো হচ্ছে..." : "Approve করে পাঠান"}
          </button>
        )}
      </div>
    </div>
  );
}
