"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

export default function InterviewQuestionsPage({ params }: { params: { applicationId: string } }) {
  const [questions, setQuestions] = useState<{ technical: string[]; behavioral: string[]; competency: string[] } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/hr/applications/${params.applicationId}/interview-questions`, {
      method: "POST",
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "প্রশ্ন তৈরি করতে সমস্যা হয়েছে");
      return;
    }

    setQuestions(result);
  }

  const sections = questions
    ? [
        { label: "Technical প্রশ্ন", items: questions.technical },
        { label: "Behavioral প্রশ্ন", items: questions.behavioral },
        { label: "Competency প্রশ্ন", items: questions.competency },
      ]
    : [];

  return (
    <div className="mx-auto max-w-xl">
      <h1 className={`${ui.pageTitle} mb-2`}>Interview প্রশ্ন</h1>
      <p className="mb-6 text-sm text-ink-500">Job ও candidate-এর প্রোফাইল অনুযায়ী AI-তৈরি প্রশ্নের তালিকা</p>

      <button onClick={handleGenerate} disabled={loading} className={ui.btnPrimary}>
        {loading ? "তৈরি হচ্ছে..." : "🤖 প্রশ্ন তৈরি করুন"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {sections.length > 0 && (
        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <div key={section.label} className={ui.card}>
              <h2 className={`${ui.sectionTitle} mb-3`}>{section.label}</h2>
              <ol className="list-inside list-decimal space-y-2 text-sm text-ink-800">
                {section.items?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
